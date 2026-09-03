import { pool } from '../../db/pool';

export interface Diagnostico {
  codigo: string;
  descripcion: string;
}

export interface HistoriaClinicaInput {
  pacienteId: string;

  motivoConsulta?: string;
  enfermedadActual?: string;
  antecedentesPersonalesOculares?: string;
  antecedentesPersonalesSistemicos?: string;
  antecedentesFamiliares?: string;
  antecedentesQuirurgicos?: string;
  alergias?: string;

  avScLejosOd?: string;
  avScLejosOi?: string;
  avScLejosAo?: string;
  avScCercaOd?: string;
  avScCercaOi?: string;
  avScCercaAo?: string;

  avCcLejosOd?: string;
  avCcLejosOi?: string;
  avCcLejosAo?: string;
  avCcCercaOd?: string;
  avCcCercaOi?: string;
  avCcCercaAo?: string;

  retinoscopiaOdEsfera?: string;
  retinoscopiaOdCilindro?: string;
  retinoscopiaOdEje?: string;
  retinoscopiaOiEsfera?: string;
  retinoscopiaOiCilindro?: string;
  retinoscopiaOiEje?: string;

  subjetivoOdEsfera?: string;
  subjetivoOdCilindro?: string;
  subjetivoOdEje?: string;
  subjetivoOiEsfera?: string;
  subjetivoOiCilindro?: string;
  subjetivoOiEje?: string;

  queratometriaOd?: string;
  queratometriaOi?: string;

  visionColores?: string;
  motilidadOcular?: string;
  coverTest?: string;

  biomicroscopia?: string;
  tonometriaOd?: string;
  tonometriaOi?: string;
  oftalmoscopia?: string;

  diagnosticos?: Diagnostico[];
  planManejo?: string;
  fechaProximoControl?: string;

  formulaOdEsfera?: string;
  formulaOdCilindro?: string;
  formulaOdEje?: string;
  formulaOdAdicion?: string;
  formulaOiEsfera?: string;
  formulaOiCilindro?: string;
  formulaOiEje?: string;
  formulaOiAdicion?: string;
  distanciaInterpupilar?: string;
  tipoLente?: string;
  materialLente?: string;
  tratamientos?: string;
}

interface FirmaOptometra {
  nombre: string;
  registroProfesional: string;
}

