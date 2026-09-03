CREATE TABLE optometras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optica_id UUID NOT NULL REFERENCES opticas(id) ON DELETE CASCADE,
  nombre_completo VARCHAR(200) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  numero_registro_profesional VARCHAR(50) NOT NULL,
  rol VARCHAR(30) NOT NULL DEFAULT 'optometra',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (optica_id, email)
);

CREATE INDEX idx_optometras_optica_id ON optometras(optica_id);
