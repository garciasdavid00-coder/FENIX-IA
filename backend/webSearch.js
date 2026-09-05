// ============================================================================
// backend/webSearch.js — Motor de Búsqueda Web en tiempo real para Fenix IA.
// ----------------------------------------------------------------------------
// - Detecta automáticamente si una pregunta necesita datos en tiempo real.
// - Realiza búsquedas mediante Google News, DuckDuckGo y Gemini Grounding.
// - Inyecta hechos en vivo para que cualquier modelo (Groq, DeepSeek, Gemini)
//   pueda responder con datos actualizados y fuentes reales clicables.
// ============================================================================

const chatEngine = require('./chatEngine');

const PALABRAS_CLAVE_TIEMPO_REAL = [
  /\b(noticias?|actualidad|hoy|ayer|esta semana|este mes|este a[ñn]o)\b/i,
  /\b(precio(s)?|cotizaci[oó]n|cu[aá]nto\s+vale|cu[aá]nto\s+cuesta|d[oó]lar|euro|bitcoin|btc|eth|crypto|cripto|bolsa|acciones)\b/i,
  /\b(clima|temperatura|pron[oó]stico|tiempo\s+en)\b/i,
  /\b(partido(s)?|resultado(s)?|qui[eé]n\s+gan[oó]|qui[eé]n\s+va\s+ganando|champions|liga|mundial|f[uú]tbol|f1|f[oó]rmula\s+1|nba)\b/i,
  /\b(2025|2026)\b/,
  /\b(estreno(s)?|lanzamiento(s)?|nueva\s+versi[oó]n|actualizaci[oó]n|fichajes?)\b/i,
  /\b(qui[eé]n\s+es\s+el\s+actual|presidente\s+de|ministro\s+de|alcalde\s+de)\b/i,
  /\b(busca(r)?\s+(en\s+)?(internet|la\s+web|google)|investiga\s+(en\s+)?(internet|la\s+web)|googlea)\b/i,
  /\b(qu[eé]\s+pas[oó]\s+con|qu[eé]\s+ha\s+pasado|qu[eé]\s+est[aá]\s+pasando)\b/i,
  /\b(cu[aá]ndo\s+(sale|se\s+estrena|juega|ser[aá]))\b/i
];

/**
 * Determina si un mensaje del usuario amerita consultar la web en vivo.
 * @param {string} mensaje
 * @param {Array} historial
 * @returns {boolean}
 */
function detectarNecesidadBusqueda(mensaje, historial = []) {
  if (!mensaje || typeof mensaje !== 'string') return false;
  const texto = mensaje.trim();

  // 1) Petición explícita
  if (/\b(busca|investiga|googlea|consulta\s+en\s+la\s+web|busca\s+en\s+la\s+web)\b/i.test(texto)) {
    return true;
  }

  // 2) Patrones de tiempo real
  for (const regex of PALABRAS_CLAVE_TIEMPO_REAL) {
    if (regex.test(texto)) return true;
  }

  return false;
}

/**
 * Limpia la query para el buscador.
 * @param {string} mensaje
 * @returns {string}
 */
function extraerQueryBusqueda(mensaje) {
  let q = String(mensaje || '').trim();
  q = q.replace(/^(por\s+favor\s+)?(busca|investiga|googlea|averigua|dime|cu[aá]l\s+es|qu[eé]\s+es)(\s+en\s+(internet|la\s+web|google))?(\s+sobre|\s+acerca\s+de)?\s+/i, '');
  return q.slice(0, 150) || mensaje;
}

/**
 * Busca fuentes en vivo mediante Google News RSS y Wikipedia.
 * @param {string} query
 * @returns {Promise<{hechos: Array<string>, fuentes: Array<{titulo: string, url: string}>}>}
 */