export async function crearHistoriaClinica(
  opticaId: string,
  optometraId: string,
  firma: FirmaOptometra,
  data: HistoriaClinicaInput
) {
  const result = await pool.query(
    `INSERT INTO historias_clinicas (
      optica_id, paciente_id, optometra_id,
      motivo_consulta, enfermedad_actual, antecedentes_personales_oculares,
      antecedentes_personales_sistemicos, antecedentes_familiares, antecedentes_quirurgicos, alergias,
      av_sc_lejos_od, av_sc_lejos_oi, av_sc_lejos_ao, av_sc_cerca_od, av_sc_cerca_oi, av_sc_cerca_ao,
      av_cc_lejos_od, av_cc_lejos_oi, av_cc_lejos_ao, av_cc_cerca_od, av_cc_cerca_oi, av_cc_cerca_ao,
      retinoscopia_od_esfera, retinoscopia_od_cilindro, retinoscopia_od_eje,
      retinoscopia_oi_esfera, retinoscopia_oi_cilindro, retinoscopia_oi_eje,
      subjetivo_od_esfera, subjetivo_od_cilindro, subjetivo_od_eje,
      subjetivo_oi_esfera, subjetivo_oi_cilindro, subjetivo_oi_eje,
      queratometria_od, queratometria_oi,
      vision_colores, motilidad_ocular, cover_test,
      biomicroscopia, tonometria_od, tonometria_oi, oftalmoscopia,
      diagnosticos, plan_manejo, fecha_proximo_control,
      formula_od_esfera, formula_od_cilindro, formula_od_eje, formula_od_adicion,
      formula_oi_esfera, formula_oi_cilindro, formula_oi_eje, formula_oi_adicion,
      distancia_interpupilar, tipo_lente, material_lente, tratamientos,
      firma_nombre, firma_registro_profesional
    ) VALUES (
      $1,$2,$3,
      $4,$5,$6,
      $7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,
      $17,$18,$19,$20,$21,$22,
      $23,$24,$25,
      $26,$27,$28,
      $29,$30,$31,
      $32,$33,$34,
      $35,$36,
      $37,$38,$39,
      $40,$41,$42,$43,
      $44,$45,$46,
      $47,$48,$49,$50,
      $51,$52,$53,$54,
      $55,$56,$57,$58,
      $59,$60
    ) RETURNING *`,
    [
      opticaId, data.pacienteId, optometraId,
      data.motivoConsulta ?? null, data.enfermedadActual ?? null, data.antecedentesPersonalesOculares ?? null,
      data.antecedentesPersonalesSistemicos ?? null, data.antecedentesFamiliares ?? null, data.antecedentesQuirurgicos ?? null, data.alergias ?? null,
      data.avScLejosOd ?? null, data.avScLejosOi ?? null, data.avScLejosAo ?? null, data.avScCercaOd ?? null, data.avScCercaOi ?? null, data.avScCercaAo ?? null,
      data.avCcLejosOd ?? null, data.avCcLejosOi ?? null, data.avCcLejosAo ?? null, data.avCcCercaOd ?? null, data.avCcCercaOi ?? null, data.avCcCercaAo ?? null,
      data.retinoscopiaOdEsfera ?? null, data.retinoscopiaOdCilindro ?? null, data.retinoscopiaOdEje ?? null,
      data.retinoscopiaOiEsfera ?? null, data.retinoscopiaOiCilindro ?? null, data.retinoscopiaOiEje ?? null,
      data.subjetivoOdEsfera ?? null, data.subjetivoOdCilindro ?? null, data.subjetivoOdEje ?? null,
      data.subjetivoOiEsfera ?? null, data.subjetivoOiCilindro ?? null, data.subjetivoOiEje ?? null,
      data.queratometriaOd ?? null, data.queratometriaOi ?? null,
      data.visionColores ?? null, data.motilidadOcular ?? null, data.coverTest ?? null,
      data.biomicroscopia ?? null, data.tonometriaOd ?? null, data.tonometriaOi ?? null, data.oftalmoscopia ?? null,
      JSON.stringify(data.diagnosticos ?? []), data.planManejo ?? null, data.fechaProximoControl ?? null,
      data.formulaOdEsfera ?? null, data.formulaOdCilindro ?? null, data.formulaOdEje ?? null, data.formulaOdAdicion ?? null,
      data.formulaOiEsfera ?? null, data.formulaOiCilindro ?? null, data.formulaOiEje ?? null, data.formulaOiAdicion ?? null,
      data.distanciaInterpupilar ?? null, data.tipoLente ?? null, data.materialLente ?? null, data.tratamientos ?? null,
      firma.nombre, firma.registroProfesional,
    ]
  );
  return result.rows[0];
}

export async function listarHistoriasPorPaciente(opticaId: string, pacienteId: string) {
  const result = await pool.query(
    `SELECT * FROM historias_clinicas
     WHERE optica_id = $1 AND paciente_id = $2
     ORDER BY fecha_atencion DESC`,
    [opticaId, pacienteId]
  );
  return result.rows;
}

export async function obtenerHistoria(opticaId: string, historiaId: string) {
  const result = await pool.query(
    `SELECT * FROM historias_clinicas WHERE optica_id = $1 AND id = $2`,
    [opticaId, historiaId]
  );
  return result.rows[0] ?? null;
}

export async function listarHistoriasRecientes(opticaId: string, limite: number) {
  const result = await pool.query(
    `SELECT
      h.id, h.paciente_id, h.fecha_atencion, h.diagnosticos,
      h.formula_od_esfera, h.formula_oi_esfera,
      p.nombre_completo AS paciente_nombre, p.numero_documento AS paciente_documento,
      (c.id IS NOT NULL) AS tiene_consentimiento
     FROM historias_clinicas h
     JOIN pacientes p ON p.id = h.paciente_id
     LEFT JOIN consentimientos_informados c ON c.historia_clinica_id = h.id
     WHERE h.optica_id = $1
     ORDER BY h.fecha_atencion DESC
     LIMIT $2`,
    [opticaId, limite]
  );
  return result.rows;
}
