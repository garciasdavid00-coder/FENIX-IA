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
  if (!query || !String(query).trim()) {
    return {
      texto: 'No pude extraer una consulta válida para buscar en la web.',
      fuentes: []
    };
  }

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
  let hechos = [];
  let fuentes = [];
  try {
    const resultado = await buscarWebMultiFuente(query);
    hechos = Array.isArray(resultado.hechos) ? resultado.hechos : [];
    fuentes = Array.isArray(resultado.fuentes) ? resultado.fuentes : [];
  } catch (e) {
    console.error('[WebSearch] Error al ejecutar la búsqueda multi-fuente:', e.message);
  }

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

  let rawText = 'No se pudo generar la respuesta con la búsqueda.';
  try {
    const resIA = await fetch(urlIA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyIA}` },
      body: JSON.stringify(cuerpoIA)
    });

    if (!resIA.ok) {
      const detalle = await resIA.text().catch(() => '');
      console.warn('[WebSearch] El proveedor de respaldo devolvió error:', resIA.status, detalle.slice(0, 200));
      return {
        texto: 'He intentado buscar información actualizada, pero el proveedor de respuesta no está disponible en este momento.',
        fuentes: fuentes.slice(0, 6)
      };
    }

    const dataIA = await resIA.json();
    rawText = dataIA.choices?.[0]?.message?.content || rawText;
  } catch (e) {
    console.error('[WebSearch] Error al pedir respuesta al proveedor de respaldo:', e.message);
    return {
      texto: 'He intentado buscar información actualizada, pero la respuesta final no pudo generarse por un error temporal del servicio.',
      fuentes: fuentes.slice(0, 6)
    };
  }

  const textoLimpio = chatEngine.limpiarRazonamiento(rawText);

  return {
    texto: textoLimpio || 'No se pudo generar la respuesta con la búsqueda.',
    fuentes: fuentes.slice(0, 6)
  };
}

/**
 * Busca en la web usando la API de Searlo (SERP de Google) y devuelve
 * un contexto de texto + array de fuentes reales clicables.
 * El modelo de chat redacta la respuesta final con ese contexto.
 * @param {{ consulta: string, apiKey?: string, lang?: string }} opts
 * @returns {Promise<{ texto: string, fuentes: {titulo: string, url: string}[] }>}
 */
async function buscarEnWeb({ consulta, apiKey, lang = 'español' }) {
  const query = String(consulta || '').trim();
  if (!query) {
    console.warn('[buscarEnWeb] Consulta vacía; devolviendo respuesta segura.');
    return {
      texto: 'No pude extraer una consulta válida para buscar en la web.',
      fuentes: []
    };
  }

  const key = apiKey || process.env.SEARLO_API_KEY;
  if (!key) {
    console.warn('[buscarEnWeb] falta la SEARLO_API_KEY en .env; devolviendo respuesta segura.');
    return {
      texto: 'La búsqueda en la web no está disponible porque falta la clave del servicio externo.',
      fuentes: []
    };
  }

  try {
    const urlApi = new URL('https://api.searlo.tech/api/v1/search/web');
    urlApi.searchParams.set('q', query.slice(0, 500));
    urlApi.searchParams.set('limit', '8');
    urlApi.searchParams.set('gl', 'us');
    urlApi.searchParams.set('hl', 'es');

    console.log('[buscarEnWeb] Consultando Searlo para: ' + query.slice(0, 80));

    const respuesta = await fetch(urlApi, {
      headers: { 'x-api-key': key }
    });

    const data = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      const detalle =
        (data && data.message) || (data && data.error) || String(respuesta.status);
      console.error('[buscarEnWeb] Searlo respondió ' + respuesta.status + ': ' + detalle);
      if (respuesta.status === 402) {
        console.warn('[buscarEnWeb] CRÉDITOS DE SEARLO AGOTADOS (402). Revisa dashboard.searlo.tech');
      }
      if (respuesta.status === 429) {
        console.warn('[buscarEnWeb] RATE LIMIT DE SEARLO (429). Espera un momento e intenta de nuevo.');
      }
      return {
        texto: 'He intentado buscar información actualizada, pero el servicio de búsqueda web respondió con error temporal.',
        fuentes: []
      };
    }

    const items = (data && (Array.isArray(data.organic) ? data.organic : (Array.isArray(data.items) ? data.items : [])))
      .filter(it => it && it.title && it.link);

    if (!items.length) {
      console.error('[buscarEnWeb] Searlo devolvió resultados vacíos.');
      return {
        texto: 'La búsqueda web respondió sin resultados útiles en este momento.',
        fuentes: []
      };
    }

    const fuentes = items.slice(0, 6).map(it => ({
      titulo: String(it.title).trim(),
      url: it.link
    }));

    const texto = items
      .slice(0, 5)
      .map((it, i) => {
        const snippet = (it.snippet || '').trim();
        return `${i + 1}. ${it.title}${snippet ? ' — ' + snippet : ''}`;
      })
      .join('\n');

    console.log('[buscarEnWeb] Búsqueda lista (' + items.length + ' resultados, ' + fuentes.length + ' fuentes).');

    return { texto, fuentes };
  } catch (e) {
    console.error('[buscarEnWeb] Error inesperado en la búsqueda web:', e && e.message ? e.message : e);
    return {
      texto: 'La búsqueda web no pudo completarse por un error temporal del servicio externo.',
      fuentes: []
    };
  }
}

module.exports = {
  detectarNecesidadBusqueda,
  extraerQueryBusqueda,
  buscarWebMultiFuente,
  ejecutarBusquedaWebCompleta,
  buscarEnWeb
};
