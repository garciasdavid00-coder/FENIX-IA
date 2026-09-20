const { obtenerSystemPrompt, SYSTEM_PROMPT_COMPLETO, SYSTEM_PROMPT_REDUCIDO } = require('./config/systemPrompt');
const reglas = require('./routerRules');

function contarPalabras(texto){
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

// Regla 1: ¿El mensaje tiene que ver con código?
function esCodigo(texto){
  const r = reglas.codigo;
  return r.codeFence.test(texto)
      || r.palabras.test(texto)
      || r.lenguajes.test(texto)
      || r.pideCodigo.test(texto);
}

// Regla 3: ¿Pide razonamiento largo o texto extenso?
function esRazonamientoLargo(texto, palabras){
  if (palabras >= reglas.longMinWords) return true;
  const r = reglas.razonamiento;
  if (r.fuerte.test(texto)) return true;             // "resume/analiza" → aunque sea corto
  if (r.suave.test(texto) && palabras > 15) return true; // "explica/detalla" → solo si es largo
  return false;
}

/**
 * Elige qué modelo debe responder.
 * @param {string} userMessage - mensaje actual del usuario
 * @param {Array} conversationHistory - historial previo (opcional)
 * @returns {'groq'|'gemini'|'deepseek'}
 */
function selectModel(userMessage, conversationHistory){
  const msg = (userMessage || '').trim();
  const palabras = contarPalabras(msg);
  // El historial aporta contexto: si hay mucho texto previo, Gemini ayuda más.
  const ctxPalabras = (Array.isArray(conversationHistory) ? conversationHistory : [])
    .reduce((n, m) => n + contarPalabras(typeof m.content === 'string' ? m.content : ''), 0);

  // Regla 1 (prioridad máxima): código → DeepSeek
  if (esCodigo(msg)){
    console.log(`[Router] → deepseek (regla 1: código)`);
    return 'deepseek';
  }

  // Regla 3: texto extenso o análisis → Gemini
  if (esRazonamientoLargo(msg, palabras) || ctxPalabras >= reglas.longMinWords * 2){
    console.log(`[Router] → gemini (regla 3: razonamiento largo / ${palabras} palabras)`);
    return 'gemini';
  }

  // Regla 2: corto y casual → Groq (baja latencia)
  if (palabras <= reglas.shortMaxWords){
    console.log(`[Router] → groq (regla 2: mensaje corto)`);
    return 'groq';
  }

  // Regla 4: default configurable
  console.log(`[Router] → ${reglas.defaultModel} (regla 4: default)`);
  return reglas.defaultModel;
}

/**
 * Formatea el system prompt y la conversación según los requerimientos de cada proveedor:
 * - Groq y DeepSeek (compatibles con OpenAI): como mensaje con role: "system" al inicio de messages.
 * - Gemini:
 *     - Para API compatible con OpenAI: role: "system" al inicio de messages.
 *     - Para API nativa / Gemini Live: systemInstruction separado de contents (sin role "system" dentro de contents).
 *
 * @param {Object} params
 * @param {'groq'|'gemini'|'deepseek'|string} params.proveedor
 * @param {string} params.sistemaFinal - prompt de sistema ya ensamblado
 * @param {Array} [params.historial=[]]
 * @param {string} params.mensaje
 * @returns {{ messagesOpenAI: Array, geminiSystemInstruction: Object, geminiContents: Array }}
 */
function formatearMensajesParaProveedor({ proveedor, sistemaFinal, historial = [], mensaje }) {
  const base = Array.isArray(historial) ? historial : [];

  // Formato OpenAI (Groq, DeepSeek y Google OpenAI-compatible endpoint):
  const messagesOpenAI = [
    { role: 'system', content: sistemaFinal },
    ...base,
    { role: 'user', content: mensaje }
  ];

  // Formato Gemini nativo / Live (systemInstruction en la config del modelo, contents solo user/model):
  const geminiSystemInstruction = {
    parts: [{ text: sistemaFinal }]
  };

  const geminiContents = [
    ...base.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
    })),
    {
      role: 'user',
      parts: [{ text: mensaje }]
    }
  ];

  return {
    messagesOpenAI,
    geminiSystemInstruction,
    geminiContents
  };
}

module.exports = {
  selectModel,
  obtenerSystemPrompt,
  SYSTEM_PROMPT_COMPLETO,
  SYSTEM_PROMPT_REDUCIDO,
  formatearMensajesParaProveedor
};