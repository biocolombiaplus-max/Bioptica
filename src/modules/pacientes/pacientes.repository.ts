import { pool } from '../../db/pool';

export interface PacienteInput {
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  fechaNacimiento?: string;
  sexo?: string;
  epsRegimen?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  ocupacion?: string;
}

export async function crearPaciente(opticaId: string, data: PacienteInput) {
  const result = await pool.query(
    `INSERT INTO pacientes
      (optica_id, tipo_documento, numero_documento, nombre_completo, fecha_nacimiento, sexo, eps_regimen, direccion, telefono, correo, ocupacion)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      opticaId,
      data.tipoDocumento,
      data.numeroDocumento,
      data.nombreCompleto,
      data.fechaNacimiento ?? null,
      data.sexo ?? null,
      data.epsRegimen ?? null,
      data.direccion ?? null,
      data.telefono ?? null,
      data.correo ?? null,
      data.ocupacion ?? null,
    ]
  );
  return result.rows[0];
}

export async function listarPacientes(opticaId: string) {
  const result = await pool.query(
    `SELECT * FROM pacientes WHERE optica_id = $1 ORDER BY nombre_completo`,
    [opticaId]
  );
  return result.rows;
}

export async function buscarPacientePorDocumento(opticaId: string, numeroDocumento: string) {
  const result = await pool.query(
    `SELECT * FROM pacientes WHERE optica_id = $1 AND numero_documento = $2`,
    [opticaId, numeroDocumento]
  );
  return result.rows[0] ?? null;
}
