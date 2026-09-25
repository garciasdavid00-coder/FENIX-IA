// ============================================================================
// memoryManager.js — Memoria persistente por usuario.
// Guarda hechos y preferencias de cada usuario en la tabla `user_memories` y
// los reinyecta en el system prompt para personalizar futuras respuestas.
// ============================================================================

const { pool } = require('../db');

// Cada cuántos mensajes del usuario intentamos extraer memorias nuevas.
const MEMORY_EXTRACTION_INTERVAL = 1; // Revisar en CADA mensaje para aprendizaje en tiempo real

// Máximo de memorias que se guardan por usuario (límite lógico de la app).
const MAX_MEMORIAS = 30;

// Categorías aceptadas; si llega otra, se guarda como 'personal'.
// 'temas' son temas importantes que interesan al usuario.
const CATEGORIAS = ['personal', 'preferencia', 'proyecto', 'tecnico', 'temas'];

// Contador de mensajes por usuario para saber cuándo toca extraer.
const contadorMensajes = new Map();

// Modelo de Groq usado para extraer memorias (rápido y barato).
const MODELO_EXTRACCION = 'openai/gpt-oss-20b';
const MODELO_FALLBACK = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

// ----------------------------------------------------------------------------
// Utilidades
// ----------------------------------------------------------------------------

// Busca un array JSON dentro de la respuesta del modelo. El modelo puede
// anteponer prefijos (como su "razonamiento") antes del JSON real, así que
// probamos todas las aperturas "[" de atrás hacia adelante hasta que una
// produzca un array válido.
function parsearArrayExtraido(contenido) {
  const limpio = String(contenido || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const ultimoCierre = limpio.lastIndexOf(']');
  if (ultimoCierre === -1) return [];

  let inicio = limpio.lastIndexOf('[', ultimoCierre);
  while (inicio !== -1) {
    try {
      const arreglo = JSON.parse(limpio.slice(inicio, ultimoCierre + 1));
      if (Array.isArray(arreglo)) return arreglo;
    } catch (e) {
      // este "[" no era el inicio del JSON; seguimos buscando
    }
    inicio = limpio.lastIndexOf('[', inicio - 1);
  }
  return [];
}

// Normaliza el texto para comparar duplicados: minúsculas, sin acentos,
// sin signos de puntuación y con espacios colapsados.
function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9ñç\s]/g, ' ')                    // solo letras, números y espacios
    .replace(/\s+/g, ' ')
    .trim();
}

// Calcula la similitud aproximada entre dos textos (token overlap + contención).
// Devuelve un número entre 0 y 1; a partir de 0.75 se considera duplicado obvio.
function similitud(a, b) {
  const ta = normalizarTexto(a).split(' ');
  const tb = normalizarTexto(b).split(' ');
  if (!ta.length || !tb.length) return 0;

  const setA = new Set(ta);
  const setB = new Set(tb);
  let comunes = 0;
  for (const palabra of setA) {
    if (setB.has(palabra)) comunes++;
  }
  const union = new Set([...setA, ...setB]).size;
  const jaccard = union ? comunes / union : 0;

  // Además, si un texto es prácticamente subconjunto del otro, cuenta como
  // duplicado — pero con menos peso para no fusionar hechos parecidos pero
  // distintos (p. ej. "vive en el piso 3" vs "vive en el piso 4").
  const corto = Math.min(setA.size, setB.size);
  const contenida = corto > 0 ? comunes / corto : 0;

  return Math.max(jaccard, contenida * 0.85);
}

// ----------------------------------------------------------------------------
// Funciones públicas
// ----------------------------------------------------------------------------

