CREATE TABLE consentimientos_informados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optica_id UUID NOT NULL REFERENCES opticas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  historia_clinica_id UUID NOT NULL REFERENCES historias_clinicas(id) ON DELETE CASCADE,

  texto_consentimiento TEXT NOT NULL,
  firma_imagen_base64 TEXT NOT NULL,
  nombre_paciente_firma VARCHAR(200) NOT NULL,
  documento_paciente_firma VARCHAR(30) NOT NULL,

  firmado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (historia_clinica_id)
);

CREATE INDEX idx_consentimientos_optica_id ON consentimientos_informados(optica_id);
CREATE INDEX idx_consentimientos_paciente_id ON consentimientos_informados(paciente_id);
