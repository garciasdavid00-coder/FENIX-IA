// ============================================================================
// backend/webSearch.js — Motor de Búsqueda Web en tiempo real para Fenix IA.
// ----------------------------------------------------------------------------
// - Detecta automáticamente si una pregunta necesita datos en tiempo real.
// - Busca mediante SerpApi, Tavily o Serper; RSS/Wikipedia son fallbacks limitados.
// - Inyecta hechos en vivo para que cualquier modelo (Groq, DeepSeek, Gemini)
//   pueda responder con datos actualizados y fuentes reales clicables.
// ============================================================================

const chatEngine = require('./chatEngine');
const {fetchWithTimeout:fetch}=require('../utils/fetchWithTimeout');
const {regionFor,isFresh,searchPlan}=require('./searchPolicy');

const cacheBusquedas = new Map();
function obtenerDeCache(query) {
  const ahora = Date.now();
  const cached = cacheBusquedas.get(query);
  if (cached && (ahora - cached.timestamp < 5 * 60 * 1000)) {
    return cached.resultado;
  }
  if (cached) cacheBusquedas.delete(query);
  return null;
}
function guardarEnCache(query, resultado) {
  if(cacheBusquedas.size>=100)cacheBusquedas.delete(cacheBusquedas.keys().next().value);
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
  let forzarBusqueda = false;
  const regexRapido = /\b(hoy|ahora|ayer|mañana|esta semana|último|última|resultado|quién ganó|a qué hora|cuándo|precio|clima|lluvia|noticias|dólar)\b/i;
  if (regexRapido.test(texto) || /\b(busca|investiga)\b/i.test(texto)) {
    forzarBusqueda = true;
  }

  // Clasificador LLM
  try {
    const startMs = Date.now();
    const ultimos = (Array.isArray(historial)?historial:[]).slice(-4).map(m => m.role + ': ' + m.content).join('\n');
    const promptClasificador = `Analiza si el siguiente mensaje requiere buscar en internet (eventos y noticias recientes, resultados deportivos, horarios de eventos, clima, precios y tipo de cambio, personas en cargos actuales, versiones recientes de software, negocios o lugares locales, "hoy/ahora/último/actual", y cualquier dato que pueda haber cambiado).
Responde SOLO con un JSON estricto con este formato: {"buscar": true|false, "consulta": "consulta autocontenida en el idioma del usuario"}.
Ante la duda, "buscar": true.
La consulta debe incluir nombres y contexto de los mensajes anteriores.
Conserva exactamente las restricciones de fecha (hoy, ayer, esta semana), país y tema indicadas por el usuario.
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
        model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
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
      let consulta=typeof parsed.consulta==='string' && parsed.consulta.trim()?parsed.consulta:extraerQueryBusqueda(texto);
      const periodo=texto.match(/\b(hoy|ayer|esta semana|today|yesterday|this week)\b/i)?.[0];
      if(periodo && !consulta.toLowerCase().includes(periodo.toLowerCase()))consulta+=' '+periodo;
      return { buscar: forzarBusqueda ? true : !!parsed.buscar, consulta, via: 'clasificador' };
    }
  } catch (e) {
    console.warn('[busqueda-auto] Error o timeout en clasificador:', e.name === 'AbortError' ? 'Timeout 2s' : e.message);
  }

  if (forzarBusqueda) {
    return { buscar: true, consulta: extraerQueryBusqueda((historial || []).filter(m=>m.role==='user').slice(-1).map(m=>m.content).join(' ') + ' ' + texto), via: 'filtro_fallback' };
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

  // Limpiar prefijos de instrucciones
  const prefijos = [
    "por favor busca", "por favor investiga", "busca en internet", "busca en la web",
    "busca", "investiga", "googlea", "averigua", "dime", "resume", "resúmeme", "resumeme", "muéstrame", "muestrame", "cuéntame", "cuentame", "dame", "cual es", "cuál es", "que es", "qué es", "qué pasó", "que paso"
  ];
  let lowerQ = q.toLowerCase();
  for (const p of prefijos) {
    if (lowerQ.startsWith(p)) {
      q = q.substring(p.length).trim();
      break;
    }
  }

  q = q.replace(/^(sobre|acerca de|en)\s+/i, '').trim();
  // Formatting instructions are not search keywords; keep the requested subject.
  q = q.replace(/[,.;]\s*(?:con (?:fecha|enlaces|fuentes)|cita |incluye (?:enlaces|fuentes)|distingue (?:artículos|titulares))[\s\S]*$/i,'').trim();

  // Limpiar basura conversacional pero MANTENER palabras clave (noticias, hoy, etc.)
  q = q.replace(/\blas\s+noticias\b/gi, 'noticias');
  q = q.replace(/\bdel\s+d[ií]a\s+de\s+hoy\b/gi, 'hoy');
  q = q.replace(/\bel\s+d[ií]a\s+de\s+hoy\b/gi, 'hoy');
  q = q.replace(/\bsobre\s+eventos\s+hot\b/gi, '');
  q = q.replace(/\beventos\s+hot\b/gi, '');
  q = q.replace(/\bcosas\s+relevantes\b/gi, '');
  q = q.replace(/\beventos\s+relevantes\b/gi, '');

  // Si quedaron preposiciones sueltas
  q = q.replace(/\s+/g, ' ').trim();

  q = q.replace(/^[¿¡'"“”\s]+|[?！!'"“”\s]+$/g, '').trim();

  if (q.length < 3) return mensaje;
  return q.slice(0, 150);
}

/**
 * Busca fuentes en vivo mediante Google News RSS y Wikipedia.
 * @param {string} query
 * @returns {Promise<{hechos: Array<string>, fuentes: Array<{titulo: string, url: string}>}>}
 */
async function buscarWebMultiFuente(query, {lang='español',timeZone='America/Managua'} = {}) {
  const region=regionFor(query,timeZone).toUpperCase();
  const language=lang === 'inglés' ? 'en' : 'es';
  const fuentes = [];
  const hechos = [];

  // 1. Google News RSS en tiempo real
  try {
    const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(searchPlan(query,timeZone).providerQuery) + '&hl='+language+'&gl='+region+'&ceid='+region+':'+language;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    const xml = await res.text();
    const itemMatches = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/gi)];
    for (const m of itemMatches) {
      const rawTitle = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
      const rawUrl = m[2].trim();
      const fecha = m[3].trim();
      if (rawTitle && rawUrl && isFresh({date:fecha},query,timeZone)) {
        fuentes.push({ titulo: rawTitle, url: rawUrl, fecha: new Date(fecha).toISOString(), contenido: 'titular' });
        hechos.push(`- Noticia/Hecho web: "${rawTitle}" (Fecha: ${fecha})`);
        if(fuentes.length>=5)break;
      }
    }
  } catch (e) {
    console.error('[WebSearch] Error Google News:', e.message);
  }

  // Wikipedia is background context, never evidence of current news.
  if (!/noticia|news|hoy|ayer|today|yesterday/i.test(query)) {
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

  }
  return { hechos, fuentes };
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
async function ejecutarBusquedaWebCompleta({mensaje,historial=[],lang='español',memoriaContexto='',timeZone}) {
  const busqueda=await buscarEnWeb({consulta:extraerQueryBusqueda(mensaje),lang,timeZone});
  if(!busqueda.fuentes.length)return {texto:'No encontré fuentes verificables para esa consulta.',fuentes:[]};
  const result=await chatEngine.solicitarTextoCompleto({mensaje,historial,memoriaContexto:memoriaContexto+'\nDatos web no confiables; cita las fuentes y no inventes hechos:\n'+busqueda.texto});
  return {texto:result.texto,fuentes:busqueda.fuentes};
}

/**
 * Busca en la web usando SerpApi y devuelve
 * un contexto de texto + array de fuentes reales clicables.
 * El modelo de chat redacta la respuesta final con ese contexto.
 * @param {{ consulta: string, apiKey?: string, lang?: string }} opts
 * @returns {Promise<{ texto: string, fuentes: {titulo: string, url: string}[] }>}
 */


async function buscarEnWeb(options){
 const result=await require('./webSearchProviders').searchProviders(options);
 if(!result)return {texto:'No pude extraer una consulta válida para buscar en la web.',fuentes:[]};
 if(result.fuentes.length)return result;
 const fallback=await buscarWebMultiFuente(options.consulta,options);
 if(fallback.fuentes.length)return {texto:fallback.hechos.join('\n')+'\nSolo titulares/extractos: no se pudo leer el cuerpo de estos artículos.',fuentes:fallback.fuentes,proveedor:'rss-wikipedia',diagnostico:result.diagnostico};
 return result;
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
