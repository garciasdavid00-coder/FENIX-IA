// Conexión a PostgreSQL (Neon). Si no hay DATABASE_URL, el servidor
// funciona igual pero sin guardar usuarios (modo sin base de datos).
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : null;

// Si la conexión del pool falla sola (Neon reinicia, timeout de red...),
// pg emite 'error' a nivel de pool. Sin listener, Node lo trata como
// excepción no capturada y tumba TODO el proceso. Con esto solo logueamos
// y el pool sigue abriendo conexiones nuevas en las siguientes queries.
if (pool) {
  pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
  });
}

// Crea la tabla si no existe. Se ejecuta al arrancar el servidor.
async function inicializar() {
  if (!pool) {
    console.warn('AVISO: No configuraste DATABASE_URL en .env — los usuarios y planes no se guardarán.');
    return;
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id             SERIAL PRIMARY KEY,
        google_id      VARCHAR(100) UNIQUE NOT NULL,
        nombre         VARCHAR(200),
        correo         VARCHAR(200) UNIQUE,
        foto           VARCHAR(500),
        plan           VARCHAR(20)  NOT NULL DEFAULT 'gratis',
        plan_desde     TIMESTAMPTZ,
        plan_hasta     TIMESTAMPTZ,
        creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);
    // Chats y proyectos: el historial de conversaciones de cada cuenta.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id             SERIAL PRIMARY KEY,
        google_id      VARCHAR(100) NOT NULL,
        cliente_id     BIGINT       NOT NULL,                    -- id que usa el navegador
        titulo         TEXT         NOT NULL,
        mensajes       JSONB        NOT NULL DEFAULT '[]',       -- [{tipo, texto}, ...]
        pinned         BOOLEAN      NOT NULL DEFAULT FALSE,
        proyecto_id    BIGINT,                                   -- id de cliente del proyecto (opcional)
        insult_count   INTEGER      NOT NULL DEFAULT 0,       -- contador de insultos en esta conversación
        is_blocked     BOOLEAN      NOT NULL DEFAULT FALSE,     -- ¿está bloqueado este chat?
        creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (google_id, cliente_id)
      )
    `);
    // Migración idempotente: la tabla pudo crearse antes de agregar las
    // columnas de moderación, así que nos aseguramos de que existan.
    await pool.query(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS insult_count INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proyectos (
        id         SERIAL PRIMARY KEY,
        google_id  VARCHAR(100) NOT NULL,
        cliente_id BIGINT       NOT NULL,
        nombre     TEXT         NOT NULL,
        UNIQUE (google_id, cliente_id)
      )
    `);
    // Memoria persistente: hechos y preferencias del usuario, reinyectados
    // en el system prompt (ver backend/memoryManager.js).
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_memories (
        id          SERIAL PRIMARY KEY,
        user_id     VARCHAR(100) NOT NULL REFERENCES usuarios(google_id) ON DELETE CASCADE,
        memory_text TEXT         NOT NULL,
        category    VARCHAR(50)  NOT NULL DEFAULT 'personal',
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_memories_user_id
        ON user_memories(user_id)
    `);
    // ------------------------------------------------------------
    // Soporte WhatsApp: los usuarios se identifican por teléfono (no por
    // Google), así que google_id pasa a ser opcional y se añade el campo
    // phone_number. La memoria (user_memories) se indexa por un string
    // genérico ("wa:<teléfono>" o el id de Google), ya sin FK obligatoria.
    // ------------------------------------------------------------
    await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)`);
    await pool.query(`ALTER TABLE usuarios ALTER COLUMN google_id DROP NOT NULL`);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_phone_number
        ON usuarios(phone_number)
    `);

    await pool.query(`
      ALTER TABLE user_memories DROP CONSTRAINT IF EXISTS user_memories_user_id_fkey
    `);
    // Historial de conversación por número de WhatsApp (el servidor guarda
    // este historial porque el usuario no tiene "cliente_id" de navegador).
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_conversaciones (
        phone_number   VARCHAR(20) PRIMARY KEY,
        mensajes       JSONB       NOT NULL DEFAULT '[]',
        creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    // Límite de uso por número: un contador por ventana de una hora.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_rate_limit (
        phone_number   VARCHAR(20) PRIMARY KEY,
        contador_hora  INTEGER     NOT NULL DEFAULT 0,
        ventana_hora   TIMESTAMPTZ NOT NULL,
        actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Base de datos conectada y lista.');
  } catch (e) {
    console.error('ERROR al conectar la base de datos:', e.message);
  }
}

// Crea el usuario si no existe, o actualiza sus datos de Google.
async function obtenerOCrearUsuario(googleId, { nombre, correo, foto }) {
  if (!pool) return null;
  const { rows } = await pool.query(
    `INSERT INTO usuarios (google_id, nombre, correo, foto)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (google_id)
     DO UPDATE SET
       nombre = EXCLUDED.nombre,
       correo = EXCLUDED.correo,
       foto = EXCLUDED.foto,
       actualizado_en = NOW()
     RETURNING *`,
    [googleId, nombre, correo, foto]
  );
  return rows[0];
}

// Busca un usuario por su id de Google.
async function obtenerUsuarioPorGoogleId(googleId) {
  if (!pool) return null;
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE google_id = $1', [googleId]);
  return rows[0] || null;
}

// Actualiza el plan del usuario (pro/ultra/gratis) con su vencimiento.
async function actualizarPlan(googleId, plan, duracionMeses = 1) {
  if (!pool) return null;
  const desde = new Date();
  const hasta = new Date(desde);
  hasta.setMonth(hasta.getMonth() + duracionMeses);
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET plan = $2, plan_desde = $3, plan_hasta = $4, actualizado_en = NOW()
     WHERE google_id = $1
     RETURNING *`,
    [googleId, plan, desde, hasta]
  );
  return rows[0] || null;
}

