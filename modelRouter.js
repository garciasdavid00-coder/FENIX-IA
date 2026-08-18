// Router inteligente de modelos de Fenix IA.
// Analiza el mensaje y elige automáticamente entre groq | gemini | deepseek.
// Solo se usa cuando el usuario NO eligió un modelo manualmente (dropdown en "Auto").
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

module.exports = { selectModel };