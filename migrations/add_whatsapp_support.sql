-- ============================================================================
-- add_whatsapp_support.sql — Migración para el bot de WhatsApp.
-- (db.js también aplica estos cambios automáticamente al arrancar el
--  servidor mediante `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE`.)
-- ============================================================================

-- 1) Los usuarios ahora pueden identificarse por número de teléfono (WhatsApp)
--    además de por Google. google_id pasa a ser opcional.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE usuarios ALTER COLUMN google_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_phone_number
  ON usuarios(phone_number) WHERE phone_number IS NOT NULL;

-- 2) La memoria se indexa por un string genérico de usuario (id de Google o
--    "wa:<teléfono>"), así que se elimina la FK que forzaba google_id.
ALTER TABLE user_memories DROP CONSTRAINT IF EXISTS user_memories_user_id_fkey;

-- 3) Historial de conversación por número de WhatsApp.
CREATE TABLE IF NOT EXISTS whatsapp_conversaciones (
  phone_number   VARCHAR(20) PRIMARY KEY,
  mensajes       JSONB       NOT NULL DEFAULT '[]',
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4) Rate limiting del bot: contador por número dentro de cada hora.
CREATE TABLE IF NOT EXISTS whatsapp_rate_limit (
  phone_number   VARCHAR(20) PRIMARY KEY,
  contador_hora  INTEGER     NOT NULL DEFAULT 0,
  ventana_hora   TIMESTAMPTZ NOT NULL,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);