// ============================================================================
// chatEngine.js — Lógica compartida de conversación con la IA.
// ----------------------------------------------------------------------------
// Extraída de server.js para que el flujo web (SSE en /api/chat) y el flujo
// de WhatsApp usen EXACTAMENTE el mismo prompt de sistema, la misma selección
// de modelo (modelRouter.js) y los mismos mensajes de error.
//
// - armarSistema/construirMensajes/... : piezas reutilizadas por /api/chat.
// - solicitarTextoCompleto()          : llamada NO-streaming a la IA que se
//   usa desde el bot de WhatsApp (devuelve el texto completo terminado).
// ============================================================================

const {
  selectModel,
  obtenerSystemPrompt,
  SYSTEM_PROMPT_COMPLETO,
  SYSTEM_PROMPT_REDUCIDO,
  formatearMensajesParaProveedor
} = require('../modelRouter');

// Códigos de idioma admitidos por la app.
const NOMBRES_IDIOMAS = {
  es: 'español',
  en: 'inglés',
  pt: 'portugués',
  fr: 'francés',
  de: 'alemán',
  ja: 'japonés',
  zh: 'chino',
  ar: 'árabe'
};

function lenguajeDe(idioma) {
  return NOMBRES_IDIOMAS[idioma] || 'español';
}

// Instrucción de sistema personalizable que el usuario escribe en Configuración.
function instruccionUsuarioDe(instruccion) {
  return (typeof instruccion === 'string' && instruccion.trim()) ? instruccion.trim() : '';
}

// ------------------------------------------------------------
// Prompt de sistema (variante según canal: chat, whatsapp, voz)
// ------------------------------------------------------------
function armarSistema({ lang = 'español', instruccion, memoriaContexto = '', canal = 'chat', timeZone = 'America/Managua' }) {
  // 1. SYSTEM PROMPT FIJO (SIEMPRE PRIMERO: versión completa o reducida según canal)
  const promptFijo = obtenerSystemPrompt(canal);

  // Directriz de creador e idioma
  const directricesBase = `\n\nResponde en ${lang}. Tu creador es Joshua Blandon Gonzales. Si te preguntan quién es tu creador o quién te programó, responde: "Soy Fenix IA, y fui creado por Joshua Blandon Gonzales."`;

  let sistemaBase = `${promptFijo}${directricesBase}`;

  // 2. CONTEXTO DINÁMICO DE MEMORIA (SIEMPRE DESPUÉS del system prompt fijo)
  if (memoriaContexto && String(memoriaContexto).trim()) {
    sistemaBase += `\n\n-----\n## Contexto dinámico de memoria persistente\n${String(memoriaContexto).trim()}\n\nÚsalas para personalizar tus respuestas cuando aporte valor, sin repetirlas textualmente ni mencionar que consultas una base de datos.`;
  }

  // 3. INSTRUCCIONES ADICIONALES DEL USUARIO (Configuración personalizada)
  const instruccionExtra = instruccionUsuarioDe(instruccion);
  if (instruccionExtra) {
    sistemaBase += `\n\n-----\n## Instrucciones adicionales del usuario\n${instruccionExtra}`;
  }

  // 4. FECHA Y HORA ACTUAL (inyectada al final)
  const ahora = new Date();
  const opcionesFecha = { 
    timeZone, 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };
  const fechaHoraActual = new Intl.DateTimeFormat('es-ES', opcionesFecha).format(ahora);
  
  // Calcular el desfase UTC para esta zona horaria
  const formatterOffset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' });
  const offsetString = formatterOffset.formatToParts(ahora).find(p => p.type === 'timeZoneName').value; // ej: "GMT-6"
  const utcString = ahora.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  sistemaBase += `\n\n-----\n## Contexto temporal\nLa fecha y hora actual del usuario es: ${fechaHoraActual}. (Zona horaria: ${timeZone}, Desfase: ${offsetString}).\nLa hora global actual es: ${utcString}.\nÚsalo como referencia temporal absoluta. NO derives fechas futuras para noticias. Los eventos que coinciden con las noticias provistas ya ocurrieron o están ocurriendo.`;

  // 4. CAPACIDADES OPERATIVAS DEL CANAL
  const canalNorm = String(canal || '').toLowerCase();
  const esCanalReducido = canalNorm === 'whatsapp' || canalNorm === 'wa' || canalNorm === 'voz' || canalNorm === 'voice';

  if (!esCanalReducido) {
    // Capacidades interactivas para el Chat de texto (búsqueda web, imágenes y documentos)
    sistemaBase += `\n\n-----\n## Herramientas y capacidades operativas del chat
1) Puedes crear imágenes: cuando el usuario pida generar, crear o dibujar una imagen, responde ÚNICAMENTE con una sola línea en este formato exacto:
[GENERAR_IMAGEN]: <descripción breve y visual de la imagen, en inglés>

2) Puedes buscar información en tiempo real en la web: cuando necesites datos actuales o el usuario lo pida, responde ÚNICAMENTE con una sola línea en este formato:
[BUSCAR_WEB]: <consulta específica>
Reglas de la consulta: debe incluir el tema central y los nombres relevantes. NUNCA copies instrucciones del usuario como "busca en la web" ni uses frases conversacionales.

3) Fotos reales de personajes y hechos históricos: en biografías, historia o artículos relevantes, inserta en línea separada el marcador:
[FOTO_REAL: Nombre del personaje o evento histórico]`;
  }

  return { sistemaBase, sistemaFinal: sistemaBase };
}

