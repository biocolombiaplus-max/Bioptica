import { pool } from '../../db/pool';
import { comparePassword } from '../../utils/password';
import { signToken, signSuperadminToken } from '../../utils/jwt';

interface LoginInput {
  email: string;
  password: string;
}

export class AuthError extends Error {
  status = 401;
}

async function intentarLoginSuperadmin({ email, password }: LoginInput) {
  const result = await pool.query(
    `SELECT id, nombre_completo, email, password_hash FROM superadmins WHERE email = $1`,
    [email]
  );
  const superadmin = result.rows[0];
  if (!superadmin) return null;

  const valido = await comparePassword(password, superadmin.password_hash);
  if (!valido) throw new AuthError('Credenciales inválidas');

  return {
    tipo: 'superadmin' as const,
    token: signSuperadminToken({ superadminId: superadmin.id }),
    superadmin: {
      id: superadmin.id,
      nombreCompleto: superadmin.nombre_completo,
      email: superadmin.email,
    },
  };
}

async function intentarLoginOptometra({ email, password }: LoginInput) {
  const result = await pool.query(
    `SELECT o.id, o.nombre_completo, o.email, o.password_hash, o.numero_registro_profesional, o.rol, o.activo,
            op.id AS optica_id, op.nombre AS optica_nombre, op.activo AS optica_activa
     FROM optometras o
     JOIN opticas op ON op.id = o.optica_id
     WHERE o.email = $1`,
    [email]
  );

  const candidatos = result.rows.filter((fila) => fila.activo && fila.optica_activa);
  if (candidatos.length === 0) return null;
  if (candidatos.length > 1) {
    throw new AuthError('Tu correo está registrado en más de una óptica. Contáctanos para resolverlo.');
  }

  const optometra = candidatos[0];
  const valido = await comparePassword(password, optometra.password_hash);
  if (!valido) throw new AuthError('Credenciales inválidas');

  return {
    tipo: 'optometra' as const,
    token: signToken({
      optometraId: optometra.id,
      opticaId: optometra.optica_id,
      rol: optometra.rol,
    }),
    optometra: {
      id: optometra.id,
      nombreCompleto: optometra.nombre_completo,
      email: optometra.email,
      numeroRegistroProfesional: optometra.numero_registro_profesional,
      rol: optometra.rol,
    },
    optica: {
      id: optometra.optica_id,
      nombre: optometra.optica_nombre,
    },
  };
}

export async function login(input: LoginInput) {
  const comoSuperadmin = await intentarLoginSuperadmin(input);
  if (comoSuperadmin) return comoSuperadmin;

  const comoOptometra = await intentarLoginOptometra(input);
  if (comoOptometra) return comoOptometra;

  throw new AuthError('Credenciales inválidas');
}
