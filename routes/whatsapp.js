// ============================================================================
// routes/whatsapp.js — Bot de WhatsApp con la WhatsApp Cloud API de Meta.
// ----------------------------------------------------------------------------
// - GET  /webhook/whatsapp : verificación inicial del webhook con Meta
//   (Meta llama a esta URL con hub.challenge cuando configuras el webhook).
// - POST /webhook/whatsapp : recibe los mensajes entrantes, los pasa por el
//   mismo motor de IA que la web (backend/chatEngine.js) y devuelve la
//   respuesta por la API de mensajes de WhatsApp.
//
// Requiere en .env:
//   WHATSAPP_VERIFY_TOKEN   (el string que tú elijas; se pega en Meta)
//   WHATSAPP_ACCESS_TOKEN   (System User token con permiso whatsapp_business_messaging)
//   WHATSAPP_PHONE_NUMBER_ID
//   WHATSAPP_APP_SECRET     (opcional pero recomendado: firma de los webhooks)
//   WHATSAPP_GRAPH_VERSION  (opcional; por defecto v23.0)
// ============================================================================

const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const memory = require('../backend/memoryManager');
const chatEngine = require('../backend/chatEngine');

const router = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';

const GRAPH_URL = () => `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`;

const LIMITE_POR_HORA = 20;          // máximo de mensajes por número y por hora
const HISTORIAL_GUARDADO = 60;       // líneas que se conservan en Neon
const HISTORIAL_CONTEXTO = 12;       // últimas líneas que se mandan al modelo
const TIME_OUT_IA = 90000;           // ms de espera del modelo
const CONTADOR_EN_MEMORIA = new Map(); // rate limiting de respaldo si no hay BD
let avisadoDesconfigurado = false;

// ------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------

function logCuandoFaltaConfig() {
  if (avisoDesconfigurado) return;
  avisoDesconfigurado = true;
  console.warn('[WhatsApp] Falta configurar WHATSAPP_VERIFY_TOKEN / WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID en .env');
}

// Verifica la firma `X-Hub-Signature-256` que manda Meta (HMAC-SHA256 del
// cuerpo con WHATSAPP_APP_SECRET). Si no hay APP_SECRET configurado, se
// omite la verificación (se registra un aviso una sola vez).
function firmaValida(req) {
  if (!APP_SECRET) return true;
  const firma = req.headers['x-hub-signature-256'];
  if (!firma) return false;
  const esperada = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(req.rawBody || '')
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada));
  } catch (e) {
    return false;
  }
}

