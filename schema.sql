-- Fenix IA - Esquema de la base de datos (PostgreSQL)
-- Tabla de usuarios con su plan de suscripción

CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  google_id      VARCHAR(100) UNIQUE NOT NULL,
  nombre         VARCHAR(200),
  correo         VARCHAR(200) UNIQUE,
  foto           VARCHAR(500),
  plan           VARCHAR(20)  NOT NULL DEFAULT 'gratis',   -- gratis | pro | ultra
  plan_desde     TIMESTAMPTZ,
  plan_hasta     TIMESTAMPTZ,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Historial de conversaciones de cada cuenta (sincronizado con el navegador).
CREATE TABLE IF NOT EXISTS chats (
  id             SERIAL PRIMARY KEY,
  google_id      VARCHAR(100) NOT NULL,
  cliente_id     BIGINT       NOT NULL,                    -- id que usa el navegador
  titulo         TEXT         NOT NULL,
  mensajes       JSONB        NOT NULL DEFAULT '[]',       -- [{tipo, texto}, ...]
  pinned         BOOLEAN      NOT NULL DEFAULT FALSE,
  proyecto_id    BIGINT,                                   -- id de cliente del proyecto (opcional)
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (google_id, cliente_id)
);

CREATE TABLE IF NOT EXISTS proyectos (
  id         SERIAL PRIMARY KEY,
  google_id  VARCHAR(100) NOT NULL,
  cliente_id BIGINT       NOT NULL,                        -- id que usa el navegador
  nombre     TEXT         NOT NULL,
  UNIQUE (google_id, cliente_id)
);
