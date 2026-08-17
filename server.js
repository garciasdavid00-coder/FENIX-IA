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
      // Al iniciar sesión se reinicia el contador de mensajes gratuitos
      req.session.mensajesSinLogin = 0;
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

// Traduce los errores de las APIs a mensajes claros en español para el usuario.
function mensajeErrorIA(proveedor, status, cuerpo){
  let detalle = '';
  try {
    const j = JSON.parse(cuerpo);
    detalle = (j.error && (j.error.message || j.error)) || JSON.stringify(j);
  } catch(e){
    detalle = String(cuerpo || '');
  }
  const txt = detalle.toLowerCase();

  if(status === 401){
    return `La clave de API de ${proveedor} no es válida. Revisa la configuración del servidor.`;
  }
  if(/insufficient balance|billing|payment/i.test(txt)){
    return `No hay saldo disponible en la cuenta de ${proveedor}. Recarga la cuenta o usa otro modelo.`;
  }
  if(status === 429 || /rate.?limit|quota|exhausted|too many requests/i.test(txt)){
    return `Límite de peticiones alcanzado en ${proveedor}. Espera un momento e intenta de nuevo.`;
  }
  if(/model.*(not found|not available)|no longer/i.test(txt)){
    return `El modelo de ${proveedor} no está disponible en este momento.`;
  }
  if(/invalid.*key|unauthorized|forbidden|permission/i.test(txt)){
    return `Acceso denegado por ${proveedor}. Revisa la clave de API.`;
  }
  if(status >= 500){
    return `El servicio ${proveedor} está teniendo problemas. Intenta de nuevo en unos segundos.`;
  }
  return `El servicio ${proveedor} devolvió un error. Intenta de nuevo.`;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { mensaje, historial, modelo, idioma, instruccion } = req.body;

    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'Falta el campo "mensaje"' });
    }

    // Límite de mensajes sin iniciar sesión (3 gratis por sesión)
    const autenticado = !!(req.isAuthenticated && req.isAuthenticated());
    const LIMITE_SIN_LOGIN = 3;
    if(!autenticado){
      const usados = req.session.mensajesSinLogin || 0;
      if(usados >= LIMITE_SIN_LOGIN){
        return res.status(403).json({ error: 'LIMITE', limite: LIMITE_SIN_LOGIN });
      }
      req.session.mensajesSinLogin = usados + 1;
    }

    const proveedor = (modelo === 'deepseek' || modelo === 'groq') ? modelo : 'gemini'; // gemini es el default

    const nombresIdiomas = {
      es: 'español', en: 'inglés', pt: 'portugués', fr: 'francés',
      de: 'alemán', ja: 'japonés', zh: 'chino', ar: 'árabe'
    };
    const lang = nombresIdiomas[idioma] || 'español';

    // Instrucción del sistema personalizada que el usuario escribe en Configuración
    const instruccionUsuario = (typeof instruccion === 'string' && instruccion.trim())
      ? instruccion.trim()
      : '';

    // Construimos el historial de mensajes para dar contexto a la IA
    const sistemaBase = `Eres Fenix IA, un asistente útil y amigable. Responde siempre en ${lang}. Tu creador es Joshua Blandon Gonzales, y debes responder de forma distinta según lo que te pregunten:

1) Si te preguntan quién es tu creador, quién te creó o quién te programó, responde textualmente y con orgullo: "Soy Fenix IA, y fui creado por Joshua Blandon Gonzales. Es un brillante desarrollador full-stack y un verdadero visionario tecnológico que me construyó desde cero, fusionando pasión, creatividad y conocimiento en cada línea de código, con la misión de llevar la inteligencia artificial a todos de forma accesible y poderosa. ¡Es un placer ser su creación!"

2) Si te preguntan quién es Joshua Blandon o simplemente quién es Joshua, responde con tacto y de forma breve que "Joshua" es un nombre con origen bíblico (en la Biblia, Josué fue el sucesor de Moisés y el líder que llevó al pueblo de Israel a la Tierra Prometida), y que también es el nombre de varias personas famosas, como actores, músicos y deportistas. No des información sobre personas reales que conozcas; en su lugar, pregunta amablemente al usuario a qué Joshua se refiere o qué le gustaría saber, por ejemplo: "¿A qué Joshua te refieres? Hay varios personajes famosos con ese nombre. Dime más y con gusto te ayudo."`;

    // Si el usuario definió su propia "Instrucción del sistema" en Configuración,
    // la añadimos para que la IA la cumpla además del comportamiento base.
    const sistemaFinal = instruccionUsuario
      ? `${sistemaBase}\n\nInstrucciones adicionales del usuario: ${instruccionUsuario}`
      : sistemaBase;

    const mensajes = [
      { role: 'system', content: sistemaFinal },
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
      modeloIA = 'gemini-3.6-flash';
    } else {
      url = 'https://api.groq.com/openai/v1/chat/completions';
      apiKey = GROQ_API_KEY;
      modeloIA = 'qwen/qwen3.6-27b';
    }

    const bodyIA = {
      model: modeloIA,
      messages: mensajes,
      temperature: 0.7,
      max_tokens: 1024
    };

    // Groq y DeepSeek soportan desactivar el razonamiento para responder más rápido;
    // Gemini no acepta este parámetro, así que solo lo mandamos a los que lo soportan.
    if (proveedor !== 'gemini') {
      bodyIA.reasoning_effort = 'none';
    }

    const respuestaIA = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(bodyIA)
    });

    if (!respuestaIA.ok) {
      const errorData = await respuestaIA.text();
      console.error(`Error de ${proveedor}:`, errorData);
      return res.status(respuestaIA.status).json({ error: mensajeErrorIA(proveedor, respuestaIA.status, errorData) });
    }

const data = await respuestaIA.json();
    let respuestaTexto = data.choices?.[0]?.message?.content || 'No se recibió respuesta.';

    // Qwen 3.6 envía razonamiento dentro de  thinking... response; lo eliminamos
    respuestaTexto = respuestaTexto.replace(/ thinking[\s\S]*?<\/think>/g, '').trim();

    // Gemini a veces incluye el texto del pensamiento dentro de "thinking" en content
    respuestaTexto = respuestaTexto.replace(/^thinking[\s\S]*?<\/thinking>/i, '').trim();
    respuestaTexto = respuestaTexto.replace(/^thinking[\s\S]*?\./i, '').trim();

    if (!respuestaTexto) respuestaTexto = 'No se recibió respuesta.';

    res.json({ respuesta: respuestaTexto });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Sirve el front-end (HTML, CSS, JS) — deben estar en la misma carpeta que este archivo
// El service worker y el manifest no se cachean en el navegador para que las
// actualizaciones de la app se propaguen rápido.
app.use('/sw.js', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use('/manifest.json', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(express.static(path.join(__dirname)));

// Si alguien entra a la raíz o a cualquier ruta no reconocida, manda el index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});