// ------------------------------------------------------------
// Armado del array de mensajes para la API del proveedor
// ------------------------------------------------------------
function construirMensajes({ mensaje, historial, sistemaFinal, proveedor = 'groq', imagenBase64 }) {
  const base = Array.isArray(historial) ? historial : [];
  const formateado = formatearMensajesParaProveedor({
    proveedor,
    sistemaFinal,
    historial: base,
    mensaje,
    imagenBase64
  });

  // Copia de la conversación (sin el system prompt) para la extracción de
  // memorias en segundo plano.
  const mensajesConversacion = [
    ...base,
    { role: 'user', content: mensaje }
  ];

  return {
    mensajes: formateado.messagesOpenAI,
    geminiSystemInstruction: formateado.geminiSystemInstruction,
    geminiContents: formateado.geminiContents,
    mensajesConversacion
  };
}

// ------------------------------------------------------------
// Configuración de cada proveedor (URL, clave y modelo)
// ------------------------------------------------------------
function configurarProveedor(proveedor) {
  if (proveedor === 'deepseek') {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw Object.assign(new Error('DeepSeek no está configurado en el servidor todavía.'), { claveError: true, status: 400 });
    }
    return {
      url: 'https://api.deepseek.com/chat/completions',
      apiKey: process.env.DEEPSEEK_API_KEY,
      modeloIA: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    };
  }

  if (proveedor === 'gemini') {
    if (!process.env.GEMINI_API_KEY) {
      throw Object.assign(new Error('Gemini no está configurado en el servidor todavía.'), { claveError: true, status: 400 });
    }
    // Google ofrece un endpoint compatible con el formato de OpenAI, así que
    // funciona con la misma estructura de petición que Groq y DeepSeek.
    return {
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      apiKey: process.env.GEMINI_API_KEY,
      modeloIA: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
    };
  }

  if (!process.env.GROQ_API_KEY) {
    throw Object.assign(new Error('Groq no está configurado en el servidor (falta GROQ_API_KEY en variables de entorno).'), { claveError: true, status: 400 });
  }

  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: process.env.GROQ_API_KEY,
    modeloIA: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b'
  };
}

// Cuerpo de la petición al proveedor. stream=true para el navegador
// (con respuestas parciales) y stream=false para WhatsApp (texto completo).
function crearCuerpoIA({ modeloIA, mensajes, stream, proveedor, maxTokens = 4096 }) {
  const limiteTokens = proveedor === 'groq' ? Math.min(maxTokens, 800) : maxTokens;
  const cuerpo = {
    model: modeloIA,
    messages: mensajes,
    temperature: 0.7,
    max_tokens: limiteTokens,
    stream: !!stream
  };
  return cuerpo;
}

