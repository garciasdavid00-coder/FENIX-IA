// Conexión a PostgreSQL (Neon). Si no hay DATABASE_URL, el servidor
// funciona igual pero sin guardar usuarios (modo sin base de datos).
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : null;

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
        cliente_id     BIGINT       NOT NULL,
        titulo         TEXT         NOT NULL,
        mensajes       JSONB        NOT NULL DEFAULT '[]',
        pinned         BOOLEAN      NOT NULL DEFAULT FALSE,
        proyecto_id    BIGINT,
        creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE (google_id, cliente_id)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proyectos (
        id         SERIAL PRIMARY KEY,
        google_id  VARCHAR(100) NOT NULL,
        cliente_id BIGINT       NOT NULL,
        nombre     TEXT         NOT NULL,
        UNIQUE (google_id, cliente_id)
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

// Reemplaza por completo los chats y proyectos del usuario por el estado
// que manda el navegador (sincronización por snapshot).
async function sincronizarDatos(googleId, { chats, proyectos }) {
  if (!pool) return null;
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
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

module.exports = {
  pool,
  inicializar,
  obtenerOCrearUsuario,
  obtenerUsuarioPorGoogleId,
  actualizarPlan,
  sincronizarDatos,
  obtenerDatos
};
