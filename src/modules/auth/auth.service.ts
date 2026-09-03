import { pool } from '../../db/pool';
import { comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';

interface LoginInput {
  opticaSlug: string;
  email: string;
  password: string;
}

export class AuthError extends Error {
  status = 401;
}

export async function login({ opticaSlug, email, password }: LoginInput) {
  const opticaResult = await pool.query(
    `SELECT id, nombre, activo FROM opticas WHERE slug = $1`,
    [opticaSlug]
  );
  const optica = opticaResult.rows[0];
  if (!optica || !optica.activo) {
    throw new AuthError('Óptica no encontrada o inactiva');
  }

  const optometraResult = await pool.query(
    `SELECT id, nombre_completo, email, password_hash, numero_registro_profesional, rol, activo
     FROM optometras WHERE optica_id = $1 AND email = $2`,
    [optica.id, email]
  );
  const optometra = optometraResult.rows[0];
  if (!optometra || !optometra.activo) {
    throw new AuthError('Credenciales inválidas');
  }

  const valid = await comparePassword(password, optometra.password_hash);
  if (!valid) {
    throw new AuthError('Credenciales inválidas');
  }

  const token = signToken({
    optometraId: optometra.id,
    opticaId: optica.id,
    rol: optometra.rol,
  });

  return {
    token,
    optometra: {
      id: optometra.id,
      nombreCompleto: optometra.nombre_completo,
      email: optometra.email,
      numeroRegistroProfesional: optometra.numero_registro_profesional,
      rol: optometra.rol,
    },
    optica: {
      id: optica.id,
      nombre: optica.nombre,
    },
  };
}