// Convierte Markdown común a lo que WhatsApp SÍ renderiza:
// negritas *texto*, cursivas _texto_, y quita headers y otras estructuras
// que WhatsApp no soporta (vuelven directamente como texto plano/bullets).
function sanitizarParaWhatsApp(texto) {
  if (!texto) return texto;
  let t = String(texto);

  // Bloques de código: se deja solo el contenido (WhatsApp no usa ```).
  t = t.replace(/```[\s\S]*?```/g, m => m.replace(/```/g, '').trim());
  t = t.replace(/`([^`\n]+)`/g, '$1');

  // Headers y separadores → texto plano.
  t = t.replace(/^#{1,6}\s+/gm, '');
  t = t.replace(/^>+\s?/gm, '');
  t = t.replace(/^=+\s*$/gm, '');
  t = t.replace(/^-{3,}\s*$/gm, '');

  // Tablas Markdown → líneas legibles (bullets con sus celdas separadas por ·).
  const lineas = t.split('\n').map(l => l.replace(/\r/g, ''));
  const convertidas = [];
  for (const linea of lineas) {
    const ll = linea.trim();
    if (ll.includes('|')) {
      const soloGuiones = ll.replace(/\|/g, '').trim();
      if (/^:?-{2,}[:|\s-]*$/.test(soloGuiones) && /-/.test(soloGuiones)) {
        continue; // fila separadora de una tabla (|--|--|)
      }
      const celdas = ll.split('|').map(c => c.trim()).filter(c => c !== '');
      convertidas.push('•  ' + celdas.join(' · '));
    } else {
      convertidas.push(linea);
    }
  }
  t = convertidas.join('\n');

  // Negritas/cursivas de Markdown → las de WhatsApp (de mayor a menor prioridad).
  t = t.replace(/\*\*\*([^*]+)\*\*\*/g, '*_$1_*');
  t = t.replace(/\*\*([^*]+)\*\*/g, '*$1*');
  t = t.replace(/__([^_]+)__/g, '_$1_');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  // Listas con guiones → bullets de WhatsApp.
  t = t.replace(/^\s*[-*]\s+/gm, '•  ');

  // Triple espacio/nueva línea sobrante → limpio.
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

// Rate limiting por número y hora (contador en Neon; si falla, en memoria).
async function permiteEnviar(numero) {
  let usos = 0;
  try {
    usos = await db.contarUsoWhatsapp(numero);
  } catch (e) {
    console.error('[WhatsApp] Error en rate limiting en BD; usando contador en memoria:', e.message);
    const clave = numero + ':' + Math.floor(Date.now() / 3600000);
    usos = (CONTADOR_EN_MEMORIA.get(clave) || 0) + 1;
    CONTADOR_EN_MEMORIA.set(clave, usos);
  }
  return usos <= LIMITE_POR_HORA;
}

// Envía un mensaje de texto por la API de WhatsApp con un reintento simple.
async function enviarMensajeWhatsApp(para, texto) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    logCuandoFaltaConfig();
    return null;
  }
  const cuerpo = {
    messaging_product: 'whatsapp',
    to: para,
    type: 'text',
    text: { body: String(texto || '').slice(0, 4096) }
  };

  let ultimoError = null;
  for (let intento = 0; intento < 2; intento++) {
    try {
      const res = await fetch(GRAPH_URL(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cuerpo)
      });
      const datos = await res.text();
      if (res.ok) return datos;
      ultimoError = `[WhatsApp] Error al enviar a ${para} (intento ${intento + 1}): status ${res.status} — ${datos}`;
      console.error(ultimoError);
    } catch (e) {
      ultimoError = `[WhatsApp] Fallo de red al enviar a ${para} (intento ${intento + 1}): ${e.message}`;
      console.error(ultimoError);
    }
    if (intento === 0) await new Promise(r => setTimeout(r, 800));
  }
  throw new Error(ultimoError || '[WhatsApp] No se pudo enviar el mensaje');
}

// ------------------------------------------------------------
// Procesa un mensaje de texto entrante y responde.
// NOTA: se corre en segundo plano DESPUÉS de contestar 200 a Meta.
// ------------------------------------------------------------
async function procesarMensajeEntrante(message, value) {
  const numero = message.from;
  const texto = (message.text && message.text.body || '').trim();
  if (!numero || !texto) return;

  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    logCuandoFaltaConfig();
    return;
  }

  // 1) Rate limiting básico por número.
  if (!await permiteEnviar(numero)) {
    await enviarMensajeWhatsApp(numero, 'Has superado el límite de mensajes por hora (máximo ' + LIMITE_POR_HORA + '). Vuelve a escribir en un rato.');
    return;
  }

  try {
    // 2) Identificación por teléfono: se crea el usuario en Neon si no existe.
    const perfil = (value.contacts && value.contacts[0] && value.contacts[0].profile) || {};
    await db.obtenerOCrearUsuarioPorTelefono(numero, { nombre: perfil.name || '' });

    const userId = 'wa:' + numero; // id de memoria separado de los de Google

    // 3) Historial previo de ESTE número (contexto para el modelo).
    const guardado = await db.obtenerConversacionWhatsapp(numero) || [];
    const historial = (Array.isArray(guardado) ? guardado : []).slice(-HISTORIAL_CONTEXTO);

    // 4) Memoria persistente del número.
    let memoriaContexto = '';
    try {
      memoriaContexto = await memory.buildMemoryContext(userId);
    } catch (e) {
      console.error('[WhatsApp] Error cargando memorias:', e.message);
    }

    // 5) Respuesta del modelo (mismo motor que la web, non-streaming).
    const resultado = await chatEngine.solicitarTextoCompleto({
      mensaje: texto,
      historial,
      idioma: 'es',
      memoriaContexto,
      timeoutMs: TIME_OUT_IA
    });
    const respuesta = sanitizarParaWhatsApp(resultado.texto);

    // 6) Guardamos la conversación de este número y dejamos que la memoria
    //    se actualice en segundo plano (igual que en la web).
    await db.guardarConversacionWhatsapp(numero, [
      ...(Array.isArray(guardado) ? guardado : []),
      { role: 'user', content: texto },
      { role: 'assistant', content: respuesta }
    ]);
    memory.notificarMensaje(userId, [...historial, { role: 'user', content: texto }]);

    // 7) Enviamos la respuesta por WhatsApp.
    await enviarMensajeWhatsApp(numero, respuesta);
  } catch (err) {
    // 8) Si la IA falla o tarda demasiado, el usuario recibe un aviso claro.
    let mensajeError;
    if (err && err.esErrorIA) {
      mensajeError = chatEngine.mensajeErrorIA(err.proveedor, err.status, err.cuerpo);
    } else if (err && err.name === 'AbortError') {
      mensajeError = 'La respuesta está tardando demasiado. Intenta de nuevo en un momento.';
    } else {
      mensajeError = 'Ups, hubo un error al procesar tu mensaje. Intenta de nuevo en un momento.';
    }
    console.error('[WhatsApp] Error procesando el mensaje de ' + numero + ':', err && err.message ? err.message : err);
    try {
      await enviarMensajeWhatsApp(numero, mensajeError);
    } catch (e) {
      console.error('[WhatsApp] No se pudo enviar el mensaje de error:', e.message);
    }
  }
}

// ------------------------------------------------------------
// Rutas del webhook
// ------------------------------------------------------------

// Verificación inicial: Meta llama a esta URL con ?hub.mode=subscribe y
// ?hub.challenge=... cuando configuras el webhook en el panel de Meta.
router.get('/webhook/whatsapp', (req, res) => {
  const modo = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (!VERIFY_TOKEN) {
    logCuandoFaltaConfig();
    return res.status(503).send('WHATSAPP_VERIFY_TOKEN no configurado');
  }

  if (modo === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verificado con éxito por Meta.');
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Verificación del webhook fallida');
});

// Mensajes entrantes. Se responde 200 inmediatamente para que Meta no
// reintente, y el procesamiento corre en segundo plano.
router.post('/webhook/whatsapp', (req, res) => {
  if (!firmaValida(req)) {
    console.error('[WhatsApp] Firma de webhook inválida (rechazado).');
    return res.sendStatus(401);
  }

  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    logCuandoFaltaConfig();
  }
  res.sendStatus(200);

  const entradas = req.body && (req.body.entry || []);
  for (const entrada of entradas) {
    for (const cambio of (entrada.changes || [])) {
      const value = cambio.value || {};
      const mensajes = value.messages || [];
      for (const message of mensajes) {
        // Solo atendemos mensajes de texto; los estados (entregado/leído) y
        // otros tipos (imagen, audio...) se ignoran por ahora.
        if (message.type === 'text' && message.text) {
          procesarMensajeEntrante(message, value)
            .catch(e => console.error('[WhatsApp] Error asíncrono al procesar:', e.message));
        }
      }
    }
  }
});

module.exports = router;
module.exports.sanitizarParaWhatsApp = sanitizarParaWhatsApp;
module.exports.LIMITE_POR_HORA = LIMITE_POR_HORA;