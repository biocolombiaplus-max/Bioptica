import { pool } from '../../db/pool';

export async function obtenerOptometraPorId(opticaId: string, optometraId: string) {
  const result = await pool.query(
    `SELECT id, nombre_completo, numero_registro_profesional
     FROM optometras WHERE optica_id = $1 AND id = $2`,
    [opticaId, optometraId]
  );
  return result.rows[0] ?? null;
}
