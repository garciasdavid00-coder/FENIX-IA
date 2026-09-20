require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { selectModel } = require('./modelRouter');
const { router: imagenesRealesRouter, buscarImagenReal } = require('./routes/imagenesReales');
const documentosRouter = require('./routes/documentos');
const memory = require('./backend/memoryManager');
const chatEngine = require('./backend/chatEngine');
const webSearch = require('./backend/webSearch');
const whatsappRouter = require('./routes/whatsapp');
const moderationMiddleware = require('./backend/moderationMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
// Seguridad: sin SESSION_SECRET el servidor NO arranca. Usar un valor por
// defecto permitiría forjar cookies de sesión. Si este error aparece, genera
// una con: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
if (!SESSION_SECRET) {
  console.error('ERROR: No se encontró SESSION_SECRET en el archivo .env');
  console.error('El servidor NO va a arrancar sin un secreto de sesión fuerte.');
  console.error('Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  console.error('y agrégalo al .env como: SESSION_SECRET=<ese valor>');
  process.exit(1);
}
if (SESSION_SECRET === 'cambia_esto_por_algo_secreto' || SESSION_SECRET === 'cambia_esto_por_algo_secreto_muy_largo') {
  console.error('ERROR: SESSION_SECRET sigue usando el valor de ejemplo (público e inseguro).');
  console.error('Genera uno nuevo: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  process.exit(1);
}
const enProduccion = process.env.NODE_ENV === 'production';
// Hasta que exista un proveedor de pagos real (Stripe/PayPal), los planes de
// pago permanecen deshabilitados: fail-closed por defecto (PAGOS_HABILITADOS=true
// solo cuando el flujo de pago esté integrado).
const PAGOS_HABILITADOS = process.env.PAGOS_HABILITADOS === 'true';

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

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Lista de orígenes permitidos para peticiones con credenciales (cookies)
const ORIGENES_BASE = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL
].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

// En local, el propio Express sirve la app en :3001 (mismo origen) y además
// se permite el FRONTEND_URL definido en .env. En producción/desarrollo
// remoto, FRONTEND_URL indica el origen del frontend real.
const origenesPermitidos = enProduccion
  ? ORIGENES_BASE
  : [...ORIGENES_BASE, `http://localhost:${process.env.PORT || 3001}`, `http://127.0.0.1:${process.env.PORT || 3001}`];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin cabecera origin (curl, scripts internos, servidor)
    if (!origin) return callback(null, true);

    // Orígenes permitidos explícitos
    if (origenesPermitidos.includes(origin)) return callback(null, true);

    // Permitir cualquier dominio o subdominio alojado en Render (*.onrender.com)
    if (/^https?:\/\/.*\.onrender\.com$/i.test(origin)) return callback(null, true);

    // Permitir localhost o 127.0.0.1 en cualquier puerto
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return callback(null, true);

    console.warn('[CORS] Origen no permitido:', origin);
    // callback(null, false) rechaza CORS de forma limpia sin generar Error 500
    callback(null, false);
  },
  credentials: true
}));
// El `verify` guarda el cuerpo crudo (req.rawBody) para poder verificar la
// firma X-Hub-Signature-256 de los webhooks de WhatsApp.
app.use(express.json({ limit: '5mb', verify: (req, res, buf) => { req.rawBody = buf; } }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    secure: enProduccion,            // HTTPS en producción, HTTP en localhost
    sameSite: enProduccion ? 'none' : 'lax' // 'none' para cross-site en prod, 'lax' para localhost
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Guardamos solo lo básico del usuario en la sesión
passport.serializeUser((user, done) => done(null, user));

// Al recuperar la sesión, refrescamos el plan desde la base de datos
// (si está disponible) para que los cambios se reflejen al instante.
passport.deserializeUser(async (user, done) => {
  try {
    const usuarioBD = await db.obtenerUsuarioPorGoogleId(user.id);
    if (usuarioBD) {
      done(null, { ...user, plan: usuarioBD.plan, planDesde: usuarioBD.plan_desde, planHasta: usuarioBD.plan_hasta });
    } else {
      done(null, user);
    }
  } catch (e) {
    done(null, user); // si la BD falla, seguimos con los datos de la sesión
  }
});

if (googleHabilitado) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Guardamos o actualizamos el usuario en la base de datos.
      const usuarioBD = await db.obtenerOCrearUsuario(profile.id, {
        nombre: profile.displayName,
        correo: profile.emails?.[0]?.value || null,
        foto: profile.photos?.[0]?.value || null
      });
      const usuario = {
        id: profile.id,
        nombre: profile.displayName,
        correo: profile.emails?.[0]?.value || null,
        foto: profile.photos?.[0]?.value || null,
        plan: usuarioBD?.plan || 'gratis',
        planDesde: usuarioBD?.plan_desde || null,
        planHasta: usuarioBD?.plan_hasta || null
      };
      return done(null, usuario);
    } catch (e) {
      console.error('Error guardando el usuario en la BD:', e.message);
      // Si la BD falla, seguimos con los datos básicos de Google
      const usuario = {
        id: profile.id,
        nombre: profile.displayName,
        correo: profile.emails?.[0]?.value || null,
        foto: profile.photos?.[0]?.value || null,
        plan: 'gratis'
      };
      return done(null, usuario);
    }
  }));

  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
    (req, res) => {
      // Al iniciar sesión se reinicia el contador de mensajes gratuitos
      req.session.mensajesSinLogin = 0;
      // Login exitoso, redirige al frontend Next.js
      res.redirect(FRONTEND_URL);
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

// Endpoint GET /api/imagen-real (fotos reales de Wikimedia Commons).
// Ver routes/imagenesReales.js.
app.use(imagenesRealesRouter);

// Endpoint POST /api/documentos/generar (PDF con Puppeteer).
// Ver routes/documentos.js.
app.use(documentosRouter);

// Historial en la nube: devuelve los chats y proyectos de la cuenta logueada.
app.get('/api/sincronizar', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Debes iniciar sesión.' });
  }
  try {
    const datos = await db.obtenerDatos(req.user.id);
    res.json(datos || { chats: [], proyectos: [] });
  } catch (e) {
    console.error('Error al leer historial:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Guarda el historial completo de la cuenta logueada (snapshot).
app.post('/api/sincronizar', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Debes iniciar sesión.' });
  }
  const { chats, proyectos, borradoExplicito } = req.body || {};
  if (!Array.isArray(chats) || !Array.isArray(proyectos)) {
    return res.status(400).json({ error: 'Formato inválido.' });
  }
  try {
    await db.sincronizarDatos(req.user.id, { chats, proyectos, borradoExplicito });
    res.json({ ok: true });
  } catch (e) {
    console.error('Error al guardar historial:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Voz en tiempo real: token efímero para Gemini Live API.
// (Va directo aquí para no depender de carpetas extra en el repo.)
app.post('/api/voice-token', async (req, res) => {
  // Igual que el resto de endpoints protegidos: requiere sesión iniciada.
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Debes iniciar sesión para usar la voz en tiempo real.' });
  }
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini no está configurado en el servidor.' });
  }

  const ahora = Date.now();
  const expireTime = new Date(ahora + 30 * 60 * 1000).toISOString();      // 30 min
  const newSessionExpireTime = new Date(ahora + 60 * 1000).toISOString(); // 1 min

  try {
    // Pide a Google un token efímero de uso único (v1alpha).
    const respuesta = await fetch(
      'https://generativelanguage.googleapis.com/v1alpha/auth_tokens',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          uses: 1,
          expireTime,
          newSessionExpireTime
        })
      }
    );

    const data = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      console.error('Error creando token efímero:', JSON.stringify(data));
      return res.status(respuesta.status).json({ error: 'No se pudo crear el token de voz.' });
    }

    // El valor del token viene en data.name (p. ej. "auth_tokens/xxxx").
    const systemPromptVoz = chatEngine.obtenerSystemPrompt ? chatEngine.obtenerSystemPrompt('voz') : '';
    res.json({ token: data.name || data.token, expiresAt: expireTime, systemInstruction: systemPromptVoz });
  } catch (e) {
    console.error('Error en /api/voice-token:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Generación de imágenes con Pollinations.ai (gratis y sin API key).
// Devolvemos la URL con semilla fija: la misma URL vuelve a dar la misma
// imagen, así el historial guarda solo la dirección (no llena localStorage).
// AVISO: este generador por IA se usa SOLO para ilustraciones sueltas del
// chat. Los DOCUMENTOS usan fotos reales vía /api/documento-real.
app.post('/api/imagen', async (req, res) => {
  try {
    const prompt = ((req.body && req.body.prompt) || '').trim().slice(0, 500);
    if (!prompt) {
      return res.status(400).json({ error: 'Falta la descripción de la imagen.' });
    }

    const seed = Math.floor(Math.random() * 1e9);
    // El proxy /api/imagen-archivo quedó deprecado, así que devolvemos la
    // URL directa de Pollinations (mismo resultado gracias a la semilla).
    const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
      '?width=1024&height=1024&nologo=true&seed=' + seed;

    // Verificamos que la imagen se genera bien antes de responder al cliente.
    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), 90000);
    let respuesta;
    try {
      respuesta = await fetch(
        'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
        '?width=1024&height=1024&nologo=true&seed=' + seed,
        { signal: controlador.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const tipo = respuesta.headers.get('content-type') || '';
    if (!respuesta.ok || !tipo.startsWith('image/')) {
      console.error('Pollinations respondió', respuesta.status, tipo);
      return res.status(502).json({ error: 'No se pudo generar la imagen. Intenta de nuevo.' });
    }
    // Consumimos el cuerpo para liberar la conexión (Pollinations la cachea
    // y así la siguiente petición con la misma semilla responde más rápido).
    await respuesta.arrayBuffer().catch(() => {});

    res.json({ url });
  } catch (e) {
    console.error('Error en /api/imagen:', e.message);
    res.status(502).json({ error: 'No se pudo generar la imagen. Intenta de nuevo.' });
  }
});

/* ============================================================
   ENDPOINT VIEJO /api/imagen-archivo — DEPRECADO (no borrado)
   ------------------------------------------------------------
   Antes servía de intermediario (proxy) hacia Pollinations para
   las imágenes generadas con IA: con la misma pregunta y semilla
   Pollinations devolvía siempre la misma imagen, así podíamos
   cachearla en el navegador.

   Quedó fuera de uso porque los DOCUMENTOS ahora usan fotos
   REALES de Wikimedia Commons (ver /api/documento-real y
   routes/imagenesReales.js), y no queremos generar imágenes
   falsas para ilustrar datos reales.

   El código se conserva abajo por si lo necesitas otra vez:
   basta con descomentarlo.

app.get('/api/imagen-archivo', async (req, res) => {
  try {
    const prompt = ((req.query.q) || '').trim().slice(0, 500);
    if (!prompt) return res.status(400).end();
    const seed = /^\d{1,12}$/.test(req.query.s || '') ? req.query.s : '1';

    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), 90000);
    let r;
    try {
      r = await fetch(
        'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
        '?width=1024&height=1024&nologo=true&seed=' + seed,
        { signal: controlador.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const tipo = (r.headers.get('content-type') || '').split(';')[0];
    if (!r.ok || !tipo.startsWith('image/')) {
      console.error('Pollinations respondió', r.status, tipo, '(imagen-archivo)');
      return res.status(502).end();
    }
    const bytes = Buffer.from(await r.arrayBuffer());
    res.set('Content-Type', tipo);
    res.set('Cache-Control', 'public, max-age=604800');
    res.send(bytes);
  } catch (e) {
    console.error('Error en /api/imagen-archivo:', e.message);
    res.status(502).end();
  }
});
============================================================ */

// Plan del usuario conectado
app.get('/api/mi-plan', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.json({ autenticado: false, plan: 'gratis' });
  }
  res.json({
    autenticado: true,
    plan: req.user.plan || 'gratis',
    planDesde: req.user.planDesde || null,
    planHasta: req.user.planHasta || null
  });
});

// Cambia el plan del usuario (se llamará cuando exista el pago real).
// Por ahora lo dejamos listo para conectar con Stripe/PayPal después.
// Mientras PAGOS_HABILITADOS no sea "true", cualquier intento de cambiar a
// un plan de pago (pro/ultra) se rechaza con 501 ANTES de autenticar y de
// tocar la base de datos. Solo se permite volver a 'gratis' (downgrade).
app.post('/api/cambiar-plan', async (req, res) => {
  const { plan } = req.body || {};

  // Sin proveedor de pagos integrado no existen planes de pago.
  if (!PAGOS_HABILITADOS && (plan === 'pro' || plan === 'ultra')) {
    return res.status(501).json({ error: 'El cambio a un plan de pago no está disponible todavía. Falta integrar el proveedor de pagos.' });
  }

  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Debes iniciar sesión para cambiar de plan.' });
  }
  if (!['pro', 'ultra', 'gratis'].includes(plan)) {
    return res.status(400).json({ error: 'Plan no válido.' });
  }
  try {
    const usuarioBD = await db.actualizarPlan(req.user.id, plan, 1);
    if (!usuarioBD) {
      return res.status(500).json({ error: 'Base de datos no disponible.' });
    }
    req.user.plan = usuarioBD.plan;
    req.user.planDesde = usuarioBD.plan_desde;
    req.user.planHasta = usuarioBD.plan_hasta;
    res.json({ ok: true, plan: usuarioBD.plan, planHasta: usuarioBD.plan_hasta });
  } catch (e) {
    console.error('Error al cambiar el plan:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Guarda el historial de conversación en memoria por sesión simple (no persistente)
// Para producción real, esto debería ir en una base de datos.

// Los errores de las APIs del proveedor se traducen en backend/chatEngine.js
// (mensajeErrorIA), compartido con el bot de WhatsApp.

// Lee el stream SSE del proveedor (Groq/Gemini/DeepSeek) y llama onTexto
// por cada fragmento de contenido nuevo que llega. Si opciones.esActivo()
// devuelve false (cliente desconectado), corta la lectura para no gastar tokens.
async function leerStreamSSE(respuestaIA, onTexto, opciones){
  const reader = respuestaIA.body.getReader();
  if(opciones && opciones.setLector) opciones.setLector(reader);
  const dec = new TextDecoder();
  let buffer = '';

  function procesarLinea(linea){
    const l = linea.trim();
    if(!l.startsWith('data:')) return;
    const data = l.slice(5).trim();
    if(!data || data === '[DONE]') return;
    try {
      const json = JSON.parse(data);
      const delta = json.choices?.[0]?.delta?.content;
      if(delta) onTexto(delta);
    } catch(e){ /* línea inválida, ignorar */ }
  }

  while(true){
    if(opciones && opciones.esActivo && !opciones.esActivo()){
      try { await reader.cancel(); } catch(e){}
      break;
    }
    let r;
    try {
      r = await reader.read();
    } catch(e){ break; } // lector cancelado o conexión rota
    const { done, value } = r;
    if(done) break;
    buffer += dec.decode(value, { stream: true });
    let idx;
    while((idx = buffer.indexOf('\n')) !== -1){
      procesarLinea(buffer.slice(0, idx));
      buffer = buffer.slice(idx + 1);
    }
  }
  if(buffer.trim()) procesarLinea(buffer);
}

// Passthrough para que el frontend reciba las etiquetas <think> y las renderice.
function crearFiltroRazonamiento() {
  let emitido = '';
  return {
    push(chunk) {
      emitido += chunk;
      return emitido;
    },
    final() {
      return emitido;
    }
  };
}

// ------------------------------------------------------------
// MEMORIAS DEL USUARIO — lo que la IA recuerda de él (ver backend/memoryManager.js)
// ------------------------------------------------------------

// Diagnóstico público: confirma desde el navegador si la base de datos está
// conectada en este entorno (útil para depurar Render).
app.get('/api/diagnostico', async (req, res) => {
  const estado = {
    fecha: new Date().toISOString(),
    tieneDATABASE_URL: !!process.env.DATABASE_URL
  };
  if (db.pool) {
    try {
      const r = await db.pool.query('SELECT NOW() AS ahora');
      estado.conexion = 'ok';
      estado.horaBD = r.rows[0].ahora;
    } catch (e) {
      estado.conexion = 'error: ' + e.message;
    }
  } else {
    estado.conexion = 'sin pool (falta DATABASE_URL)';
  }
  res.json(estado);
});

// Devuelve las memorias del usuario conectado.
app.get('/api/memories', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    const memorias = await memory.getUserMemories(req.user.id);
    res.json({ memorias });
  } catch (e) {
    console.error('Error en GET /api/memories:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Guarda una memoria escrita a mano (o desde el botón "Recuérdalo").
app.post('/api/memories', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const texto = typeof req.body.texto === 'string' ? req.body.texto.trim() : '';
  if (!texto) {
    return res.status(400).json({ error: 'Falta el campo "texto"' });
  }
  try {
    const memoria = await memory.addMemory(req.user.id, texto, req.body.categoria);
    if (!memoria) {
      return res.status(400).json({ error: 'No se pudo guardar la memoria' });
    }
    res.status(201).json({ ok: true, memoria });
  } catch (e) {
    console.error('Error en POST /api/memories:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Borra una memoria (solo si pertenece al usuario autenticado).
app.delete('/api/memories/:id', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  try {
    const borrada = await memory.deleteMemory(id, req.user.id);
    if (!borrada) {
      return res.status(404).json({ error: 'Memoria no encontrada' });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('Error en DELETE /api/memories:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { mensaje, historial, modelo, idioma, instruccion, webSearch: forzarWebSearch, canal = 'chat', timeZone } = req.body || {};

    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'Falta el campo "mensaje"' });
    }

    // MODERACIÓN: verifica bloqueo y prepara contexto de moderación
    await moderationMiddleware()(req, res, () => {});

    // Si el middleware ya envió una respuesta (chat bloqueado), short-circuit
    if (res.headersSent) return;

    // Resto de la lógica original
    const autenticado = !!(req.isAuthenticated && req.isAuthenticated());
    const userId = req.user ? req.user.id : null;
    const LIMITE_SIN_LOGIN = 3;
    if(!autenticado){
      const usados = req.session.mensajesSinLogin || 0;
      if(usados >= LIMITE_SIN_LOGIN){
        return res.status(403).json({ error: 'LIMITE', limite: LIMITE_SIN_LOGIN });
      }
      req.session.mensajesSinLogin = usados + 1;
    }

    const lang = chatEngine.lenguajeDe(idioma);
    const instruccionUsuario = chatEngine.instruccionUsuarioDe(instruccion);

    // Memoria persistente del usuario
    let bloqueMemorias = '';
    if (userId) {
      try {
        bloqueMemorias = await memory.buildMemoryContext(userId);
      } catch (e) {
        console.error('Error cargando memorias del usuario:', e.message);
      }
    }

    // ==========================================================
    // BÚSQUEDA WEB EN TIEMPO REAL — MODO EXPLÍCITO DEL USUARIO
    //   'on'   → SIEMPRE busca web, sin pasar por el detector.
    //   'off'  → NUNCA busca web, sin importar el mensaje.
    //   'auto' → detecta automáticamente si hace falta buscar.
    // El frontend envía webSearch como STRING ('auto'|'on'|'off');
    // si el campo falta, el modo por defecto es 'auto'.
    // ==========================================================
    const modoWeb = forzarWebSearch || 'auto';
    const necesitaBusquedaAutomatica = modoWeb === 'on' || (modoWeb === 'auto' && await webSearch.detectarNecesidadBusqueda(mensaje, historial));

    if (necesitaBusquedaAutomatica) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const queryLimpia = webSearch.extraerQueryBusqueda(mensaje);
      res.write(`data: ${JSON.stringify({ tipo: 'buscando_web', query: queryLimpia })}\n\n`);

      try {
        const resBusqueda = await webSearch.ejecutarBusquedaWebCompleta({
          mensaje,
          historial,
          lang,
          apiKey: process.env.GEMINI_API_KEY,
          instruccionExtra: instruccionUsuario,
          memoriaContexto: bloqueMemorias
        });

        // Emisión en pequeños bloques fluidos (efecto máquina de escribir)
        // Sin retardo artificial grande: 4ms por palabra es suficiente para el
        // efecto visual sin alargar el tiempo de espera real del usuario.
        const palabras = resBusqueda.texto.split(/(\s+)/);
        for (const p of palabras) {
          if (!p) continue;
          res.write(`data: ${JSON.stringify({ texto: p })}\n\n`);
          await new Promise(r => setTimeout(r, 4));
        }

        // Emite las fuentes citadas si existen
        if (resBusqueda.fuentes && resBusqueda.fuentes.length) {
          res.write(`data: ${JSON.stringify({ tipo: 'fuentes', fuentes: resBusqueda.fuentes })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

        if (userId) {
          memory.notificarMensaje(userId, [
            ...(Array.isArray(historial) ? historial : []),
            { role: 'user', content: mensaje },
            { role: 'assistant', content: resBusqueda.texto }
          ]);
        }
        return;
      } catch (errWeb) {
        console.error('[WebSearch] Error en búsqueda web:', errWeb.message);
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify({ error: 'No se pudo completar la búsqueda en tiempo real. Por favor, intenta de nuevo.' })}\n\n`);
          res.end();
        }
        return;
      }
    }


    // Si el usuario eligió un modelo en el dropdown (groq/gemini/deepseek),
    // respetamos su elección. Si mandó "auto" o no mandó nada, el router decide.
    const MODELOS_MANUALES = ['groq', 'gemini', 'deepseek'];
    let proveedor = MODELOS_MANUALES.includes(modelo)
      ? modelo
      : selectModel(mensaje, historial);

    // Si el modo es automático y el proveedor elegido no tiene clave, usar groq
    if (!MODELOS_MANUALES.includes(modelo)) {
      if (proveedor === 'deepseek' && !DEEPSEEK_API_KEY) proveedor = 'groq';
      if (proveedor === 'gemini' && !GEMINI_API_KEY) proveedor = 'groq';
    }

    // Prompt de sistema, historial de mensajes y copia para extraer memorias
    // (compartidos con el bot de WhatsApp en backend/chatEngine.js).
    const { sistemaFinal } = chatEngine.armarSistema({
      lang,
      instruccion: instruccionUsuario,
      memoriaContexto: bloqueMemorias,
      canal,
      timeZone
    });
    const { mensajes, mensajesConversacion } = chatEngine.construirMensajes({
      mensaje,
      historial,
      sistemaFinal,
      proveedor
    });


    let url, apiKey, modeloIA;
    try {
      const config = chatEngine.configurarProveedor(proveedor);
      url = config.url;
      apiKey = config.apiKey;
      modeloIA = config.modeloIA;
    } catch (e) {
      if (e.claveError && e.status === 400) {
        return res.status(400).json({ error: e.message });
      }
      throw e;
    }

    const bodyIA = chatEngine.crearCuerpoIA({ modeloIA, mensajes, stream: true, proveedor });

    // Timeout para la llamada al modelo (bug #6). Mismo patrón que el flujo de
    // WhatsApp en chatEngine.solicitarTextoCompleto(): AbortController + timer.
    // WhatsApp espera la respuesta completa (timeoutMs=90000); aquí el fetch de
    // streaming resuelve apenas llegan los headers (primer token), así que 60s
    // cubre con margen la latencia sin cortar respuestas normales.
    const TIMEOUT_IA_MS = 60000;
    const MSG_TIMEOUT_IA = 'El modelo tardó demasiado en responder, intentá de nuevo.';

    const controladorIA = new AbortController();
    const temporizadorIA = setTimeout(() => controladorIA.abort(), TIMEOUT_IA_MS);
    let respuestaIA;
    try {
      respuestaIA = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(bodyIA),
        signal: controladorIA.signal
      });
    } catch (e) {
      if (e.name === 'AbortError') {
        console.error(`[chat] Timeout de ${proveedor} (${TIMEOUT_IA_MS}ms)`);
        if (res.headersSent) {
          // Ya arrancó el SSE (caso fall-through de búsqueda web): cerramos con
          // evento de error para que el frontend lo muestre y no quede colgado.
          if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ error: MSG_TIMEOUT_IA })}\n\n`);
            res.end();
          }
        } else {
          res.status(504).json({ error: MSG_TIMEOUT_IA });
        }
        return;
      }
      throw e;
    } finally {
      clearTimeout(temporizadorIA);
    }

    if (!respuestaIA.ok) {
      const errorData = await respuestaIA.text();
      console.error(`Error de ${proveedor}:`, errorData);
      const msgErr = chatEngine.mensajeErrorIA(proveedor, respuestaIA.status, errorData);
      if (res.headersSent) {
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify({ error: msgErr })}\n\n`);
          res.end();
        }
        return;
      }
      return res.status(respuestaIA.status).json({ error: msgErr });
    }

    // ============================================================
    // STREAMING EN DOS FASES: detecta [BUSCAR_WEB] y reinyecta búsqueda
    // ============================================================
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
    }

    const filtro = crearFiltroRazonamiento();
    let bufferRespuesta = '';
    let primeraEmision = true;
    let lectorAbortado = false;
    let lector = null;

    function enviarTexto(texto) {
      if (!texto) return;
      let nuevo = texto.slice(bufferRespuesta.length);
      bufferRespuesta = texto;
      if (!nuevo) return;
      if (primeraEmision) {
        primeraEmision = false;
        const limpio = nuevo.replace(/^\s+/, '');
        if (!limpio) return;
        nuevo = limpio;
      }
      try {
        res.write(`data: ${JSON.stringify({ texto: nuevo })}\n\n`);
      } catch (e) { /* cliente cerró */ }
    }

    res.on('close', () => {
      if (!res.writableEnded && lector && !lectorAbortado) {
        lectorAbortado = true;
        lector.cancel().catch(() => {});
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // GENERACIÓN DE DOCUMENTO DIRECTO (fallback cuando el modelo emite [GENERAR_DOC])
    // Si el modelo antiguo aún emite [GENERAR_DOC]: tema, hacemos una 2ª llamada
    // para que la IA escriba el documento completo directamente.
    // ─────────────────────────────────────────────────────────────────────────
    async function generarDocumentoDirecto(tema, mensajesOriginales, sistemaFinal) {
      const promptDoc = `Escribe un documento completo y detallado sobre: "${tema}".

Formato obligatorio:
- Tu primera línea DEBE SER EXACTAMENTE: [ES_DOCUMENTO]
- Luego de eso, empieza con "# ${tema}" como título principal
- Usa ## para al menos 5 secciones temáticas
- Párrafos informativos y ricos en contenido
- Listas con viñetas donde sea adecuado
- **Negritas** para datos clave
- Inserta 3-5 marcadores [FOTO_REAL: nombre] en líneas separadas para ilustrar con fotos reales
- Mínimo 700 palabras en español

Escribe SOLO el documento completo comenzando con el marcador.`;

      const mensajesDoc = [
        { role: 'system', content: sistemaFinal },
        ...mensajesOriginales.slice(1),
        { role: 'user', content: promptDoc }
      ];

      const bodyDoc = chatEngine.crearCuerpoIA({ modeloIA, mensajes: mensajesDoc, stream: true, proveedor, maxTokens: 4096 });
      const ctrlDoc = new AbortController();
      const timerDoc = setTimeout(() => ctrlDoc.abort(), TIMEOUT_IA_MS);
      let respDoc;
      try {
        respDoc = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify(bodyDoc),
          signal: ctrlDoc.signal
        });
      } catch (e) {
        if (!res.writableEnded) { res.write(`data: ${JSON.stringify({ error: 'No se pudo generar el documento. Intenta de nuevo.' })}\n\n`); res.end(); }
        return;
      } finally { clearTimeout(timerDoc); }

      if (!respDoc.ok) {
        if (!res.writableEnded) { res.write(`data: ${JSON.stringify({ error: 'Error al generar el documento' })}\n\n`); res.end(); }
        return;
      }

      const filtroDoc = crearFiltroRazonamiento();
      let bufDoc = '';
      let primeraEmisionDoc = true;

      function enviarDoc(texto) {
        if (!texto) return;
        let nuevo = texto.slice(bufDoc.length);
        bufDoc = texto;
        if (!nuevo) return;
        if (primeraEmisionDoc) {
          primeraEmisionDoc = false;
          const limpio = nuevo.replace(/^\s+/, '');
          if (!limpio) return;
          nuevo = limpio;
        }
        try { res.write(`data: ${JSON.stringify({ texto: nuevo })}\n\n`); } catch (e) {}
      }

      await leerStreamSSE(respDoc, delta => enviarDoc(filtroDoc.push(delta)), {
        esActivo: () => !lectorAbortado,
        setLector: (r) => { lector = r; }
      });
      enviarDoc(filtroDoc.final());
      res.write('data: [DONE]\n\n');
      res.end();
    }

    async function procesarStreamConBusqueda(stream, mensajesOriginales, sistemaFinal, modoWeb) {
      // Fase 1: STREAMING PROGRESIVO con detector de marcadores en vivo.
      // Detecta [BUSCAR_WEB] durante el stream.
      const MARCADOR_RE = /\[BUSCAR_WEB\]\s*:\s*([^\n]+)/i;
      const ANCLA_MARCADOR = '[BUSCAR_WEB]: ';

      // ¿Cuántos caracteres del final podrían ser parte de un marcador?
      function pendienteMarcador(texto) {
        const maxWeb = Math.min(texto.length, ANCLA_MARCADOR.length);
        for (let n = maxWeb; n >= 1; n--) {
          if (ANCLA_MARCADOR.startsWith(texto.slice(-n))) return n;
        }
        return 0;
      }

      let emitido = '';
      let comprometido = 0;
      let buscarDetectado = false;
      let buscarQuery = '';
      let respuestaCompleta = '';

      await leerStreamSSE(stream, delta => {
        emitido = filtro.push(delta);
        if (buscarDetectado) return;

        // ¿El modelo decidió buscar en la web?
        const coincidencia = MARCADOR_RE.exec(emitido);
        if (coincidencia && coincidencia[0].length >= ANCLA_MARCADOR.length) {
          buscarDetectado = true;
          buscarQuery = coincidencia[1].trim();
          respuestaCompleta = emitido;
          enviarTexto(emitido.slice(0, coincidencia.index).trim());
          if (lector && !lectorAbortado) { lector.cancel().catch(() => {}); }
          return;
        }

        // Emitir solo la parte segura (la cola podría iniciar el marcador)
        const fiable = emitido.length - pendienteMarcador(emitido);
        if (fiable > comprometido) {
          enviarTexto(emitido.slice(0, fiable));
          comprometido = fiable;
        }
      }, { esActivo: () => !lectorAbortado, setLector: (r) => { lector = r; } });

      // Fin del stream: entregar lo que quedó pendiente
      if (!buscarDetectado) {
        emitido = filtro.final();
        const coincidencia = MARCADOR_RE.exec(emitido);
        if (coincidencia) {
          buscarDetectado = true;
          buscarQuery = coincidencia[1].trim();
          respuestaCompleta = emitido;
          enviarTexto(emitido.slice(0, coincidencia.index).trim());
        } else if (emitido.length > comprometido) {
          enviarTexto(emitido);
          comprometido = emitido.length;
        }
      }

      // Sin marcador: la respuesta ya se transmitió en tiempo real
      if (!buscarDetectado) {
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // En modo 'off' el usuario pidió NO buscar nunca: ignoramos el marcador
      // (el modelo puede emitirlo por su instrucción general) y emitimos la
      // respuesta tal cual, sin disparar ninguna búsqueda. Si el modelo solo
      // emitió el marcador y nada más, avisamos en vez de responder vacío.
      if (modoWeb === 'off') {
        const limpio = respuestaCompleta.replace(/\[BUSCAR_WEB\][\s\S]*$/i, '').trim();
        enviarTexto(limpio || 'No puedo buscar en internet porque tenés la búsqueda web desactivada.');
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      let query = buscarQuery;
      console.log('[chat] [BUSCAR_WEB] original del modelo:', query);

      // Reescritor rápido: usa los últimos 4 mensajes para asegurar una consulta autocontenida
      try {
        const ultimos = mensajesOriginales.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
        const reescritorPrompt = `Eres un experto en extraer consultas de búsqueda web. A partir de la siguiente conversación y de la consulta original propuesta por el asistente, escribe UNA SOLA LÍNEA con la consulta final, autocontenida y optimizada para Google. No incluyas explicaciones, saludos ni frases como "busca en la web".
        
Conversación reciente:
${ultimos}

Consulta original propuesta: ${query}

Consulta optimizada para Google:`;

        const rewriteRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: reescritorPrompt }],
            temperature: 0,
            max_tokens: 50
          })
        });
        const rewriteData = await rewriteRes.json();
        if (rewriteData.choices && rewriteData.choices[0] && rewriteData.choices[0].message) {
          const reescrita = rewriteData.choices[0].message.content.replace(/^["']|["']$/g, '').trim();
          if (reescrita) query = reescrita;
        }
      } catch (e) {
        console.warn('[chat] Error al reescribir la consulta, usando la original:', e.message);
      }
      
      console.log('[chat] [BUSCAR_WEB] consulta final reescrita:', query);

      // Fase 2: búsqueda web en tiempo real
      let resultadoBusqueda = { texto: '', fuentes: [] };
      try {
        resultadoBusqueda = await webSearch.buscarEnWeb({
          consulta: query,
          apiKey: process.env.SEARLO_API_KEY,
          lang
        });
        console.log(`[chat] Búsqueda finalizada: ${resultadoBusqueda.fuentes.length} resultados encontrados.`);
      } catch (e) {
        console.warn('[chat] Error en búsqueda web, continuando sin datos frescos:', e.message);
      }

      // Fase 3: segunda llamada al modelo con resultados de búsqueda
      const contextoBusqueda = resultadoBusqueda.fuentes.length
        ? `\n\n--- INFORMACIÓN EN TIEMPO REAL ---\n${resultadoBusqueda.texto}\n\nFuentes: ${resultadoBusqueda.fuentes.map(f => f.titulo + ' - ' + f.url).join('; ')}`
        : '';

      const mensajesConBusqueda = [
        { role: 'system', content: sistemaFinal },
        ...mensajesOriginales.slice(1), // sin el system prompt duplicado
        { role: 'user', content: mensaje },
        { role: 'assistant', content: respuestaCompleta.replace(/\[BUSCAR_WEB\][\s\S]*$/i, '').trim() || 'Buscando información...' },
        { role: 'user', content: 'Aquí tienes la información actualizada de la web para responder con precisión:' + contextoBusqueda }
      ];

      const bodyIA2 = chatEngine.crearCuerpoIA({ modeloIA, mensajes: mensajesConBusqueda, stream: true, proveedor });

      // Mismo timeout que la primera llamada (los headers SSE ya se enviaron).
      const controladorIA2 = new AbortController();
      const temporizadorIA2 = setTimeout(() => controladorIA2.abort(), TIMEOUT_IA_MS);
      let respuestaIA2;
      try {
        respuestaIA2 = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify(bodyIA2),
          signal: controladorIA2.signal
        });
      } catch (e) {
        if (e.name === 'AbortError') {
          console.error(`[chat] Timeout en 2ª llamada de ${proveedor} (${TIMEOUT_IA_MS}ms)`);
          if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ error: MSG_TIMEOUT_IA })}\n\n`);
            res.end();
          }
          return;
        }
        throw e;
      } finally {
        clearTimeout(temporizadorIA2);
      }

      if (!respuestaIA2.ok) {
        const errorData = await respuestaIA2.text();
        console.error(`Error en 2ª llamada (${proveedor}):`, errorData);
        enviarTexto(respuestaCompleta); // fallback: respuesta original
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // Stream de la respuesta final con resultados de búsqueda web
      const filtro2 = crearFiltroRazonamiento();
      let bufferFinal = '';
      let primeraEmision2 = true;

      function enviarTextoFinal(texto) {
        if (!texto) return;
        let nuevo = texto.slice(bufferFinal.length);
        bufferFinal = texto;
        if (!nuevo) return;
        if (primeraEmision2) {
          primeraEmision2 = false;
          const limpio = nuevo.replace(/^\s+/, '');
          if (!limpio) return;
          nuevo = limpio;
        }
        try {
          res.write(`data: ${JSON.stringify({ texto: nuevo })}\n\n`);
        } catch (e) { /* cliente cerró */ }
      }

      await leerStreamSSE(respuestaIA2, delta => {
        const texto = filtro2.push(delta);
        enviarTextoFinal(texto);
      }, {
        esActivo: () => !lectorAbortado,
        setLector: (r) => { lector = r; }
      });

      enviarTextoFinal(filtro2.final());

      // Emitir fuentes al final si las hay
      if (resultadoBusqueda.fuentes && resultadoBusqueda.fuentes.length) {
        res.write(`data: ${JSON.stringify({ tipo: 'fuentes', fuentes: resultadoBusqueda.fuentes })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    }

    try {
      await procesarStreamConBusqueda(respuestaIA, mensajes, sistemaFinal, modoWeb);
    } catch (e) {
      console.error('Error en streaming con búsqueda:', e.message);
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: 'Error interno del servidor' })}\n\n`);
        res.end();
      }
    }

    // Extracción de memorias en segundo plano
    if (userId && mensajesConversacion.length) {
      memory.notificarMensaje(userId, mensajesConversacion);
    }

  } catch (error) {
    console.error('Error en /api/chat:', error);
    if (res.headersSent) {
      // Si ya arrancó el SSE no podemos mandar JSON: cerramos con un evento de
      // error para que el frontend lo muestre en vez de dejar la conexión colgada.
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: 'Error interno del servidor' })}\n\n`);
        res.end();
      }
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Bot de WhatsApp (webhook de Meta). Debe montarse ANTES del fallback SPA.
app.use(whatsappRouter);

