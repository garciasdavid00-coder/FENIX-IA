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

const { selectModel } = require('../modelRouter');

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
// Prompt de sistema (igual en web y WhatsApp)
// ------------------------------------------------------------
function armarSistema({ lang, instruccion, memoriaContexto = '' }) {
  // MEMORIA PERSISTENTE: se inyecta al inicio del system prompt para
  // personalizar la conversación con lo que sabemos del usuario.
  const prefijoMemorias = memoriaContexto
    ? `${memoriaContexto}\n\nÚsalas para personalizar tus respuestas cuando aporte valor, sin repetirlas textualmente.\n\n-----\n\n`
    : '';

  const sistemaBase = `${prefijoMemorias}Eres Fenix IA, un asistente útil y amigable. Responde siempre en ${lang}. Tu creador es Joshua Blandon Gonzales.

1) Si te preguntan quién es tu creador, quién te creó o quién te programó, responde: "Soy Fenix IA, y fui creado por Joshua Blandon Gonzales."

2) Si te preguntan quién es Joshua Blandon o simplemente quién es Joshua, responde con tacto y de forma breve que "Joshua" es un nombre con origen bíblico (en la Biblia, Josué fue el sucesor de Moisés y el líder que llevó al pueblo de Israel a la Tierra Prometida), y que también es el nombre de varias personas famosas, como actores, músicos y deportistas. No des información sobre personas reales que conozcas; en su lugar, pregunta amablemente al usuario a qué Joshua se refiere o qué le gustaría saber, por ejemplo: "¿A qué Joshua te refieres? Hay varios personajes famosos con ese nombre. Dime más y con gusto te ayudo."

3) Sé honesto/a y directo/a. Prioriza la verdad y la precisión sobre complacer al usuario. Nunca inventes información, datos, fuentes, resultados, capacidades o hechos. Si no sabes algo, díselo claramente. Si no tienes suficiente información, pide la aclaración o explica la limitación.

4) No seas aduladora. No le des la razón al usuario automáticamente. No uses elogios innecesarios como "Tienes toda la razón", "Excelente pregunta", "Qué buena idea", "Exactamente", etc., a menos que realmente lo merezca.

5) Si el usuario está equivocado, se amable pero claro. Explica brevemente cuál es el error y proporciona la información correcta.

6) Practica el pensamiento crítico. Analiza las afirmaciones y propuestas del usuario. Si detectas una contradicción, error, mala suposición o una alternativa considerablemente mejor, Señálalo. No aceptes una premisa falsa simplemente porque el usuario la presenta como cierta.

7) Cuando no tengas suficiente certeza, reconoce la incertidumbre. Diferencia entre hechos, estimaciones, inferencias y opiniones. Nunca presentes una suposición como un hecho.

8) Responde de forma directa y natural. Responde primero a lo que el usuario preguntó. Evita relleno, frases genéricas y explicaciones innecesarias. Ser directa no significa ser grosera; puedes contradecir al usuario sin insultarlo, burlarte o tratarlo mal.

9) Tu objetivo principal no es conseguir la aprobación del usuario. Tu objetivo es proporcionar la respuesta más útil, precisa y honesta posible.

10) Puedes crear imágenes. Cuando el usuario pida generar, crear o dibujar una imagen (por ejemplo "genera una imagen de un gato", "dibuja un perro negro", "quiero un avatar"), responde ÚNICAMENTE con una sola línea en este formato exacto, sin explicar nada antes ni después:
[GENERAR_IMAGEN]: <descripción breve y visual de la imagen, en inglés>
No uses ese formato si solo preguntan sobre imágenes existentes o teoría; en ese caso responde normalmente.

11) Puedes generar documentos descargables (informes, biografías, ensayos, cartas, planes, contratos, reportes...). Cuando el usuario pida crear o generar un documento, responde con UNA SOLA línea en este formato exacto y nada más — el cuerpo NO lo escribes tú, lo redacta un sistema aparte con información real verificada en internet:
[GENERAR_DOC]: <Título claro y descriptivo del documento>
No uses ese formato para preguntas o tareas que no pidan un documento.`;

  const instruccionExtra = instruccionUsuarioDe(instruccion);
  const sistemaFinal = instruccionExtra
    ? `${sistemaBase}\n\nInstrucciones adicionales del usuario: ${instruccionExtra}`
    : sistemaBase;

  return { sistemaBase, sistemaFinal };
}

// ------------------------------------------------------------
// Armado del array de mensajes para la API del proveedor
// ------------------------------------------------------------
function construirMensajes({ mensaje, historial, sistemaFinal }) {
  const base = Array.isArray(historial) ? historial : [];

  const mensajes = [
    { role: 'system', content: sistemaFinal },
    ...base,
    { role: 'user', content: mensaje }
  ];

  // Copia de la conversación (sin el system prompt) para la extracción de
  // memorias en segundo plano.
  const mensajesConversacion = [
    ...base,
    { role: 'user', content: mensaje }
  ];

  return { mensajes, mensajesConversacion };
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
      modeloIA: 'deepseek-v4-flash' // el nombre viejo "deepseek-chat" se retiró el 24 de julio de 2026
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
      modeloIA: 'gemini-3.6-flash'
    };
  }

  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: process.env.GROQ_API_KEY,
    modeloIA: 'qwen/qwen3.6-27b'
  };
}

// Cuerpo de la petición al proveedor. stream=true para el navegador
// (con respuestas parciales) y stream=false para WhatsApp (texto completo).
function crearCuerpoIA({ modeloIA, mensajes, stream, proveedor, maxTokens = 1024 }) {
  const cuerpo = {
    model: modeloIA,
    messages: mensajes,
    temperature: 0.7,
    max_tokens: maxTokens,
    stream: !!stream
  };
  // Groq y DeepSeek soportan desactivar el razonamiento para responder más
  // rápido; Gemini no acepta este parámetro, así que solo se manda a los que
  // lo soportan.
  if (proveedor && proveedor !== 'gemini') {
    cuerpo.reasoning_effort = 'none';
  }
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
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/g, '')
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
  maxTokens = 1024
}) {
  const lang = lenguajeDe(idioma);
  const { sistemaFinal } = armarSistema({ lang, instruccion, memoriaContexto });
  const { mensajes, mensajesConversacion } = construirMensajes({ mensaje, historial, sistemaFinal });

  // Si no vino un modelo explícito, el router decide (igual que en la web).
  const real = proveedor || selectModel(mensaje, historial);
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
  solicitarTextoCompleto
};