// Devuelve el estado de moderación (insult_count / is_blocked) de un chat
// concreto de un usuario. null si el chat aún no existe en la BD.
async function obtenerEstadoChat(googleId, clienteId) {
  if (!pool || !googleId || clienteId == null) return null;
  const { rows } = await pool.query(
    `SELECT insult_count, is_blocked
     FROM chats
     WHERE google_id = $1 AND cliente_id = $2`,
    [googleId, clienteId]
  );
  return rows[0] || null;
}

// Suma 1 insulto al chat. Si la fila aún no existe (el navegador no ha hecho
// el snapshot de /api/sincronizar), la crea para que la moderación no dependa
// de la sincronización. Al llegar a 5 insultos marca is_blocked = true.
// Devuelve el estado nuevo ({ insult_count, is_blocked }) o null si no hay BD.
async function registrarInsulto(googleId, clienteId, titulo = 'Nuevo chat') {
  if (!pool || !googleId || clienteId == null) return null;
  const { rows } = await pool.query(
    `INSERT INTO chats (google_id, cliente_id, titulo, mensajes, insult_count)
     VALUES ($1, $2, $3, '[]'::jsonb, 1)
     ON CONFLICT (google_id, cliente_id) DO UPDATE SET
       insult_count = chats.insult_count + 1,
       is_blocked   = (chats.insult_count + 1) >= 5,
       actualizado_en = NOW()
     RETURNING insult_count, is_blocked`,
    [googleId, clienteId, String(titulo || '').slice(0, 200) || 'Nuevo chat']
  );
  return rows[0] || null;
}

// Reemplaza por completo los chats y proyectos del usuario por el estado
// que manda el navegador (sincronización por snapshot).
async function sincronizarDatos(googleId, { chats, proyectos }) {
  if (!pool) return null;
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // Antes de sobrescribir, conservamos el estado de moderación de los chats
    // (insult_count / is_blocked) para que un snapshot posterior al bloqueo
    // no resucite un chat que ya fue bloqueado.
    const { rows: chatsModerados } = await cliente.query(
      `SELECT cliente_id, insult_count, is_blocked
       FROM chats
       WHERE google_id = $1 AND (is_blocked = TRUE OR insult_count > 0)`,
      [googleId]
    );

    await cliente.query('DELETE FROM chats WHERE google_id = $1', [googleId]);
    await cliente.query('DELETE FROM proyectos WHERE google_id = $1', [googleId]);

    for (const c of Array.isArray(chats) ? chats : []) {
      await cliente.query(
        `INSERT INTO chats (google_id, cliente_id, titulo, mensajes, pinned, proyecto_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (google_id, cliente_id) DO UPDATE SET
           titulo = EXCLUDED.titulo,
           mensajes = EXCLUDED.mensajes,
           pinned = EXCLUDED.pinned,
           proyecto_id = EXCLUDED.proyecto_id,
           actualizado_en = NOW()`,
        [googleId, c.id, c.titulo || '', JSON.stringify(c.mensajes || []), !!c.pinned, c.proyectoId ?? null]
      );
    }

    for (const p of Array.isArray(proyectos) ? proyectos : []) {
      await cliente.query(
        `INSERT INTO proyectos (google_id, cliente_id, nombre)
         VALUES ($1, $2, $3)
         ON CONFLICT (google_id, cliente_id) DO UPDATE SET nombre = EXCLUDED.nombre`,
        [googleId, p.id, p.nombre || '']
      );
    }

    // Re-aplicamos el estado de moderación conservado antes del snapshot.
    for (const m of chatsModerados) {
      await cliente.query(
        `UPDATE chats
         SET insult_count = $3, is_blocked = $4
         WHERE google_id = $1 AND cliente_id = $2`,
        [googleId, m.cliente_id, m.insult_count, m.is_blocked]
      );
    }

    await cliente.query('COMMIT');
    return { ok: true };
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
}

