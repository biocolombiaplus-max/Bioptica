CREATE TABLE historias_clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optica_id UUID NOT NULL REFERENCES opticas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  optometra_id UUID NOT NULL REFERENCES optometras(id),

  fecha_atencion TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Anamnesis
  motivo_consulta TEXT,
  enfermedad_actual TEXT,
  antecedentes_personales_oculares TEXT,
  antecedentes_personales_sistemicos TEXT,
  antecedentes_familiares TEXT,
  antecedentes_quirurgicos TEXT,
  alergias TEXT,

  -- Agudeza visual sin corrección
  av_sc_lejos_od VARCHAR(20),
  av_sc_lejos_oi VARCHAR(20),
  av_sc_lejos_ao VARCHAR(20),
  av_sc_cerca_od VARCHAR(20),
  av_sc_cerca_oi VARCHAR(20),
  av_sc_cerca_ao VARCHAR(20),

  -- Agudeza visual con corrección actual
  av_cc_lejos_od VARCHAR(20),
  av_cc_lejos_oi VARCHAR(20),
  av_cc_lejos_ao VARCHAR(20),
  av_cc_cerca_od VARCHAR(20),
  av_cc_cerca_oi VARCHAR(20),
  av_cc_cerca_ao VARCHAR(20),

  -- Retinoscopia (refracción objetiva)
  retinoscopia_od_esfera VARCHAR(10),
  retinoscopia_od_cilindro VARCHAR(10),
  retinoscopia_od_eje VARCHAR(10),
  retinoscopia_oi_esfera VARCHAR(10),
  retinoscopia_oi_cilindro VARCHAR(10),
  retinoscopia_oi_eje VARCHAR(10),

  -- Refracción subjetiva
  subjetivo_od_esfera VARCHAR(10),
  subjetivo_od_cilindro VARCHAR(10),
  subjetivo_od_eje VARCHAR(10),
  subjetivo_oi_esfera VARCHAR(10),
  subjetivo_oi_cilindro VARCHAR(10),
  subjetivo_oi_eje VARCHAR(10),

  -- Queratometría
  queratometria_od VARCHAR(50),
  queratometria_oi VARCHAR(50),

  vision_colores TEXT,
  motilidad_ocular TEXT,
  cover_test TEXT,

  -- Examen físico ocular
  biomicroscopia TEXT,
  tonometria_od VARCHAR(10),
  tonometria_oi VARCHAR(10),
  oftalmoscopia TEXT,

  -- Diagnóstico y plan
  diagnosticos JSONB NOT NULL DEFAULT '[]',
  plan_manejo TEXT,
  fecha_proximo_control DATE,

  -- Fórmula óptica final
  formula_od_esfera VARCHAR(10),
  formula_od_cilindro VARCHAR(10),
  formula_od_eje VARCHAR(10),
  formula_od_adicion VARCHAR(10),
  formula_oi_esfera VARCHAR(10),
  formula_oi_cilindro VARCHAR(10),
  formula_oi_eje VARCHAR(10),
  formula_oi_adicion VARCHAR(10),
  distancia_interpupilar VARCHAR(20),
  tipo_lente VARCHAR(150),
  material_lente VARCHAR(150),
  tratamientos VARCHAR(255),

  -- Cierre / firma (snapshot al momento de firmar, para no depender de cambios futuros del optometra)
  firma_nombre VARCHAR(200) NOT NULL,
  firma_registro_profesional VARCHAR(50) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_historias_optica_id ON historias_clinicas(optica_id);
CREATE INDEX idx_historias_paciente_id ON historias_clinicas(paciente_id);
CREATE INDEX idx_historias_fecha_atencion ON historias_clinicas(fecha_atencion);
