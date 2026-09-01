require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const db = require('./db');
const { selectModel } = require('./modelRouter');
const { generarDocumentoConHechosReales } = require('./services/promptDocumentos');
const { router: imagenesRealesRouter, buscarImagenReal } = require('./routes/imagenesReales');
const memory = require('./backend/memoryManager');
const chatEngine = require('./backend/chatEngine');
const whatsappRouter = require('./routes/whatsapp');

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
// El `verify` guarda el cuerpo crudo (req.rawBody) para poder verificar la
// firma X-Hub-Signature-256 de los webhooks de WhatsApp.
app.use(express.json({ limit: '5mb', verify: (req, res, buf) => { req.rawBody = buf; } }));

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

// Endpoint GET /api/imagen-real (fotos reales de Wikimedia Commons).
// Ver routes/imagenesReales.js.
app.use(imagenesRealesRouter);

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
  const { chats, proyectos } = req.body || {};
  if (!Array.isArray(chats) || !Array.isArray(proyectos)) {
    return res.status(400).json({ error: 'Formato inválido.' });
  }
  try {
    await db.sincronizarDatos(req.user.id, { chats, proyectos });
    res.json({ ok: true });
  } catch (e) {
    console.error('Error al guardar historial:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Voz en tiempo real: token efímero para Gemini Live API.
// (Va directo aquí para no depender de carpetas extra en el repo.)
app.post('/api/voice-token', async (req, res) => {
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
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
    res.json({ token: data.name || data.token, expiresAt: expireTime });
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

// POST /api/documento-real
// Genera un documento con HECHOS REALES: el modelo usa el grounding de
// Google Search (no inventa fechas/nombres/cifras) y las ilustraciones
// son FOTOS REALES de Wikimedia Commons, nunca imágenes generadas por IA.
app.post('/api/documento-real', async (req, res) => {
  try {
    const tema = ((req.body && req.body.tema) || '').toString().trim().slice(0, 1000);
    if (!tema) {
      return res.status(400).json({ error: 'Falta el campo "tema".' });
    }
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: 'GEMINI_API_KEY no está configurado en el servidor.' });
    }

    // 1) El modelo redacta basándose en búsquedas reales (grounding) y, en
    //    vez de imágenes, emite marcadores [IMG_QUERY: consulta corta].
    const { contenido, fuentes } = await generarDocumentoConHechosReales({
      tema,
      apiKey: GEMINI_API_KEY,
      modelo: GEMINI_MODEL
    });

    // 2) Resolvemos cada [IMG_QUERY: ...] contra una foto real de Commons
    //    (llamada interna, sin pasar por HTTP). Si no hay foto, el marcador
    //    desaparece en vez de dejar una imagen rota.
    const MAX_IMAGENES = 4;
    let imagenesColocadas = 0;
    const marcadores = Array.from(contenido.matchAll(/\[IMG_QUERY:\s*([^\]]+)\]/gi));
    let documentoFinal = contenido;

    for (const m of marcadores) {
      const consultaImg = m[1].trim().slice(0, 120);
      let reemplazo = '';
      if (imagenesColocadas < MAX_IMAGENES) {
        try {
          const fotos = await buscarImagenReal(consultaImg);
          const urlFoto = fotos[0] && fotos[0].url;
          if (urlFoto) {
            reemplazo = '[FENIX_IMG:' + urlFoto + ']';
            imagenesColocadas++;
          } else {
            console.warn('[documento-real] Sin foto real para:', consultaImg, '— marcador eliminado.');
          }
        } catch (e) {
          console.error('[documento-real] Error buscando foto real para "' + consultaImg + '":', e.message);
        }
      }
      // reemplaza la primera aparición exacta de este marcador
      documentoFinal = documentoFinal.replace(m[0], reemplazo);
    }

    // 3) Al final, sección "Fuentes" con las URLs REALES que usó Gemini.
    if (fuentes.length) {
      const enlaces = fuentes.map(f => '- ' + f.url).join('\n');
      documentoFinal = documentoFinal.trim() + '\n\n## Fuentes\n\n' + enlaces;
    }

    // Formato compatible con el renderizador del front (clases .doc-imagen).
    const contenidoLimpio = documentoFinal.replace(/\n{3,}/g, '\n\n').trim();
    res.json({ contenido: contenidoLimpio, fuentes });
  } catch (e) {
    console.error('Error en /api/documento-real:', e);
    res.status(502).json({ error: 'No se pudo generar el documento con hechos reales. Intenta de nuevo.' });
  }
});

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
app.post('/api/cambiar-plan', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Debes iniciar sesión para cambiar de plan.' });
  }
  const { plan } = req.body || {};
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