// Devuelve todos los chats y proyectos de una cuenta, listos para el navegador.
async function obtenerDatos(googleId) {
  if (!pool) return null;
  const chatsRes = await pool.query(
    'SELECT cliente_id, titulo, mensajes, pinned, proyecto_id FROM chats WHERE google_id = $1 ORDER BY id',
    [googleId]
  );
  const proyectosRes = await pool.query(
    'SELECT cliente_id, nombre FROM proyectos WHERE google_id = $1 ORDER BY id',
    [googleId]
  );
  return {
    chats: chatsRes.rows.map(r => ({
      id: Number(r.cliente_id),
      titulo: r.titulo,
      mensajes: r.mensajes || [],
      pinned: !!r.pinned,
      proyectoId: r.proyecto_id != null ? Number(r.proyecto_id) : null
    })),
    proyectos: proyectosRes.rows.map(r => ({ id: Number(r.cliente_id), nombre: r.nombre }))
  };
}

// ------------------------------------------------------------
// Soporte WhatsApp (identificación por número de teléfono)
// ------------------------------------------------------------

// Crea el usuario si su número de WhatsApp no existe todavía, o devuelve el
// registro existente. El teléfono llega en formato E.164 (p. ej.
// "5215512345678") en el campo "from" del webhook de Meta.
async function obtenerOCrearUsuarioPorTelefono(phone, { nombre } = {}) {
  if (!pool || !phone) return null;
  if (!nombre) {
    await pool.query(
      `INSERT INTO usuarios (phone_number) VALUES ($1) ON CONFLICT (phone_number) DO NOTHING`,
      [phone]
    );
  } else {
    await pool.query(
      `INSERT INTO usuarios (phone_number, nombre) VALUES ($1, $2)
       ON CONFLICT (phone_number) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         actualizado_en = NOW()`,
      [phone, String(nombre).slice(0, 200)]
    );
  }
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE phone_number = $1', [phone]);
  return rows[0] || null;
}

// Devuelve el historial de conversación guardado para ese número.
async function obtenerConversacionWhatsapp(phone) {
  if (!pool || !phone) return [];
  const { rows } = await pool.query(
    'SELECT mensajes FROM whatsapp_conversaciones WHERE phone_number = $1',
    [phone]
  );
  return (rows[0] && rows[0].mensajes) || [];
}

// Guarda (o reemplaza) el historial de conversación del número, recortándolo
// a las últimas 60 líneas para no crecer sin límite en Neon.
async function guardarConversacionWhatsapp(phone, mensajes) {
  if (!pool || !phone) return null;
  const recortados = Array.isArray(mensajes) ? mensajes.slice(-60) : [];
  const { rows } = await pool.query(
    `INSERT INTO whatsapp_conversaciones (phone_number, mensajes, actualizado_en)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (phone_number) DO UPDATE SET
       mensajes = EXCLUDED.mensajes,
       actualizado_en = NOW()
     RETURNING mensajes`,
    [phone, JSON.stringify(recortados)]
  );
  return (rows[0] && rows[0].mensajes) || [];
}

// Cuenta el uso del número dentro de la hora actual (rate limiting por hora).
// Devuelve el contador ya incrementado: > LIMITE_HORA significa bloqueado.
async function contarUsoWhatsapp(phone) {
  // Fail-closed: sin BD (pool nulo) o sin número se LANZA un error en vez de
  // devolver 1 (que desactivaba el rate limit y abría un vector de costo).
  // El catch en permiteEnviar (routes/whatsapp.js) decide el fallback:
  //   - Opción A: denegar de plano mientras la BD no responda.
  //   - Opción B (recomendada): límite local en memoria (ver ahí).
  if (!pool || !phone) {
    throw new Error('BD no disponible: no se puede verificar el rate limit de WhatsApp');
  }
  const { rows } = await pool.query(
    `INSERT INTO whatsapp_rate_limit (phone_number, contador_hora, ventana_hora)
     VALUES ($1, 1, date_trunc('hour', now()))
     ON CONFLICT (phone_number) DO UPDATE SET
       contador_hora = CASE
         WHEN whatsapp_rate_limit.ventana_hora = date_trunc('hour', now())
         THEN whatsapp_rate_limit.contador_hora + 1
         ELSE 1
       END,
       ventana_hora = date_trunc('hour', now()),
       actualizado_en = NOW()
     RETURNING contador_hora`,
    [phone]
  );
  return (rows[0] && rows[0].contador_hora) || 1;
}

module.exports = {
  pool,
  inicializar,
  obtenerOCrearUsuario,
  obtenerUsuarioPorGoogleId,
  actualizarPlan,
  obtenerEstadoChat,
  registrarInsulto,
  sincronizarDatos,
  obtenerDatos,
  obtenerOCrearUsuarioPorTelefono,
  obtenerConversacionWhatsapp,
  guardarConversacionWhatsapp,
  contarUsoWhatsapp
};
