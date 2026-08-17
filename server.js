require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET || 'cambia_esto_por_algo_secreto';
const enProduccion = process.env.NODE_ENV === 'production';

if (!GROQ_API_KEY) {
  console.error('ERROR: No se encontró GROQ_API_KEY en el archivo .env');
  console.error('Crea un archivo .env en esta carpeta con: GROQ_API_KEY=tu_clave_aqui');
  process.exit(1);
}

if (!DEEPSEEK_API_KEY) {
  console.warn('AVISO: No configuraste DEEPSEEK_API_KEY en .env — la opción DeepSeek no va a funcionar hasta que la agregues.');
}

if (!GEMINI_API_KEY) {
  console.warn('AVISO: No configuraste GEMINI_API_KEY en .env — la opción Gemini no va a funcionar hasta que la agregues.');
}

const googleHabilitado = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
if (!googleHabilitado) {
  console.warn('AVISO: No configuraste GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en .env');
  console.warn('El login con Google no va a funcionar hasta que los agregues.');
}

// Necesario en Render (y cualquier hosting detrás de un proxy) para que
// Express detecte correctamente que la conexión es HTTPS.
app.set('trust proxy', 1);

app.use(cors({ credentials: true }));
app.use(express.json());

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    secure: enProduccion,            // la cookie solo viaja por HTTPS en producción
    sameSite: 'lax'                  // front-end y backend viven en el mismo dominio, así que 'lax' basta
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Guardamos solo lo básico del usuario en la sesión
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

if (googleHabilitado) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    // Aquí en el futuro puedes guardar/buscar el usuario en una base de datos.
    // Por ahora solo pasamos sus datos básicos de Google.
    const usuario = {
      id: profile.id,
      nombre: profile.displayName,
      correo: profile.emails?.[0]?.value || null,
      foto: profile.photos?.[0]?.value || null
    };
    return done(null, usuario);
  }));

  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      // Login exitoso, regresa a la página principal (mismo servidor, misma URL)
      res.redirect('/');
    }
  );
}

// El front-end usa esto para saber si hay alguien conectado
app.get('/api/usuario-actual', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ autenticado: true, usuario: req.user });
  } else {
    res.json({ autenticado: false, usuario: null });
  }
});

app.post('/api/logout', (req, res) => {
  req.logout(() => {
    res.json({ ok: true });
  });
});

// Guarda el historial de conversación en memoria por sesión simple (no persistente)
// Para producción real, esto debería ir en una base de datos.

app.post('/api/chat', async (req, res) => {
  try {
    const { mensaje, historial, modelo } = req.body;

    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'Falta el campo "mensaje"' });
    }

    const proveedor = (modelo === 'deepseek' || modelo === 'gemini') ? modelo : 'groq'; // groq es el default

    // Construimos el historial de mensajes para dar contexto a la IA
    const mensajes = [
      { role: 'system', content: 'Eres un asistente útil y amigable que responde en español.' },
      ...(Array.isArray(historial) ? historial : []),
      { role: 'user', content: mensaje }
    ];

    let url, apiKey, modeloIA;

    if (proveedor === 'deepseek') {
      if (!DEEPSEEK_API_KEY) {
        return res.status(400).json({ error: 'DeepSeek no está configurado en el servidor todavía.' });
      }
      url = 'https://api.deepseek.com/chat/completions';
      apiKey = DEEPSEEK_API_KEY;
      modeloIA = 'deepseek-v4-flash'; // el nombre viejo "deepseek-chat" se retiró el 24 de julio de 2026
    } else if (proveedor === 'gemini') {
      if (!GEMINI_API_KEY) {
        return res.status(400).json({ error: 'Gemini no está configurado en el servidor todavía.' });
      }
      // Google ofrece un endpoint compatible con el formato de OpenAI, así que
      // funciona con la misma estructura de petición que Groq y DeepSeek.
      url = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      apiKey = GEMINI_API_KEY;
      modeloIA = 'gemini-3-flash-preview'; // modelo con capa gratuita confirmada (ago 2026); si Google lo renombra, actualiza este valor
    } else {
      url = 'https://api.groq.com/openai/v1/chat/completions';
      apiKey = GROQ_API_KEY;
      modeloIA = 'llama-3.3-70b-versatile';
    }

    const respuestaIA = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modeloIA,
        messages: mensajes,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!respuestaIA.ok) {
      const errorData = await respuestaIA.text();
      console.error(`Error de ${proveedor}:`, errorData);
      return res.status(respuestaIA.status).json({ error: 'Error al consultar la IA' });
    }

    const data = await respuestaIA.json();
    const respuestaTexto = data.choices?.[0]?.message?.content || 'No se recibió respuesta.';

    res.json({ respuesta: respuestaTexto });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Sirve el front-end (HTML, CSS, JS) — deben estar en la misma carpeta que este archivo
app.use(express.static(path.join(__dirname)));

// Si alguien entra a la raíz o a cualquier ruta no reconocida, manda el index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});