CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE opticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  nit VARCHAR(50),
  direccion VARCHAR(255),
  telefono VARCHAR(50),
  email VARCHAR(150),
  activo BOOLEAN NOT NULL DEFAULT true,
  modulo_historia_clinica BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