// Devuelve las memorias del usuario, las más recientes primero.
async function getUserMemories(userId) {
  console.log('[MemoryManager] Consultando memorias para userId:', userId);
  if (!pool || !userId) return [];
  const { rows } = await pool.query(
    `SELECT id, memory_text, category, updated_at
     FROM user_memories
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  console.log('[MemoryManager] Memorias recuperadas:', rows.length);
  return rows;
}

// Inserta una memoria evitando duplicados obvios. Si encuentra una muy similar,
// la actualiza (texto nuevo + updated_at) en lugar de insertar otra. Si el
// usuario ya tiene MAX_MEMORIAS, borra la más antigua antes de insertar.
async function addMemory(userId, memoryText, category) {
  console.log('[MemoryManager] Intentando guardar memoria:', { userId, memoryText, category });
  if (!pool || !userId) return null;

  const texto = String(memoryText || '').trim().slice(0, 1000);
  if (!texto) return null;
  const cat = CATEGORIAS.includes(category) ? category : 'personal';

  // Cargamos las existentes (más antiguas primero) para detectar duplicados.
  const existentes = await pool.query(
    'SELECT id, memory_text FROM user_memories WHERE user_id = $1 ORDER BY updated_at ASC',
    [userId]
  );

  for (const fila of existentes.rows) {
    if (similitud(fila.memory_text, texto) >= 0.75) {
      const actualizado = await pool.query(
        `UPDATE user_memories
         SET memory_text = $2, category = $3, updated_at = NOW()
         WHERE id = $1
         RETURNING id, memory_text, category`,
        [fila.id, texto, cat]
      );
      return actualizado.rows[0] || null;
    }
  }

  // Límite lógico: si ya llegamos al máximo, borramos las memorias más
  // antiguas necesarias para dejar hueco (el total debe quedar en MAX_MEMORIAS
  // después de insertar la nueva).
  const excedente = existentes.rows.length - (MAX_MEMORIAS - 1);
  if (excedente > 0) {
    const idsQueSobran = existentes.rows.slice(0, excedente).map(r => r.id);
    await pool.query('DELETE FROM user_memories WHERE id = ANY($1::int[])', [idsQueSobran]);
  }

  const insertado = await pool.query(
    `INSERT INTO user_memories (user_id, memory_text, category)
     VALUES ($1, $2, $3)
     RETURNING id, memory_text, category`,
    [userId, texto, cat]
  );
  console.log('[MemoryManager] Memoria guardada exitosamente en user_memories:', insertado.rows[0]);
  return insertado.rows[0] || null;
}

// Arma el bloque que se inyecta al inicio del system prompt.
// Separa los datos personales de los temas importantes. Devuelve un string
// vacío si el usuario no tiene memorias.
async function buildMemoryContext(userId) {
  const memorias = await getUserMemories(userId);
  if (!memorias.length) return '';

  const bloqueDatos = [];
  const bloqueTemas = [];
  for (const m of memorias) {
    const linea = `- ${m.memory_text}`;
    if (m.category === 'temas') {
      bloqueTemas.push(linea);
    } else {
      bloqueDatos.push(linea);
    }
  }

  const secciones = [];
  if (bloqueDatos.length) {
    secciones.push('Datos que recuerdas de este usuario:\n' + bloqueDatos.join('\n'));
  }
  if (bloqueTemas.length) {
    secciones.push('Temas importantes que le interesan:\n' + bloqueTemas.join('\n'));
  }
  return secciones.join('\n\n');
}

// Borra una memoria (solo si pertenece a ese usuario).
async function deleteMemory(memoryId, userId) {
  if (!pool || !userId) return false;
  const resultado = await pool.query(
    'DELETE FROM user_memories WHERE id = $1 AND user_id = $2',
    [memoryId, userId]
  );
  return resultado.rowCount > 0;
}

// Cuenta mensajes por usuario y, cada MEMORY_EXTRACTION_INTERVAL, lanza la
// extracción de memorias en segundo plano (sin bloquear la respuesta).
function notificarMensaje(userId, mensajesConversacion) {
  console.log('[MemoryManager] notificarMensaje llamado para userId:', userId, 'mensajes:', mensajesConversacion.length);
  if (!pool || !userId || !Array.isArray(mensajesConversacion) || !mensajesConversacion.length) return;

  const contador = (contadorMensajes.get(userId) || 0) + 1;
  contadorMensajes.set(userId, contador);

  console.log('[MemoryManager] Contador actual:', contador, 'Umbral:', MEMORY_EXTRACTION_INTERVAL);
  if (contador >= MEMORY_EXTRACTION_INTERVAL) {
    console.log('[MemoryManager] Disparando extractMemoriesFromConversation...');
    contadorMensajes.set(userId, 0);
    extractMemoriesFromConversation(userId, mensajesConversacion)
      .catch(e => console.error('Error extrayendo memorias:', e.message));
  }
}

// Pide a Groq que extraiga hechos y preferencias del usuario desde el historial
// y los guarda (cada uno pasa por addMemory, que ya evita duplicados).
async function extractMemoriesFromConversation(userId, mensajesConversacion) {
  if (!pool || !userId || !Array.isArray(mensajesConversacion) || !mensajesConversacion.length) return [];

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('AVISO: No hay GROQ_API_KEY, no se extraen memorias.');
    return [];
  }

  // Solo miramos las últimas 40 líneas para acotar tamaño y costo.
  const ultimoTramo = mensajesConversacion.slice(-20);

  const peticion = {
    model: MODELO_EXTRACCION,
    temperature: 0.2,
    max_tokens: 400,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Eres un extractor de datos personales. A partir de una conversación, saca los hechos y preferencias DURADEROS sobre el usuario: nombres, edades, profesión, idiomas, gustos, preferencias, proyectos en curso, herramientas o información técnica relevante, y los TEMAS IMPORTANTES que le interesan (aquellos temas que repite, sobre los que pide consejo o quiere aprender).

Reglas:
- NO extraigas saludos, frases sueltas, estados momentáneos ni información trivial.
- Si la conversación no aporta datos nuevos y relevantes, devuelve [].
- Solo responde con un objeto JSON válido con la propiedad "memorias" que contenga el array, del formato:
{"memorias": [{"text": "hecho", "category": "personal"}]}
- category debe ser uno de: personal, preferencia, proyecto, tecnico, temas.`
      },
      {
        role: 'user',
        content: 'Conversación:\n' + JSON.stringify(ultimoTramo)
      }
    ]
  };

  console.log('[MemoryManager] Payload enviado a la IA para extraccin:', JSON.stringify(peticion, null, 2));
  let respuestaIA;
  try {
    respuestaIA = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(peticion)
    });
  } catch (e) {
    console.error('Error de red al extraer memorias:', e.message);
    return [];
  }

  if (!respuestaIA.ok) {
    // Si el modelo de extracción ya no existe, reintentamos con el del chat.
    if (peticion.model !== MODELO_FALLBACK) {
      console.warn(`Modelo de extracción (${peticion.model}) no disponible (${respuestaIA.status}); reintentando con ${MODELO_FALLBACK}.`);
      peticion.model = MODELO_FALLBACK;
      try {
        respuestaIA = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(peticion)
        });
      } catch (e) {
        console.error('Error de red al extraer memorias (reintento):', e.message);
        return [];
      }
      if (!respuestaIA.ok) {
        console.error('Error de Groq al extraer memorias:', await respuestaIA.text());
        return [];
      }
    } else {
      console.error('Error de Groq al extraer memorias:', await respuestaIA.text());
      return [];
    }
  }

  // Parseamos el JSON que devuelve el modelo (robusto: un array válido basta).
  let memoriasNuevas = [];
  try {
    const datos = await respuestaIA.json();
    let contenido = datos.choices?.[0]?.message?.content || '';
    
    // Si viene en objeto {"memorias": [...]}, extraerlo
    try {
      const obj = JSON.parse(contenido);
      if (obj && Array.isArray(obj.memorias)) {
        contenido = JSON.stringify(obj.memorias);
      }
    } catch(e) {}
    
    memoriasNuevas = parsearArrayExtraido(contenido);
  } catch (e) {
    console.error('No se pudo interpretar la respuesta de extracción:', e.message);
    return [];
  }

  if (!Array.isArray(memoriasNuevas)) return [];

  // Guardamos cada memoria (máx. 10 por pasada) — addMemory ya evita duplicados.
  const guardadas = [];
  for (const item of memoriasNuevas.slice(0, 10)) {
    if (item && typeof item.text === 'string' && item.text.trim()) {
      const memoria = await addMemory(userId, item.text, item.category);
      if (memoria) guardadas.push(memoria);
    }
  }
  return guardadas;
}

