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

module.exports = {
  pool,
  inicializar,
  obtenerOCrearUsuario,
  obtenerUsuarioPorGoogleId,
  actualizarPlan
};
