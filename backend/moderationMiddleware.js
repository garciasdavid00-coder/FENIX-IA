// Moderación de conversaciones Fenix IA
// Detecta insultos y lleva contador, bloquea a 5 insultos por conversación.
// Se ejecuta como middleware Express antes de procesar cada mensaje.

const db = require('../db');

const insultosBase = [
  'puta', 'hijo', 'perra', 'mierda', 'cabrón', 'pendejo', 'estúpido', 'idiota',
  'tonto', 'imbécil', 'groso', 'boludo', 'pelotudo', 'cobarde', 'miedoso',
  'gil', 'gilipollas', 'retardado', 'nazi', 'fascista',
  'racista', 'sexista', 'homofóbico', 'homofobo', 'discriminatorio',
  'agresivo', 'agresión', 'amenaza', 'golpe', 'lastimar', 'daño', 'malo',
  'malvado', 'satanás', 'diablo', 'infiel', 'traidor', 'vergüenza',
  'lástima', 'pena', 'daño', 'dañar', 'malo', 'malvado', 'satanás',
];

const MENSAJE_BLOQUEADO =
  'Este chat fue bloqueado por uso repetido de lenguaje ofensivo. No se pueden enviar más mensajes aquí.';

function normalizarMensaje(texto) {
  if (typeof texto !== 'string') return '';
  let r = texto.toLowerCase();
  const m = { '4': 'a', '0': 'o', '5': 's', '1': 'i', '7': 't', '@': 'a' };
  for (const [k, v] of Object.entries(m)) {
    r = r.replace(new RegExp(k, 'g'), v);
  }
  r = r.replace(/[áéíóúñ]/g, c => {
    const tildes = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n' };
    return tildes[c] || c;
  });
  return r;
}

function detectarInsultoLista(texto) {
  const n = normalizarMensaje(texto);
  for (const p of insultosBase) {
    if (n.includes(p)) return { insulto: true, palabra_detectada: p };
  }
  return { insulto: false, palabra_detectada: null };
}

function moderationMiddleware() {
  // Ejecuta una vez al inicio y configura el contexto de moderación.
  // Retorna una función middleware de Express (async: consulta la BD).
  return async (req, res, next) => {
    try {
      // El mensaje entrante y el chat al que pertenece.
      const mensaje = (req.body && typeof req.body.mensaje === 'string') ? req.body.mensaje : '';
      const chatId = req.body && req.body.chatId;

      // La moderación por chat se guarda en la tabla `chats`, que está
      // identificada por (google_id, cliente_id). Sin usuario logueado no hay
      // fila que actualizar; sin chatId no sabemos a cuál chat apuntar.
      const googleId = req.user ? req.user.id : null;
      const chatIdNumerico = chatId != null ? Number(chatId) : NaN;
      const puedeContar = !!googleId && Number.isFinite(chatIdNumerico);

      const deteccion = mensaje ? detectarInsultoLista(mensaje) : { insulto: false, palabra_detectada: null };

      // 1) ¿El chat ya está bloqueado? Rechazar el mensaje ANTES de procesarlo.
      if (puedeContar) {
        const estado = await db.obtenerEstadoChat(googleId, chatIdNumerico);
        if (estado && estado.is_blocked) {
          req.moderation = {
            chatBloqueado: true,
            contadorActual: estado.insult_count,
            palabraDetectada: null,
            identificador: googleId
          };
          return res.status(403).json({ error: 'CHAT_BLOQUEADO', mensaje: MENSAJE_BLOQUEADO });
        }
      }

      // 2) Contamos insultos y bloqueamos el chat al llegar a 5.
      //    El mensaje que completa el 5º insulto aún pasa; los siguientes no.
      let contador = 0;
      let bloqueado = false;
      if (puedeContar && deteccion.insulto) {
        const nuevo = await db.registrarInsulto(googleId, chatIdNumerico, mensaje);
        if (nuevo) {
          contador = nuevo.insult_count;
          bloqueado = !!(nuevo.is_blocked);
        }
      }

      req.moderation = {
        chatBloqueado: bloqueado,
        contadorActual: contador,
        palabraDetectada: deteccion.insulto ? deteccion.palabra_detectada : null,
        identificador: googleId || 'sesion'
      };

      next();
    } catch (error) {
      console.error('Error en moderationMiddleware:', error.message);
      req.moderation = {
        chatBloqueado: false,
        contadorActual: 0,
        palabraDetectada: null,
        identificador: 'sesion'
      };
      next();
    }
  };
}

module.exports = moderationMiddleware;