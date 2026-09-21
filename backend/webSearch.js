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
 * @returns {Promise<boolean>}
 */
const cacheBusquedas = new Map();
function obtenerDeCache(query) {
  const ahora = Date.now();
  const cached = cacheBusquedas.get(query);
  if (cached && (ahora - cached.timestamp < 5 * 60 * 1000)) {
    return cached.resultado;
  }
  return null;
}
function guardarEnCache(query, resultado) {
  cacheBusquedas.set(query, { resultado, timestamp: Date.now() });
}

/**
 * Evalúa si se debe buscar en la web.
 * Devuelve: { buscar: boolean, consulta: string, via: string }
 */
async function evaluarBusquedaAutomatica(mensaje, historial = []) {
  if (process.env.BUSQUEDA_AUTO === 'off') return { buscar: false };
  const texto = String(mensaje || '').trim();
  if (!texto) return { buscar: false };

  // Filtro rápido para saltar (código o saludos muy cortos)
  if (/^hola$/i.test(texto) || texto.includes('```')) {
    return { buscar: false };
  }

  // Filtro rápido de palabras claras
  const regexRapido = /\b(hoy|ahora|ayer|mañana|esta semana|último|última|resultado|quién ganó|a qué hora|cuándo|precio|clima|lluvia|noticias|dólar)\b/i;
  if (regexRapido.test(texto) || /\b(busca|investiga)\b/i.test(texto)) {
    console.log('[busqueda-auto] via=filtro, buscar=true, consulta="' + texto + '"');
    return { buscar: true, consulta: extraerQueryBusqueda(texto), via: 'filtro' };
  }

  // Clasificador LLM
  try {
    const startMs = Date.now();
    const ultimos = historial.slice(-4).map(m => m.role + ': ' + m.content).join('\n');
    const promptClasificador = `Analiza si el siguiente mensaje requiere buscar en internet (eventos y noticias recientes, resultados deportivos, horarios de eventos, clima, precios y tipo de cambio, personas en cargos actuales, versiones recientes de software, negocios o lugares locales, "hoy/ahora/último/actual", y cualquier dato que pueda haber cambiado).
Responde SOLO con un JSON estricto con este formato: {"buscar": true|false, "consulta": "consulta autocontenida en el idioma del usuario"}.
Ante la duda, "buscar": true.
La consulta debe incluir nombres y contexto de los mensajes anteriores.
No uses markdown en tu respuesta, SOLO el JSON puro.

Mensajes anteriores:
${ultimos}

Mensaje actual:
${texto}
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: promptClasificador }],
        temperature: 0,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await res.json();
    const contenido = data.choices?.[0]?.message?.content?.trim();
    if (contenido) {
      const parsed = JSON.parse(contenido);
      const elapsed = Date.now() - startMs;
      console.log(`[busqueda-auto] via=clasificador, buscar=${parsed.buscar}, consulta="${parsed.consulta}", ms=${elapsed}`);
      return { buscar: !!parsed.buscar, consulta: parsed.consulta || texto, via: 'clasificador' };
    }
  } catch (e) {
    console.warn('[busqueda-auto] Error o timeout en clasificador:', e.name === 'AbortError' ? 'Timeout 2s' : e.message);
  }
  return { buscar: false };
}

/**
 * Limpia la query para el buscador.
 * @param {string} mensaje
 * @returns {string}
 */
function extraerQueryBusqueda(mensaje) {
  let q = String(mensaje || '').trim();
  q = q.replace(/^(por\s+favor\s+)?(busca(r)?|investiga(r)?|googlea(r)?|averigua(r)?|dime|cu[aá]l\s+es|caul\s+es|qu[eé]\s+es)(\s+en\s+(internet|la\s+web|google))?(\s+sobre|\s+acerca\s+de)?\s+/i, '');
  q = q.replace(/^[¿?¡!'"“«\s]+|[¿?¡!'"”»\s]+$/g, '').trim();
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
/**
 * Determina si el mensaje del usuario pregunta sobre tipo de cambio o divisas.
 */
function detectarConsultaTipoCambio(mensaje) {
  if (!mensaje || typeof mensaje !== 'string') return false;
  return /\b(d[oó]lar|dolares|peso(s)?|usd|mxn|tipo\s+de\s+cambio|cotizaci[oó]n|cu[aá]nto\s+est[aá]\s+el\s+d[oó]lar|precio\s+del\s+d[oó]lar|cambio\s+de\s+d[oó]lar|d[oó]lar\s+hoy|euro(s)?|eur)\b/i.test(mensaje);
}

/**
 * Consulta la API oficial de Frankfurter para obtener la serie de 30 días y calcular tendencia.
 */
async function obtenerHistoricoDivisas(from = 'USD', to = 'MXN', dias = 30) {
  try {
    const hoy = new Date();
    const haceDias = new Date(Date.now() - dias * 24 * 3600 * 1000);
    const fFin = hoy.toISOString().slice(0, 10);
    const fInicio = haceDias.toISOString().slice(0, 10);

    const res = await fetch(`https://api.frankfurter.dev/v1/${fInicio}..${fFin}?from=${from}&to=${to}`, {
      headers: { 'User-Agent': 'FenixIA/1.0' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const rates = data.rates || {};
    const fechas = Object.keys(rates).sort();
    if (fechas.length < 2) return null;

    const puntos = fechas.map(f => ({
      fecha: f,
      valor: Number(rates[f][to])
    })).filter(p => typeof p.valor === 'number' && !Number.isNaN(p.valor));

    if (puntos.length < 2) return null;

    const inicial = puntos[0].valor;
    const final = puntos[puntos.length - 1].valor;
    const valores = puntos.map(p => p.valor);
    const minimo = Math.min(...valores);
    const maximo = Math.max(...valores);
    const diff = final - inicial;
    const porcentajeNum = (diff / inicial) * 100;
    const porcentaje = porcentajeNum.toFixed(2);
    const subio = porcentajeNum > 0.05;
    const bajo = porcentajeNum < -0.05;

    let tendenciaTexto = '';
    if (subio) {
      tendenciaTexto = `↑ El dólar ha subido un ${porcentaje}% este mes (el peso se depreció un ${porcentaje}%)`;
    } else if (bajo) {
      const absPct = Math.abs(porcentajeNum).toFixed(2);
      tendenciaTexto = `↓ El dólar ha bajado un ${absPct}% este mes (el peso se apreció un ${absPct}%)`;
    } else {
      tendenciaTexto = `→ El tipo de cambio se ha mantenido prácticamente estable este mes (${porcentaje}%)`;
    }

    return {
      from,
      to,
      puntos,
      inicial: inicial.toFixed(4),
      final: final.toFixed(4),
      minimo: minimo.toFixed(4),
      maximo: maximo.toFixed(4),
      porcentaje,
      subio,
      bajo,
      tendenciaTexto
    };
  } catch (e) {
    console.warn('[obtenerHistoricoDivisas] Excepción consultando Frankfurter:', e.message);
    return null;
  }
}

/**
 * Ejecuta la búsqueda web y redacta la respuesta usando el modelo configurado.
 * Con soporte especializado para tipo de cambio (Timestamp exacto, tendencia 30 días, mini gráfico y fuentes reducidas).
 */
async function ejecutarBusquedaWebCompleta({
  mensaje,
  historial = [],
  lang = 'español',
  apiKey,
  instruccionExtra = '',
  memoriaContexto = '',
  timeZone
}) {
  const query = extraerQueryBusqueda(mensaje);
  if (!query || !String(query).trim()) {
    return {
      texto: 'No pude extraer una consulta válida para buscar en la web.',
      fuentes: []
    };
  }

  // ¿Es una consulta sobre divisas / tipo de cambio?
  const esTipoCambio = detectarConsultaTipoCambio(mensaje);

  // 1) Búsqueda Web Elegante vía Searlo (Google Search real y limpio)
  let busqueda = { texto: '', fuentes: [] };
  try {
    busqueda = await buscarEnWeb({ consulta: query, lang, timeZone });
  } catch (e) {
    console.error('[WebSearch] Error al buscar en Searlo:', e.message);
  }

  // Para consultas de divisas limitamos las fuentes a 2-3 para no saturar
  const fuentesFinales = esTipoCambio
    ? (busqueda.fuentes || []).slice(0, 3)
    : (busqueda.fuentes || []).slice(0, 6);

  // 2) Si es tipo de cambio, consultamos histórico de 30 días para calcular tendencia exacta y gráfico
  let historico = null;
  if (esTipoCambio) {
    historico = await obtenerHistoricoDivisas('USD', 'MXN', 30);
  }

  // 3) TIMESTAMP: hora y fecha exactas del servidor (hora de México)
  const ahora = new Date();
  const horaExacta = ahora.toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Mexico_City'
  });
  const fechaHoy = ahora.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Mexico_City'
  });

  let instruccionesEspeciales = '';
  if (esTipoCambio) {
    instruccionesEspeciales = `

INSTRUCCIONES CLAVE PARA TIPO DE CAMBIO (RESPUESTA SIMPLE, ELEGANTE Y DIRECTA):
- SÉ BREVE Y DIRECTO: Responde en 2 o 3 oraciones concisas y fluidas. NO uses títulos ni encabezados largos (prohibido "Variación según la fuente", "Tendencia en los últimos 30 días", etc.) ni listas de viñetas.
- Da el valor actual de inmediato en la primera frase indicando la hora (ej: "El dólar cotiza actualmente en torno a los **$17.14 MXN** (a las ${horaExacta} de hoy).").
- Explica brevemente en una sola frase si varía en bancos (ej: "En ventanillas bancarias se ubica cerca de **$17.50 MXN** por el diferencial comercial.").
- Menciona la tendencia mensual en una frase corta (ej: "${historico ? historico.tendenciaTexto : 'ha mostrado estabilidad este mes'}").
- La aplicación dibuja automáticamente el gráfico interactivo con el rango mensual, por lo que NO debes listar mínimos ni máximos en texto.`;
  }

  const sistemaConHechos = `Eres Fenix IA, un asistente financiero y de información útil, veraz y actualizado. Responde siempre en ${lang}. Tu creador es Joshua Blandon Gonzales.

INFORMACIÓN EN TIEMPO REAL EXTRAÍDA DE LA WEB (Google Search - ${fechaHoy} a las ${horaExacta}):
${busqueda.texto || 'No se encontraron resultados directos.'}
${historico ? `\nDATOS HISTÓRICOS OFICIALES (Últimos 30 días):\n- Cotización hace 30 días: $${historico.inicial} MXN\n- Cotización reciente: $${historico.final} MXN\n- Mínimo del mes: $${historico.minimo} MXN\n- Máximo del mes: $${historico.maximo} MXN\n- Variación: ${historico.tendenciaTexto}` : ''}

INSTRUCCIONES GENERALES:
1) Basa tu respuesta en los datos reales mostrados arriba. Usa negritas en las cifras clave y formato limpio.
2) Cita los hechos concretos, precios y nombres de fuentes reales (ej. Banxico, DOF, Investing, Wise).
3) NUNCA digas "no tengo acceso a internet" ya que se te proporcionan los datos en vivo arriba.${instruccionesEspeciales}${memoriaContexto ? '\n\n' + memoriaContexto : ''}${instruccionExtra ? '\n\n' + instruccionExtra : ''}`;

  const mensajes = [
    { role: 'system', content: sistemaConHechos },
    ...(Array.isArray(historial) ? historial.slice(-6) : []),
    { role: 'user', content: mensaje }
  ];

  // 4) Redacción elegante con Gemini o Groq
  let rawText = '';
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${geminiKey}`
        },
        body: JSON.stringify({
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
          messages: mensajes,
          temperature: 0.3,
          max_tokens: 2048
        })
      });
      if (resp.ok) {
        const d = await resp.json();
        rawText = d.choices?.[0]?.message?.content || '';
      }
    } catch (eGem) {
      console.warn('[WebSearch] Falló redacción con Gemini:', eGem.message);
    }
  }

  // Fallback a Groq si Gemini no respondió
  if (!rawText && process.env.GROQ_API_KEY) {
    try {
      const config = chatEngine.configurarProveedor('groq');
      const cuerpo = chatEngine.crearCuerpoIA({ modeloIA: config.modeloIA, mensajes, stream: false, proveedor: 'groq' });
      const respGroq = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify(cuerpo)
      });
      if (respGroq.ok) {
        const dGroq = await respGroq.json();
        rawText = dGroq.choices?.[0]?.message?.content || '';
      }
    } catch (eGroq) {
      console.error('[WebSearch] Falló redacción con Groq:', eGroq.message);
    }
  }

  let textoLimpio = chatEngine.limpiarRazonamiento(rawText) || 'No se pudo generar la información del tipo de cambio.';

  // Garantizar que el marcador [FENIX_CHART:...] esté presente si hay datos históricos disponibles
  if (esTipoCambio && historico && Array.isArray(historico.puntos) && historico.puntos.length >= 2) {
    if (!textoLimpio.includes('[FENIX_CHART:')) {
      const chartPayload = {
        titulo: `Evolución ${historico.from}/${historico.to} (Últimos 30 días)`,
        from: historico.from,
        to: historico.to,
        puntos: historico.puntos,
        minimo: historico.minimo,
        maximo: historico.maximo,
        porcentaje: historico.porcentaje,
        subio: historico.subio,
        bajo: historico.bajo
      };
      textoLimpio = textoLimpio.trimEnd() + `\n\n[FENIX_CHART:${JSON.stringify(chartPayload)}]`;
    }
  }

  return {
    texto: textoLimpio,
    fuentes: fuentesFinales
  };
}

/**
 * Busca en la web usando la API de Searlo (SERP de Google) y devuelve
 * un contexto de texto + array de fuentes reales clicables.
 * El modelo de chat redacta la respuesta final con ese contexto.
 * @param {{ consulta: string, apiKey?: string, lang?: string }} opts
 * @returns {Promise<{ texto: string, fuentes: {titulo: string, url: string}[] }>}
 */
async function buscarEnWeb({ consulta, apiKey, lang = 'español', timeZone = 'America/Managua' }) {
  const query = String(consulta || '').trim();
  if (!query) {
    console.warn('[buscarEnWeb] Consulta vacía; devolviendo respuesta segura.');
    return {
      texto: 'No pude extraer una consulta válida para buscar en la web.',
      fuentes: []
    };
  }

  const keySearlo = apiKey || process.env.SEARLO_API_KEY;
  const keyTavily = process.env.TAVILY_API_KEY;
  const keySerper = process.env.SERPER_API_KEY;

  // 1) Intentar con Searlo API
  if (keySearlo) {
    try {
      const urlApi = new URL('https://api.searlo.tech/api/v1/search/web');
      urlApi.searchParams.set('q', query.slice(0, 500));
      urlApi.searchParams.set('limit', '8');
      const langCodigo = (lang || 'es').slice(0, 2);
      urlApi.searchParams.set('hl', langCodigo);
      urlApi.searchParams.set('gl', langCodigo === 'es' ? 'mx' : 'us');

      console.log('[buscarEnWeb] Consultando Searlo API para: ' + query.slice(0, 80));

      const respuesta = await fetch(urlApi, {
        headers: { 'x-api-key': keySearlo }
      });

      const data = await respuesta.json().catch(() => ({}));

      if (respuesta.ok) {
        const items = (data && (Array.isArray(data.organic) ? data.organic : (Array.isArray(data.items) ? data.items : (Array.isArray(data.results) ? data.results : []))))
          .filter(it => it && (it.title || it.name) && (it.link || it.url));

        if (items.length) {
          const fuentes = items.slice(0, 5).map(it => ({
            titulo: String(it.title || it.name).trim(),
            url: it.link || it.url
          }));

          const ahora = new Date();
          const fmtCorto = new Intl.DateTimeFormat('es-ES', { 
            timeZone, month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true 
          });

          const texto = items
            .slice(0, 5)
            .map((it, i) => {
              const titulo = String(it.title || it.name).trim();
              const snippet = String(it.snippet || it.content || it.description || '').trim();
              
              let dateStr = '';
              if (it.date) {
                const d = new Date(it.date);
                if (!isNaN(d.getTime())) {
                  const diffMinutos = Math.floor((ahora - d) / 60000);
                  let rel = '';
                  if (diffMinutos >= 0 && diffMinutos < 60) rel = `hace ${diffMinutos} min`;
                  else if (diffMinutos >= 60 && diffMinutos < 1440) rel = `hace ${Math.floor(diffMinutos / 60)}h`;
                  else if (diffMinutos >= 1440 && diffMinutos < 2880) rel = 'ayer';
                  else rel = `hace ${Math.floor(diffMinutos / 1440)} días`;
                  
                  dateStr = ` [Publicado: ${fmtCorto.format(d)} (${rel})]`;
                } else {
                  dateStr = ` [Fecha: ${it.date}]`;
                }
              }
              
              return `${i + 1}. ${titulo}${dateStr}${snippet ? ' — ' + snippet : ''}`;
            })
            .join('\n');

          return { texto, fuentes };
        }
      } else {
        const detalle = (data && data.message) || (data && data.error) || String(respuesta.status);
        console.warn('[buscarEnWeb] Searlo respondió error (' + respuesta.status + ': ' + detalle + ')');
      }
    } catch (e) {
      console.warn('[buscarEnWeb] Excepción en Searlo:', e && e.message ? e.message : e);
    }
  }

  // 2) Intentar con Tavily API (si está configurada)
  if (keyTavily) {
    try {
      console.log('[buscarEnWeb] Consultando Tavily Search para: ' + query.slice(0, 80));
      const respTav = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: keyTavily,
          query: query.slice(0, 400),
          search_depth: 'basic',
          max_results: 6,
          include_answer: true
        })
      });
      if (respTav.ok) {
        const dataTav = await respTav.json();
        const results = dataTav.results || [];
        if (results.length) {
          const fuentes = results.map(r => ({ titulo: r.title, url: r.url }));
          const texto = (dataTav.answer ? `Resumen general: ${dataTav.answer}\n\n` : '') +
            results.map((r, i) => `${i + 1}. ${r.title} — ${r.content || ''}`).join('\n');
          console.log('[buscarEnWeb] Búsqueda Tavily exitosa.');
          return { texto, fuentes };
        }
      }
    } catch (eTav) {
      console.warn('[buscarEnWeb] Excepción en Tavily:', eTav.message);
    }
  }

  // 3) Intentar con Serper API (Google Search oficial si está configurada)
  if (keySerper) {
    try {
      console.log('[buscarEnWeb] Consultando Serper (Google) para: ' + query.slice(0, 80));
      const respSerp = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': keySerper,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query, gl: 'es', hl: 'es', num: 6 })
      });
      if (respSerp.ok) {
        const dataSerp = await respSerp.json();
        const organics = dataSerp.organic || [];
        if (organics.length) {
          const fuentes = organics.map(o => ({ titulo: o.title, url: o.link }));
          const texto = organics.map((o, i) => `${i + 1}. ${o.title} — ${o.snippet || ''}`).join('\n');
          console.log('[buscarEnWeb] Búsqueda Serper exitosa.');
          return { texto, fuentes };
        }
      }
    } catch (eSerp) {
      console.warn('[buscarEnWeb] Excepción en Serper:', eSerp.message);
    }
  }

  // Fallback universal multi-fuente (Google News RSS + Wikipedia)
  console.log('[buscarEnWeb] Usando buscador multi-fuente gratuito para: ' + query.slice(0, 80));
  try {
    const resMulti = await buscarWebMultiFuente(query);
    const hechos = Array.isArray(resMulti.hechos) ? resMulti.hechos : [];
    const fuentes = Array.isArray(resMulti.fuentes) ? resMulti.fuentes : [];

    const texto = hechos.length
      ? hechos.join('\n')
      : 'No se encontraron titulares directos para esta consulta.';

    return { texto, fuentes: fuentes.slice(0, 6) };
  } catch (eMulti) {
    console.error('[buscarEnWeb] Error en fallback multi-fuente:', eMulti.message);
    return {
      texto: 'No se pudieron recuperar resultados actualizados de la web en este momento.',
      fuentes: []
    };
  }
}

module.exports = {
  evaluarBusquedaAutomatica,
  obtenerDeCache,
  guardarEnCache,
  extraerQueryBusqueda,
  buscarWebMultiFuente,
  ejecutarBusquedaWebCompleta,
  buscarEnWeb
};
