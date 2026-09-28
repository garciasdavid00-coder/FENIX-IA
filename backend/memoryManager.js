// ============================================================================
// memoryManager.js — Memoria persistente por usuario.
// Guarda hechos y preferencias de cada usuario en la tabla `user_memories` y
// los reinyecta en el system prompt para personalizar futuras respuestas.
// ============================================================================

const { pool } = require('../db');
const {fetchWithTimeout: fetch} = require('../utils/fetchWithTimeout');

// Cada cuántos mensajes del usuario intentamos extraer memorias nuevas.
const MEMORY_EXTRACTION_INTERVAL = 1; // Revisar en CADA mensaje para aprendizaje en tiempo real

// Máximo de memorias que se guardan por usuario (límite lógico de la app).
const MAX_MEMORIAS = 30;

// Categorías aceptadas; si llega otra, se guarda como 'personal'.
// 'temas' son temas importantes que interesan al usuario.
const CATEGORIAS = ['personal', 'preferencia', 'proyecto', 'tecnico', 'temas'];

// Contador de mensajes por usuario para saber cuándo toca extraer.
const pendientes = new Map();

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

// ----------------------------------------------------------------------------
// Funciones públicas
// ----------------------------------------------------------------------------

// Devuelve las memorias del usuario, las más recientes primero.
async function getUserMemories(userId) {
  if (!pool || !userId) return [];
  const { rows } = await pool.query(
    `SELECT id, memory_text, category, updated_at
     FROM user_memories
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return rows;
}

// Inserta una memoria evitando duplicados obvios. Si encuentra una muy similar,
// la actualiza (texto nuevo + updated_at) en lugar de insertar otra. Si el
// usuario ya tiene MAX_MEMORIAS, borra la más antigua antes de insertar.
async function addMemory(userId, memoryText, category) {
  if (!pool || !userId) return null;
  const texto=String(memoryText || '').trim().slice(0,1000);
  if(!texto)return null;
  const cat=CATEGORIAS.includes(category)?category:'personal';
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',['memory:'+userId]);
    const existing=await client.query('SELECT id,memory_text FROM user_memories WHERE user_id=$1 ORDER BY updated_at ASC',[userId]);
    const duplicate=existing.rows.find(row=>normalizarTexto(row.memory_text)===normalizarTexto(texto));
    let result;
    if(duplicate) result=await client.query('UPDATE user_memories SET updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING id,memory_text,category',[duplicate.id,userId]);
    else {
      const remove=existing.rows.slice(0,Math.max(0,existing.rows.length-MAX_MEMORIAS+1)).map(row=>row.id);
      if(remove.length)await client.query('DELETE FROM user_memories WHERE user_id=$1 AND id=ANY($2::int[])',[userId,remove]);
      result=await client.query('INSERT INTO user_memories (user_id,memory_text,category) VALUES ($1,$2,$3) RETURNING id,memory_text,category',[userId,texto,cat]);
    }
    await client.query('COMMIT');return result.rows[0] || null;
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
}

// Arma el bloque que se inyecta al inicio del system prompt.
// Separa los datos personales de los temas importantes. Devuelve un string
// vacío si el usuario no tiene memorias.
async function buildMemoryContext(userId) {
  await pendientes.get(userId);
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
  if(!pool || !userId || !Array.isArray(mensajesConversacion) || !mensajesConversacion.length) return Promise.resolve([]);
  const task=(pendientes.get(userId) || Promise.resolve()).catch(()=>{}).then(()=>extractMemoriesFromConversation(userId,mensajesConversacion));
  const safe=task.catch(e=>{console.error('No se pudo guardar memoria:',e.message);return []});
  pendientes.set(userId,safe);
  safe.finally(()=>{if(pendientes.get(userId)===safe)pendientes.delete(userId)});
  return safe;
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
  const ultimoTramo = mensajesConversacion.filter(m=>m.role === 'user').slice(-2);

  const peticion = {
    model: MODELO_EXTRACCION,
    temperature: 0.2,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Eres un extractor de datos personales. A partir de una conversación, saca los hechos y preferencias DURADEROS sobre el usuario: nombres, edades, profesión, idiomas, gustos, preferencias, proyectos en curso, herramientas o información técnica relevante, y los TEMAS IMPORTANTES que le interesan (aquellos temas que repite, sobre los que pide consejo o quiere aprender).

Reglas:
- Extrae TODOS los hechos explícitos de cada mensaje, incluyendo profesión, nombre y preferencias. No inventes ni atribuyas al usuario datos de terceros.
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
async function evaluarNecesidadMemoria(mensaje) {
  // At most 30 small records; reading them avoids a slower and fallible LLM gate.
  return !!String(mensaje || '').trim();
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