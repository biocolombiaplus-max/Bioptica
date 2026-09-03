CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optica_id UUID NOT NULL REFERENCES opticas(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(5) NOT NULL,
  numero_documento VARCHAR(30) NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  fecha_nacimiento DATE,
  sexo VARCHAR(20),
  eps_regimen VARCHAR(150),
  direccion VARCHAR(255),
  telefono VARCHAR(50),
  correo VARCHAR(150),
  ocupacion VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (optica_id, tipo_documento, numero_documento)
);

CREATE INDEX idx_pacientes_optica_id ON pacientes(optica_id);
CREATE INDEX idx_pacientes_numero_documento ON pacientes(numero_documento);