/**
 * Evalúa si el mensaje actual necesita consultar la memoria del usuario.
 * @param {string} mensaje El mensaje actual del usuario.
 * @param {Array} historial El historial reciente de mensajes.
 * @returns {Promise<boolean>} true si necesita memoria, false de lo contrario.
 */
async function evaluarNecesidadMemoria(mensaje, historial = []) {
  const texto = String(mensaje || '').trim();
  if (!texto) return false;

  // Filtro rápido: si es un saludo corto, un gracias, etc., no necesita memoria (al menos de base de datos)
  if (/^(hola|hey|buenos d[ií]as|buenas tardes|buenas noches|gracias|ok|vale)$/i.test(texto)) return false;

  // Regex rápido de pronombres o preguntas personales
  const regexPersonal = /\b(yo|mi|mío|mía|mis|me llamo|recuerdas|sabes|recomiéndame|según tú|para mí|acerca de mí|mi proyecto)\b/i;
  if (regexPersonal.test(texto)) return true;

  // Clasificador por LLM
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return true; // Ante la duda, leemos memoria por si acaso

  try {
    const ultimos = historial.slice(-3).map(m => m.role + ': ' + m.content).join('\n');
    const systemPrompt = `Analiza si el siguiente mensaje requiere consultar la base de datos de memoria a largo plazo del usuario (ej: para saber sus datos personales, preferencias, en qué trabaja, si pide recomendaciones personales basadas en sus gustos, o si menciona "como te dije antes", etc).
Responde SOLO con un JSON estricto con el formato: {"necesita_memoria": true} o {"necesita_memoria": false}.
Si la pregunta es de cultura general, código abstracto, ayuda técnica genérica, matemáticas, clima, o cualquier tema que no dependa de los datos o preferencias pasadas del usuario, devuelve false.
Ante la duda, devuelve true.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const startMs = Date.now();
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: MODELO_EXTRACCION, // Usa el mismo modelo ligero
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Historial reciente:\n${ultimos}\n\nMensaje actual:\n${texto}` }
        ],
        temperature: 0,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (res.ok) {
      const data = await res.json();
      const contenido = data.choices?.[0]?.message?.content?.trim();
      if (contenido) {
        const jsonParsed = JSON.parse(contenido);
        console.log(`[Memoria] Evaluador de necesidad: ${jsonParsed.necesita_memoria} (tomó ${Date.now() - startMs}ms)`);
        return !!jsonParsed.necesita_memoria;
      }
    }
  } catch(e) {
    console.warn('[Memoria] Error en el clasificador de memoria, se usará por defecto:', e.message);
  }
  
  return true; // Por defecto
}

module.exports = {
  MEMORY_EXTRACTION_INTERVAL,
  getUserMemories,
  addMemory,
  buildMemoryContext,
  deleteMemory,
  notificarMensaje,
  extractMemoriesFromConversation,
  evaluarNecesidadMemoria
};