-- ============================================================================
-- Fenix IA — Migración: memoria persistente por usuario
-- Crea la tabla donde guardamos hechos y preferencias de cada usuario para
-- reinyectarlos en el system prompt de futuras conversaciones.
--
-- Nota: se aplica automáticamente al arrancar el servidor (ver db.js,
-- función inicializar). Este archivo queda como referencia/migración manual.
-- ============================================================================

-- Las demás tablas del proyecto usan TIMESTAMPTZ, así que aquí también,
-- para mantener la consistencia del esquema.
CREATE TABLE IF NOT EXISTS user_memories (
  id          SERIAL PRIMARY KEY,
  -- Mismo tipo que usuarios.google_id (el identificador del login con Google).
  user_id     VARCHAR(100) NOT NULL REFERENCES usuarios(google_id) ON DELETE CASCADE,
  memory_text TEXT        NOT NULL,
  -- Clasificación libre: personal, preferencia, proyecto, tecnico, etc.
  category    VARCHAR(50) NOT NULL DEFAULT 'personal',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para los lookups frecuentes de memorias por usuario.
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id
  ON user_memories(user_id);