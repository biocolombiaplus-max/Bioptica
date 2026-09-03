import { pool } from '../../db/pool';

export async function obtenerOpticaPorId(opticaId: string) {
  const result = await pool.query(
    `SELECT id, nombre, slug, nit, direccion, telefono, email, logo_url, color_primario
     FROM opticas WHERE id = $1`,
    [opticaId]
  );
  return result.rows[0] ?? null;
}

export interface BrandingInput {
  logoUrl?: string;
  colorPrimario?: string;
}

export async function actualizarBranding(opticaId: string, data: BrandingInput) {
  const result = await pool.query(
    `UPDATE opticas SET logo_url = $2, color_primario = $3, updated_at = now()
     WHERE id = $1
     RETURNING id, nombre, logo_url, color_primario`,
    [opticaId, data.logoUrl ?? null, data.colorPrimario ?? null]
  );
  return result.rows[0] ?? null;
}
