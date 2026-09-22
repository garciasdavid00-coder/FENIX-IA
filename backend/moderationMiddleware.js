// ============================================================================
// backend/moderationMiddleware.js — Moderación y Cierre de Conversaciones
// ============================================================================
// Detecta insultos y lenguaje ofensivo. Cuando se reciben 5 insultos reales,
// CIERRA y bloquea la conversación.
// Distingue entre autocrítica/angustia y verdaderos insultos usando LLM.
// ============================================================================

const db = require('../db');
const { solicitarTextoCompleto } = require('./chatEngine');

const patronesInsultos = [
  /\bput[ao]s?\b/i,
  /\bputit[ao]s?\b/i,
  /\bperr[ao]s?\b/i,
  /\bmierd[ao]s?\b/i,
  /\bmierder[ao]s?\b/i,
  /\bcabr[oó]n(a|es)?\b/i,
  /\bpendej[ao]s?\b/i,
  /\bpendejad[ao]s?\b/i,
  /\best[uú]pid[ao]s?\b/i,
  /\bidiot[ao]s?\b/i,
  /\bimb[eé]cil(es)?\b/i,
  /\bbolud[ao]s?\b/i,
  /\bpelotud[ao]s?\b/i,
  /\bgilipollas?\b/i,
  /\bretardad[ao]s?\b/i,
  /\bretrasad[ao]s?\b/i,
  /\bmaric[oó]n(es)?\b/i,
  /\bmaricas?\b/i,
  /\bhdp\b/i,
  /\bhij[ao]s?\s+de\s+puta\b/i,
  /\bmalparid[ao]s?\b/i,
  /\bculer[ao]s?\b/i,
  /\bching[ao]s?\b/i,
  /\bchinga\s+tu\s+madre\b/i,
  /\bchingada\b/i,
  /\bch[uú]pala\b/i,
  /\bchupamel[ao]\b/i,
  /\bzorras?\b/i,
  /\bverg[ao]s?\b/i,
  /\bvete\s+a\s+la\s+mierda\b/i,
  /\bvete\s+al\s+carajo\b/i,
  /\bbastard[ao]s?\b/i,
  /\bgonorreas?\b/i,
  /\bcarechimba\b/i,
  /\bmamag[uü]ev[ao]s?\b/i,
  /\bco[nñ]o\s+de\s+tu\s+madre\b/i,
  /\bfuck\b/i,
  /\bbitch(es)?\b/i,
  /\basshole?s?\b/i,
  /\bmotherfucker?s?\b/i,
  /\bdickhead?s?\b/i
];

const MENSAJE_BLOQUEADO =
  'Esta conversación ha sido cerrada y finalizada debido al uso reiterado de lenguaje ofensivo o insultos. No se pueden enviar más mensajes en este chat. Por favor, inicia una nueva conversación con respeto.';

function normalizarMensaje(texto) {
  if (typeof texto !== 'string') return '';
  let r = texto.toLowerCase();
  const leet = { '4': 'a', '0': 'o', '5': 's', '1': 'i', '3': 'e', '7': 't', '@': 'a', '$': 's' };
  for (const [k, v] of Object.entries(leet)) {
    r = r.replace(new RegExp('\\' + k, 'g'), v);
  }
  r = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  r = r.replace(/(.)\1{2,}/g, '$1$1');
  return r;
}

function detectarInsultoRegex(texto) {
  if (!texto || typeof texto !== 'string') return false;
  const normalizado = normalizarMensaje(texto);
  for (const regex of patronesInsultos) {
    if (regex.test(normalizado)) return true;
  }
  const colapsado = normalizado.replace(/[\.\-_,;:\*\+\s]/g, '');
  for (const regex of patronesInsultos) {
    if (regex.test(colapsado)) return true;
  }
  return false;
}

async function clasificarContexto(mensaje) {
  // Pre-filtro rápido con Regex para no gastar llamadas LLM en mensajes normales
  if (!detectarInsultoRegex(mensaje)) {
    return 'SAFE';
  }

  const prompt = `Analiza el siguiente mensaje de un usuario en un chat y clasifícalo en UNA de las siguientes tres categorías:
1. "SAFE": El mensaje no es un insulto (falsa alarma) o es jerga inofensiva.
2. "SELF_DISTRESS": El usuario usa lenguaje fuerte, groserías o insultos dirigidos HACIA SÍ MISMO (ej. "soy una mierda", "soy un idiota", "me odio") o expresa angustia emocional profunda.
3. "INSULT_TO_OTHERS": El usuario usa lenguaje ofensivo, groserías o insultos dirigidos hacia el bot, hacia otra persona, o de forma maliciosa/agresiva en general.

Mensaje del usuario: "${mensaje}"

Responde ÚNICAMENTE con la palabra clave exacta (SAFE, SELF_DISTRESS o INSULT_TO_OTHERS), sin puntos ni explicaciones.`;

  try {
    const result = await solicitarTextoCompleto({
      mensaje: prompt,
      historial: [],
      proveedor: 'groq',
      maxTokens: 10,
      idioma: 'es'
    });
    
    const texto = result.texto.trim().toUpperCase();
    if (texto.includes('INSULT_TO_OTHERS')) return 'INSULT_TO_OTHERS';
    if (texto.includes('SELF_DISTRESS')) return 'SELF_DISTRESS';
    return 'SAFE';
  } catch (error) {
    // Si falla el clasificador, asumimos insulto real por precaución ya que pasó el regex
    return 'INSULT_TO_OTHERS';
  }
}

