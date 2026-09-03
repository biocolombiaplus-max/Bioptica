import { pool } from '../../db/pool';

export interface ConsentimientoInput {
  historiaClinicaId: string;
  pacienteId: string;
  textoConsentimiento: string;
  firmaImagenBase64: string;
  nombrePacienteFirma: string;
  documentoPacienteFirma: string;
}

export async function crearConsentimiento(opticaId: string, data: ConsentimientoInput) {
  const result = await pool.query(
    `INSERT INTO consentimientos_informados
      (optica_id, paciente_id, historia_clinica_id, texto_consentimiento, firma_imagen_base64, nombre_paciente_firma, documento_paciente_firma)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, optica_id, paciente_id, historia_clinica_id, nombre_paciente_firma, documento_paciente_firma, firmado_en`,
    [
      opticaId,
      data.pacienteId,
      data.historiaClinicaId,
      data.textoConsentimiento,
      data.firmaImagenBase64,
      data.nombrePacienteFirma,
      data.documentoPacienteFirma,
    ]
  );
  return result.rows[0];
}

export async function obtenerConsentimientoPorHistoria(opticaId: string, historiaClinicaId: string) {
  const result = await pool.query(
    `SELECT * FROM consentimientos_informados WHERE optica_id = $1 AND historia_clinica_id = $2`,
    [opticaId, historiaClinicaId]
  );
  return result.rows[0] ?? null;
}