async function buscarWebMultiFuente(query) {
  const fuentes = [];
  const hechos = [];

  // 1. Google News RSS en tiempo real
  try {
    const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(query) + '&hl=es-419&gl=MX&ceid=MX:es-419';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    const xml = await res.text();
    const itemMatches = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/gi)];
    for (const m of itemMatches.slice(0, 6)) {
      const rawTitle = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
      const rawUrl = m[2].trim();
      const fecha = m[3].trim();
      if (rawTitle && rawUrl) {
        fuentes.push({ titulo: rawTitle, url: rawUrl });
        hechos.push(`- Noticia/Hecho web: "${rawTitle}" (Fecha: ${fecha})`);
      }
    }
  } catch (e) {
    console.error('[WebSearch] Error Google News:', e.message);
  }

  // 2. Wikipedia Search API
  try {
    const wikiUrl = 'https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(query) + '&format=json&utf8=1&srlimit=2';
    const res = await fetch(wikiUrl);
    const data = await res.json();
    const results = (data.query && data.query.search) || [];
    for (const r of results) {
      const title = r.title;
      const snippet = r.snippet.replace(/<[^>]+>/g, '').trim();
      const pageUrl = `https://es.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
      fuentes.push({ titulo: `${title} - Wikipedia`, url: pageUrl });
      hechos.push(`- Wikipedia [${title}]: ${snippet}`);
    }
  } catch (e) {
    console.error('[WebSearch] Error Wikipedia:', e.message);
  }

  return { hechos, fuentes: fuentes.slice(0, 5) };
}

/**
 * Ejecuta la búsqueda web y redacta la respuesta usando el modelo configurado.
 * Si Gemini Grounding no está disponible (ej. 429 quota), usa el motor de búsqueda
 * multi-fuente con Groq / DeepSeek garantizando que SIEMPRE responda con datos reales.
 */
async function ejecutarBusquedaWebCompleta({
  mensaje,
  historial = [],
  lang = 'español',
  apiKey,
  instruccionExtra = '',
  memoriaContexto = ''
}) {
  const query = extraerQueryBusqueda(mensaje);

  // 1) Intentar Gemini Grounding si hay API Key disponible
  if (apiKey) {
    try {
      const urlApi = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + encodeURIComponent(apiKey);
      const promptSistema = `Eres Fenix IA, un asistente útil y actualizado. Responde siempre en ${lang}. Tu creador es Joshua Blandon Gonzales.
Tienes acceso a Google Search Grounding.
1) Basa tu respuesta en la información más reciente de la búsqueda.
2) Cita hechos, precios, fechas y nombres comprobables.
3) Sé conciso y directo.${memoriaContexto ? '\n\n' + memoriaContexto : ''}${instruccionExtra ? '\n\n' + instruccionExtra : ''}`;

      const contents = [];
      const ultimosMensajes = (Array.isArray(historial) ? historial : []).slice(-6);
      for (const m of ultimosMensajes) {
        const role = m.role === 'assistant' ? 'model' : 'user';
        const text = typeof m.content === 'string' ? m.content : '';
        if (text.trim()) contents.push({ role, parts: [{ text }] });
      }
      contents.push({ role: 'user', parts: [{ text: mensaje }] });

      const resp = await fetch(urlApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: promptSistema }] },
          contents,
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const candidato = data && data.candidates && data.candidates[0];
        const partes = (candidato && candidato.content && candidato.content.parts) || [];
        const texto = partes.filter(p => typeof p.text === 'string').map(p => p.text).join('').trim();
        const chunks = (candidato && candidato.groundingMetadata && candidato.groundingMetadata.groundingChunks) || [];
        const fuentes = chunks
          .map(c => ({ titulo: (c.web && c.web.title) || '', url: (c.web && c.web.uri) || '' }))
          .filter(f => f.url && f.url.startsWith('http'));

        if (texto) {
          return { texto, fuentes: fuentes.slice(0, 6) };
        }
      } else {
        console.warn('[WebSearch] Gemini falló (código ' + resp.status + '), usando buscador web multi-fuente...');
      }
    } catch (e) {
      console.warn('[WebSearch] Error con Gemini Grounding, usando buscador multi-fuente:', e.message);
    }
  }

  // 2) Fallback Universal Multi-Fuente con Groq / DeepSeek
  const { hechos, fuentes } = await buscarWebMultiFuente(query);

  const fechaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const sistemaConHechos = `Eres Fenix IA, un asistente útil, veraz y actualizado. Responde siempre en ${lang}. Tu creador es Joshua Blandon Gonzales.

INFORMACIÓN EN TIEMPO REAL EXTRAÍDA DE LA WEB (Fecha actual: ${fechaHoy}):
${hechos.length ? hechos.join('\n') : 'No se encontraron titulares directos.'}

INSTRUCCIONES:
1) Basa tu respuesta en los datos, cotizaciones, noticias y hechos reales mostrados arriba.
2) Menciona los datos y precios específicos disponibles. Si varían por país (ej. México, Colombia, Argentina) o por mercado (oficial, paralelo, etc.), indícalo con claridad.
3) NUNCA digas "no tengo acceso a datos en tiempo real" ya que se te acaban de proporcionar los datos de la web en vivo arriba.
4) Responde de forma concisa y estructurada.${memoriaContexto ? '\n\n' + memoriaContexto : ''}${instruccionExtra ? '\n\n' + instruccionExtra : ''}`;

  const mensajes = [
    { role: 'system', content: sistemaConHechos },
    ...(Array.isArray(historial) ? historial.slice(-6) : []),
    { role: 'user', content: mensaje }
  ];

  const proveedor = process.env.GROQ_API_KEY ? 'groq' : (process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'groq');
  const { url: urlIA, apiKey: keyIA, modeloIA } = chatEngine.configurarProveedor(proveedor);
  const cuerpoIA = chatEngine.crearCuerpoIA({ modeloIA, mensajes, stream: false, proveedor });

  const resIA = await fetch(urlIA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyIA}` },
    body: JSON.stringify(cuerpoIA)
  });

  const dataIA = await resIA.json();
  const rawText = dataIA.choices?.[0]?.message?.content || 'No se pudo generar la respuesta con la búsqueda.';
  const textoLimpio = chatEngine.limpiarRazonamiento(rawText);

  return {
    texto: textoLimpio,
    fuentes
  };
}

