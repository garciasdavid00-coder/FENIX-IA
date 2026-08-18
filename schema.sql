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