function moderationMiddleware() {
  return async (req, res, next) => {
    try {
      const mensaje = (req.body && typeof req.body.mensaje === 'string') ? req.body.mensaje : '';
      const chatId = req.body && req.body.chatId ? String(req.body.chatId) : null;
      const googleId = req.user ? req.user.id : null;
      const chatIdNumerico = chatId != null ? Number(chatId) : NaN;
      const puedeContarBD = !!googleId && Number.isFinite(chatIdNumerico);

      // Sesión para invitados o chats nuevos sin ID
      if (!req.session.chatsBloqueados) req.session.chatsBloqueados = [];
      if (!req.session.insultCounts) req.session.insultCounts = {};

      // 1) ¿El chat ya está bloqueado previamente?
      if (puedeContarBD) {
        const estado = await db.obtenerEstadoChat(googleId, chatIdNumerico);
        if (estado && estado.is_blocked) {
          req.moderation = { chatBloqueado: true, identificador: googleId };
          return res.status(403).json({ error: 'CHAT_BLOQUEADO', mensaje: MENSAJE_BLOQUEADO });
        }
      } else {
        // Fallback a sesión: usando chatId como clave o 'global' si no hay chatId
        const claveSession = chatId || 'global';
        if (req.session.chatsBloqueados.includes(claveSession)) {
          req.moderation = { chatBloqueado: true, identificador: 'sesion' };
          return res.status(403).json({ error: 'CHAT_BLOQUEADO', mensaje: MENSAJE_BLOQUEADO });
        }
      }

      // 2) Detectar contexto usando LLM
      const clasificacion = await clasificarContexto(mensaje);

      if (clasificacion === 'SELF_DISTRESS') {
        // Angustia: no contamos, no bloqueamos, el bot responde con empatía
        req.moderation = { chatBloqueado: false, contadorActual: 0, identificador: googleId || 'sesion', selfDistress: true };
        return next();
      }

      if (clasificacion === 'INSULT_TO_OTHERS') {
        let isBlocked = false;
        let currentCount = 0;

        if (puedeContarBD) {
          // FIX CLAVE: 3er argumento es el TÍTULO del chat, no el mensaje
          const result = await db.registrarInsulto(googleId, chatIdNumerico, 'chat');
          if (result) {
            isBlocked = result.is_blocked;
            currentCount = result.insult_count;
          }
        } else {
          // Sin BD: usar sesión. Clave = chatId o 'global'
          const claveSession = chatId || 'global';
          req.session.insultCounts[claveSession] = (req.session.insultCounts[claveSession] || 0) + 1;
          currentCount = req.session.insultCounts[claveSession];
          if (currentCount >= 5) {
            isBlocked = true;
            if (!req.session.chatsBloqueados.includes(claveSession)) {
              req.session.chatsBloqueados.push(claveSession);
            }
          }
        }

        if (isBlocked) {
          console.warn(`[Moderación] BLOQUEADO — chat ${chatId || 'sin-id'} alcanzó 5 strikes.`);
          req.moderation = { chatBloqueado: true, contadorActual: currentCount, identificador: googleId || 'sesion' };
          return res.status(403).json({ error: 'CHAT_BLOQUEADO', mensaje: MENSAJE_BLOQUEADO });
        }

        const remaining = 5 - currentCount;
        console.warn(`[Moderación] Strike ${currentCount}/5 en chat ${chatId || 'sin-id'}. Quedan ${remaining}.`);

        req.moderation = {
          chatBloqueado: false,
          contadorActual: currentCount,
          strikesRestantes: remaining,
          identificador: googleId || 'sesion',
          insertarAdvertencia: true
        };
        return next();
      }

      // SAFE: pasar sin modificaciones
      req.moderation = { chatBloqueado: false, contadorActual: 0, identificador: googleId || 'sesion', selfDistress: false };
      next();
    } catch (error) {
      console.error('Error en moderationMiddleware:', error.message);
      req.moderation = { chatBloqueado: false, identificador: 'error' };
      next();
    }
  };
}

module.exports = moderationMiddleware;
module.exports.detectarInsulto = detectarInsultoRegex;
module.exports.MENSAJE_BLOQUEADO = MENSAJE_BLOQUEADO;