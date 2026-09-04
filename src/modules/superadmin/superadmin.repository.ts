import { pool } from '../../db/pool';

export async function obtenerSuperadminPorEmail(email: string) {
  const result = await pool.query(
    `SELECT id, nombre_completo, email, password_hash FROM superadmins WHERE email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
}

export async function listarOpticasConConteo() {
  const result = await pool.query(`
    SELECT
      o.id, o.nombre, o.slug, o.nit, o.email, o.activo, o.modulo_historia_clinica, o.created_at,
      COUNT(DISTINCT opt.id)::int AS numero_optometras,
      COUNT(DISTINCT p.id)::int AS numero_pacientes
    FROM opticas o
    LEFT JOIN optometras opt ON opt.optica_id = o.id
    LEFT JOIN pacientes p ON p.optica_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `);
  return result.rows;
}

export async function obtenerAdminOpticaDeOptica(opticaId: string) {
  const opticaResult = await pool.query(
    `SELECT id, nombre, activo FROM opticas WHERE id = $1`,
    [opticaId]
  );
  const optica = opticaResult.rows[0];
  if (!optica || !optica.activo) return null;

  const adminResult = await pool.query(
    `SELECT id, nombre_completo, email, numero_registro_profesional, rol
     FROM optometras
     WHERE optica_id = $1 AND activo = true
     ORDER BY (rol = 'admin_optica') DESC, created_at ASC
     LIMIT 1`,
    [opticaId]
  );
  const optometra = adminResult.rows[0];
  if (!optometra) return null;

  return { optometra, optica };
}

export interface NuevaOpticaInput {
  nombre: string;
  slug: string;
  nit?: string;
  emailOptica?: string;
  nombreAdmin: string;
  emailAdmin: string;
  passwordHashAdmin: string;
  registroAdmin: string;
  moduloHistoriaClinica: boolean;
}

export async function crearOpticaConAdmin(data: NuevaOpticaInput) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const opticaResult = await client.query(
      `INSERT INTO opticas (nombre, slug, nit, email, activo, modulo_historia_clinica)
       VALUES ($1,$2,$3,$4,true,$5)
       RETURNING id, nombre, slug`,
      [data.nombre, data.slug, data.nit ?? null, data.emailOptica ?? null, data.moduloHistoriaClinica]
    );
    const optica = opticaResult.rows[0];

    await client.query(
      `INSERT INTO optometras (optica_id, nombre_completo, email, password_hash, numero_registro_profesional, rol)
       VALUES ($1,$2,$3,$4,$5,'admin_optica')`,
      [optica.id, data.nombreAdmin, data.emailAdmin, data.passwordHashAdmin, data.registroAdmin]
    );

    await client.query('COMMIT');
    return optica;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export interface ActualizarEstadoOpticaInput {
  activo?: boolean;
  moduloHistoriaClinica?: boolean;
}

export async function actualizarEstadoOptica(opticaId: string, data: ActualizarEstadoOpticaInput) {
  const result = await pool.query(
    `UPDATE opticas SET
      activo = COALESCE($2, activo),
      modulo_historia_clinica = COALESCE($3, modulo_historia_clinica),
      updated_at = now()
     WHERE id = $1
     RETURNING id, nombre, activo, modulo_historia_clinica`,
    [opticaId, data.activo ?? null, data.moduloHistoriaClinica ?? null]
  );
  return result.rows[0] ?? null;
}
