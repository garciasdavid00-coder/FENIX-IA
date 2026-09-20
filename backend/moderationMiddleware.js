// ============================================================================
// backend/moderationMiddleware.js — Moderación y Cierre de Conversaciones
// ============================================================================
// Detecta insultos y lenguaje ofensivo. Cuando se recibe un insulto,
// CIERRA y bloquea inmediatamente la conversación.
// ============================================================================

const db = require('../db');

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
  'Esta conversación ha sido cerrada y finalizada debido al uso de lenguaje ofensivo o insultos. No se pueden enviar más mensajes en este chat. Por favor, inicia una nueva conversación con respeto.';

function normalizarMensaje(texto) {
  if (typeof texto !== 'string') return '';
  let r = texto.toLowerCase();
  // Normalizar leetspeak
  const leet = { '4': 'a', '0': 'o', '5': 's', '1': 'i', '3': 'e', '7': 't', '@': 'a', '$': 's' };
  for (const [k, v] of Object.entries(leet)) {
    r = r.replace(new RegExp('\\' + k, 'g'), v);
  }
  // Quitar acentos
  r = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Reducir caracteres repetidos consecutivos (ej: puuuuta -> puta)
  r = r.replace(/(.)\1{2,}/g, '$1$1');
  return r;
}

function detectarInsulto(texto) {
  if (!texto || typeof texto !== 'string') return false;
  const normalizado = normalizarMensaje(texto);
  for (const regex of patronesInsultos) {
    if (regex.test(normalizado)) return true;
  }
  // También probar quitando espacios o puntos entre letras (ej: p.u.t.a -> puta)
  const colapsado = normalizado.replace(/[\.\-_,;:\*\+\s]/g, '');
  for (const regex of patronesInsultos) {
    // Si la palabra colapsada contiene la raíz
    if (regex.test(colapsado)) return true;
  }
  return false;
}

function moderationMiddleware() {
  return async (req, res, next) => {
    try {
      const mensaje = (req.body && typeof req.body.mensaje === 'string') ? req.body.mensaje : '';
      const chatId = req.body && req.body.chatId ? String(req.body.chatId) : null;
      const googleId = req.user ? req.user.id : null;
      const chatIdNumerico = chatId != null ? Number(chatId) : NaN;
      const puedeContarBD = !!googleId && Number.isFinite(chatIdNumerico);

      // Sesión para invitados
      if (!req.session.chatsBloqueados) {
        req.session.chatsBloqueados = [];
      }

      // 1) ¿El chat ya está bloqueado previamente?
      if (puedeContarBD) {
        const estado = await db.obtenerEstadoChat(googleId, chatIdNumerico);
        if (estado && estado.is_blocked) {
          req.moderation = { chatBloqueado: true, identificador: googleId };
          return res.status(403).json({ error: 'CHAT_BLOQUEADO', mensaje: MENSAJE_BLOQUEADO });
        }
      } else if (chatId && req.session.chatsBloqueados.includes(chatId)) {
        req.moderation = { chatBloqueado: true, identificador: 'sesion' };
        return res.status(403).json({ error: 'CHAT_BLOQUEADO', mensaje: MENSAJE_BLOQUEADO });
      }

      // 2) Detectar si el mensaje actual contiene insultos
      const esInsulto = detectarInsulto(mensaje);

      if (esInsulto) {
        console.warn(`[Moderación] Insulto detectado en chat ${chatId || 'sin-id'}. Cerrando conversación.`);

        // Bloquear en BD
        if (puedeContarBD) {
          await db.registrarInsulto(googleId, chatIdNumerico, mensaje);
        }

        // Bloquear en sesión
        if (chatId && !req.session.chatsBloqueados.includes(chatId)) {
          req.session.chatsBloqueados.push(chatId);
        }

        req.moderation = {
          chatBloqueado: true,
          contadorActual: 1,
          identificador: googleId || 'sesion'
        };

        return res.status(403).json({
          error: 'CHAT_BLOQUEADO',
          mensaje: MENSAJE_BLOQUEADO
        });
      }

      req.moderation = {
        chatBloqueado: false,
        contadorActual: 0,
        identificador: googleId || 'sesion'
      };

      next();
    } catch (error) {
      console.error('Error en moderationMiddleware:', error.message);
      req.moderation = { chatBloqueado: false, identificador: 'error' };
      next();
    }
  };
}

module.exports = moderationMiddleware;
module.exports.detectarInsulto = detectarInsulto;
module.exports.MENSAJE_BLOQUEADO = MENSAJE_BLOQUEADO;