// Filtra en tiempo real los bloques de "razonamiento" que mandan algunos modelos
// (Qwen manda  thinking... response y Gemini "thinking..." al inicio).
// Emite solo el texto visible, sin retractar lo que ya se mandó al cliente.
function crearFiltroRazonamiento(){
  const etiquetas = [
    { abre: '<thinking>', cierra: '</thinking>' },
    { abre: '<reasoning>', cierra: '</reasoning>' }
  ];
  const cierresSimples = [' response', ' response', '</thinking>', ' response', '.'];

  let emitido = '';        // texto confirmado (monótono creciente)
  let cola = '';           // caracteres en espera (lookahead para detectar aperturas)
  let enBloque = false;
  let bloque = '';
  let bloqueCierres = [];
  let emitioTextoNormal = false;

  function pareceApertura(s){
    for(const e of etiquetas){
      const a = e.abre;
      if(a.startsWith(s) || s.startsWith(a)) return true;
    }
    // "thinking" pelado (con o sin espacio) solo cuenta al inicio del texto
    if(!emitioTextoNormal){
      const sTrim = s.trimStart();
      if('thinking'.startsWith(sTrim) || sTrim.startsWith('thinking')) return true;
    }
    return false;
  }

  function procesarNormal(){
    while(cola.length){
      let retenerDesde = -1;
      for(let p = 0; p < cola.length; p++){
        if(pareceApertura(cola.slice(p))){ retenerDesde = p; break; }
      }
      if(retenerDesde === -1){
        emitido += cola;
        cola = '';
        if(emitido.trim()) emitioTextoNormal = true;
        return;
      }
      if(retenerDesde > 0){
        emitido += cola.slice(0, retenerDesde);
        cola = cola.slice(retenerDesde);
        if(emitido.trim()) emitioTextoNormal = true;
      }

      // ¿Apertura con etiqueta confirmada?
      let apertura = null;
      for(const e of etiquetas){
        if(cola.startsWith(e.abre)){ apertura = e; break; }
      }
      if(apertura && (cola.length > apertura.abre.length || apertura.abre.endsWith('>'))){
        // lo que sigue a la etiqueta es contenido del bloque de razonamiento
        bloque = cola.slice(apertura.abre.length);
        cola = '';
        enBloque = true;
        bloqueCierres = [apertura.cierra];
        return;
      }

      // ¿"thinking" pelado confirmado (solo al inicio del texto)?
      if(!emitioTextoNormal){
        const sTrim = cola.trimStart();
        const pos = cola.length - sTrim.length;
        if(sTrim.startsWith('thinking') && cola.length > pos + 'thinking'.length){
          cola = cola.slice(pos + 'thinking'.length);
          enBloque = true;
          bloque = '';
          bloqueCierres = cierresSimples;
          return;
        }
      }

      // Es una apertura parcial sin confirmar: esperar más texto
      return;
    }
  }

  return {
    push(chunk){
      if(enBloque){
        bloque += chunk;
        for(const c of bloqueCierres){
          const idx = bloque.indexOf(c);
          if(idx !== -1){
            bloque = bloque.slice(idx + c.length);
            cola += bloque;
            bloque = '';
            enBloque = false;
            procesarNormal();
            break;
          }
        }
        return emitido;
      }
      cola += chunk;
      procesarNormal();
      return emitido;
    },
    final(){
      enBloque = false;         // descarta cualquier bloque sin cerrar
      emitido += cola;          // emite lo que quedó pendiente
      cola = '';
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
    const { mensaje, historial, modelo, idioma, instruccion } = req.body;

    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'Falta el campo "mensaje"' });
    }

    // Límite de mensajes sin iniciar sesión (3 gratis por sesión)
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

    // Si el usuario eligió un modelo en el dropdown (groq/gemini/deepseek),
    // respetamos su elección. Si mandó "auto" o no mandó nada, el router decide.
    const MODELOS_MANUALES = ['groq', 'gemini', 'deepseek'];
    const proveedor = MODELOS_MANUALES.includes(modelo)
      ? modelo
      : selectModel(mensaje, historial);

    const lang = chatEngine.lenguajeDe(idioma);

    // Instrucción del sistema personalizada que el usuario escribe en Configuración
    const instruccionUsuario = chatEngine.instruccionUsuarioDe(instruccion);

    // Construimos el historial de mensajes para dar contexto a la IA
    // ----------------------------------------------------------
    // MEMORIA PERSISTENTE: si el usuario está conectado, cargamos lo que
    // recordamos de él (hechos y preferencias) y lo inyectamos AL INICIO del
    // system prompt para personalizar la conversación.
    // ----------------------------------------------------------
    let bloqueMemorias = '';
    if (userId) {
      try {
        bloqueMemorias = await memory.buildMemoryContext(userId);
      } catch (e) {
        console.error('Error cargando memorias del usuario:', e.message);
      }
    }

    // Prompt de sistema, historial de mensajes y copia para extraer memorias
    // (compartidos con el bot de WhatsApp en backend/chatEngine.js).
    const { sistemaFinal } = chatEngine.armarSistema({
      lang,
      instruccion: instruccionUsuario,
      memoriaContexto: bloqueMemorias
    });
    const { mensajes, mensajesConversacion } = chatEngine.construirMensajes({
      mensaje,
      historial,
      sistemaFinal
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
      return res.status(respuestaIA.status).json({ error: chatEngine.mensajeErrorIA(proveedor, respuestaIA.status, errorData) });
    }

    // Stream real (SSE): cada fragmento que llega del modelo se reenvía al navegador
    // apenas se produce, para que la respuesta se vaya viendo en pantalla.
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // evita que proxies como nginx buffericen el stream

    const filtro = crearFiltroRazonamiento();
    let emitidoHasta = 0;
    let primeraEmision = true;

    function enviarTexto(texto){
      if(!texto) return;
      let nuevo = texto.slice(emitidoHasta);
      emitidoHasta = texto.length;
      if(!nuevo) return;
      // El primer fragmento no debe empezar con espacios en blanco sobrantes
      if(primeraEmision){
        primeraEmision = false;
        const limpio = nuevo.replace(/^\s+/, '');
        if(!limpio) return; // era solo espacios en blanco
        nuevo = limpio;
      }
      try {
        res.write(`data: ${JSON.stringify({ texto: nuevo })}\n\n`);
      } catch(e){ /* el cliente cerró la conexión */ }
    }

    // Si el usuario cierra el chat, cortamos la petición al modelo para no gastar tokens.
    let lectorAbortado = false;
    let lector = null;
    res.on('close', () => {
      if(!res.writableEnded && lector && !lectorAbortado){
        lectorAbortado = true;
        lector.cancel().catch(() => {});
      }
    });

    try {
      await leerStreamSSE(respuestaIA, delta => enviarTexto(filtro.push(delta)), {
        esActivo: () => !lectorAbortado,
        setLector: (r) => { lector = r; }
      });
      enviarTexto(filtro.final());
      if(emitidoHasta === 0){
        enviarTexto('No se recibió respuesta.');
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (e) {
      console.error('Error durante el stream:', e.message);
      if(!res.writableEnded){
        res.write(`data: ${JSON.stringify({ error: 'Error interno del servidor' })}\n\n`);
        res.end();
      }
    }

    // Extracción de memorias en segundo plano (cada MEMORY_EXTRACTION_INTERVAL
    // mensajes) — no bloquea la respuesta; si falla, solo se registra el error.
    if (userId && mensajesConversacion.length) {
      memory.notificarMensaje(userId, mensajesConversacion);
    }

  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Bot de WhatsApp (webhook de Meta). Debe montarse ANTES del fallback SPA.
app.use(whatsappRouter);

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
  db.inicializar();
});