// =====================================================================
// FRONTEND: build estático de Next.js (frontend-next/out) si existe.
// La app Next (React) sirve las páginas '/' (chat) y '/login' y reemplaza
// al frontend clásico. Si el export no está compilado, seguimos sirviendo
// el frontend vanilla (index.html de la raíz).
// Desactivable con SERVE_NEXT=0.
// =====================================================================
const NEXT_OUT = path.join(__dirname, 'frontend-next', 'out');
const tieneNextExport = fs.existsSync(path.join(NEXT_OUT, 'index.html'));
const servirNext = process.env.SERVE_NEXT !== '0' && tieneNextExport;

if (servirNext) {
  console.log('[frontend] Sirviendo app React/Next.js (frontend-next/out)');
  // El service worker y el manifest no se cachean para que las
  // actualizaciones de la app se propaguen rápido.
  app.use('/sw.js', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.use(express.static(NEXT_OUT, {
    // Evita que headers de sesión/cookies queden cacheados en HTML
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }));

  // Cada página del export es un HTML propio (/, /login). Para rutas
  // directas sin extensión intentamos <ruta>.html y, si no existe,
  // mandamos index.html (SPA). Express.static ya sirvió los assets reales.
  app.get('*', (req, res) => {
    let ruta = decodeURIComponent(req.path || '/');
    if (ruta.endsWith('/')) ruta += 'index';
    const htmlCandidato = path.join(NEXT_OUT, ruta.replace(/^\/+/, '') + '.html');
    if (fs.existsSync(htmlCandidato)) {
      return res.sendFile(htmlCandidato);
    }
    res.sendFile(path.join(NEXT_OUT, 'index.html'));
  });
} else {
  // Respaldo: sirve el frontend clásico (ahora en legacy/) solo si el build
  // de Next no existe. `legacy/` conserva el código vanilla por referencia.
  console.log('[frontend] Build de Next no encontrado; sirviendo frontend clásico (legacy/)');
  const LEGACY_RAIZ = path.join(__dirname, 'legacy');
  app.use('/sw.js', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use('/manifest.json', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.static(LEGACY_RAIZ));

  // Si alguien entra a la raíz o a cualquier ruta no reconocida, manda el index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(LEGACY_RAIZ, 'index.html'));
  });
}

// Manejador global de errores de Express para responder siempre con JSON y no con HTML 500
app.use((err, req, res, next) => {
  console.error('[Error Global Servidor]:', err);
  if (res.headersSent) {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Error interno del servidor' })}\n\n`);
      res.end();
    }
    return;
  }
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  db.inicializar();
});