/**
 * Busca en la web usando Gemini con Grounding de Google Search.
 * Patrón idéntico a generarDocumentoConHechosReales (promptDocumentos.js).
 * Devuelve el texto de respuesta resumido + array de fuentes reales.
 * @param {{ consulta: string, apiKey: string, modelo?: string, lang?: string }} opts
 * @returns {Promise<{ texto: string, fuentes: {titulo: string, url: string}[] }>}
 */
async function buscarEnWeb({ consulta, apiKey, modelo, lang = 'español' }) {
  const query = String(consulta || '').trim();
  if (!query) {
    throw new Error('buscarEnWeb: falta la "consulta".');
  }
  if (!apiKey) {
    throw new Error('buscarEnWeb: falta la GEMINI_API_KEY.');
  }

  const modeloIA = modelo || 'gemini-3.6-flash';
  const urlApi = 'https://generativelanguage.googleapis.com/v1beta/models/'
    + encodeURIComponent(modeloIA)
    + ':generateContent?key=' + encodeURIComponent(apiKey);

  const promptSistema = `Eres Fenix IA, un asistente de búsqueda web preciso y actualizado. Responde siempre en ${lang}. Tu creador es Joshua Blandon Gonzales.
Tienes acceso a Google Search Grounding para obtener información en tiempo real.

REGLAS:
1) Basa tu respuesta EXCLUSIVAMENTE en los resultados de búsqueda reales (grounding).
2) NO inventes datos, fechas, precios, cifras, nombres ni eventos.
3) Si el buscador no da información sobre algo, omítelo o indica que no hay dato verificado.
4) Sé conciso, directo y útil. Responde a lo que se preguntó sin relleno.
5) Cita hechos, precios, fechas y nombres comprobables que aparezcan en las fuentes.
6) Máximo 3-4 párrafos. Usa lenguaje natural, no listes las fuentes en el texto (se añaden aparte).`;

  const cuerpo = {
    systemInstruction: { parts: [{ text: promptSistema }] },
    contents: [{ role: 'user', parts: [{ text: query.slice(0, 2000) }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048
    }
  };

  console.log('[buscarEnWeb] Consultando Gemini (' + modeloIA + ') con grounding para: ' + query.slice(0, 80));

  const respuesta = await fetch(urlApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  });

  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const detalle = (data && data.error && data.error.message) ||
      JSON.stringify(data).slice(0, 400) || respuesta.statusText;
    console.error('[buscarEnWeb] Gemini respondió', respuesta.status + ':', detalle);
    // Cuota agotada (429) → aviso en logs pero no falla silenciosamente
    if (respuesta.status === 429) {
      console.warn('[buscarEnWeb] CUOTA DE GROUNDING AGOTADA (429). Límite gratis superado.');
    }
    throw new Error('Gemini respondió ' + respuesta.status + ': ' + detalle);
  }

  const candidato = data && data.candidates && data.candidates[0];
  const partes = (candidato && candidato.content && candidato.content.parts) || [];

  const texto = partes
    .filter(p => typeof p.text === 'string')
    .map(p => p.text)
    .join('')
    .trim();

  if (!texto) {
    const motivoBloqueo = (candidato && candidato.finishReason) || 'desconocido';
    console.error('[buscarEnWeb] Gemini devolvió respuesta vacía. finishReason =', motivoBloqueo);
    throw new Error('La búsqueda salió vacía de la API de Gemini (finishReason: ' + motivoBloqueo + ').');
  }

  // Fuentes REALES del grounding
  const chunks = (candidato && candidato.groundingMetadata && candidato.groundingMetadata.groundingChunks) || [];
  const fuentes = chunks
    .map(c => ({ titulo: (c.web && c.web.title) || '', url: (c.web && c.web.uri) || '' }))
    .filter(f => f.url && f.url.startsWith('http'));

  console.log('[buscarEnWeb] Búsqueda lista (' + texto.length + ' caracteres, ' + fuentes.length + ' fuentes).');

  return { texto, fuentes: fuentes.slice(0, 6) };
}

module.exports = {
  detectarNecesidadBusqueda,
  extraerQueryBusqueda,
  buscarWebMultiFuente,
  ejecutarBusquedaWebCompleta,
  buscarEnWeb
};