// Traduce los errores de las APIs a mensajes claros en español para el usuario.
function mensajeErrorIA(proveedor, status, cuerpo) {
  let detalle = '';
  try {
    const j = JSON.parse(cuerpo);
    detalle = (j.error && (j.error.message || j.error)) || JSON.stringify(j);
  } catch (e) {
    detalle = String(cuerpo || '');
  }
  const txt = detalle.toLowerCase();

  if (status === 401) {
    return `La clave de API de ${proveedor} no es válida. Revisa la configuración del servidor.`;
  }
  if (/insufficient balance|billing|payment/i.test(txt)) {
    return `No hay saldo disponible en la cuenta de ${proveedor}. Recarga la cuenta o usa otro modelo.`;
  }
  if (status === 429 || /rate.?limit|quota|exhausted|too many requests/i.test(txt)) {
    return `Límite de peticiones alcanzado en ${proveedor}. Espera un momento e intenta de nuevo.`;
  }
  if (/model.*(not found|not available)|no longer/i.test(txt)) {
    return `El modelo de ${proveedor} no está disponible en este momento.`;
  }
  if (/invalid.*key|unauthorized|forbidden|permission/i.test(txt)) {
    return `Acceso denegado por ${proveedor}. Revisa la clave de API.`;
  }
  if (status >= 500) {
    return `El servicio ${proveedor} está teniendo problemas. Intenta de nuevo en unos segundos.`;
  }
  return `El servicio ${proveedor} devolvió un error. Intenta de nuevo.`;
}

// Quita los bloques de "razonamiento" que mandan algunos modelos en la respuesta
// terminada (el equivalente no-streaming del filtro de server.js).
function limpiarRazonamiento(texto) {
  return String(texto || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .replace(/^\s*thinking\b.*$/m, '')
    .replace(/^\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ------------------------------------------------------------
// Llamada NO-streaming a la IA (usada por el bot de WhatsApp).
// Devuelve { texto, proveedor, mensajesConversacion }.
// Errores del proveedor se lanzan como
//   { esErrorIA, proveedor, status, cuerpo }
// para que el llamador los traduzca con mensajeErrorIA().
// ------------------------------------------------------------
async function solicitarTextoCompleto({
  mensaje,
  historial,
  idioma = 'es',
  instruccion,
  memoriaContexto = '',
  proveedor = null,
  timeoutMs = 90000,
  maxTokens = 1024,
  canal = 'chat'
}) {
  const lang = lenguajeDe(idioma);
  const { sistemaFinal } = armarSistema({ lang, instruccion, memoriaContexto, canal });

  // Si no vino un modelo explícito, el router decide (igual que en la web).
  const real = proveedor || selectModel(mensaje, historial);
  const { mensajes, mensajesConversacion } = construirMensajes({ mensaje, historial, sistemaFinal, proveedor: real });
  const { url, apiKey, modeloIA } = configurarProveedor(real);
  const cuerpoIA = crearCuerpoIA({ modeloIA, mensajes, stream: false, proveedor: real, maxTokens });

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
  try {
    const respuestaIA = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(cuerpoIA),
      signal: controlador.signal
    });

    if (!respuestaIA.ok) {
      const cuerpo = await respuestaIA.text();
      console.error(`Error de ${real}:`, cuerpo);
      throw { esErrorIA: true, proveedor: real, status: respuestaIA.status, cuerpo };
    }

    const datos = await respuestaIA.json();
    const texto = limpiarRazonamiento(datos.choices?.[0]?.message?.content || '');
    return { texto, proveedor: real, mensajesConversacion };
  } finally {
    clearTimeout(temporizador);
  }
}

module.exports = {
  NOMBRES_IDIOMAS,
  lenguajeDe,
  instruccionUsuarioDe,
  armarSistema,
  construirMensajes,
  configurarProveedor,
  crearCuerpoIA,
  mensajeErrorIA,
  limpiarRazonamiento,
  solicitarTextoCompleto,
  obtenerSystemPrompt
};