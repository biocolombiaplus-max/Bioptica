import 'dotenv/config';
import { pool } from './pool';
import { hashPassword } from '../utils/password';

async function bootstrapSuperadmin() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const nombre = process.env.SUPERADMIN_NOMBRE ?? 'Superadmin Bioptica';

  if (!email || !password) {
    console.log('SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD no configuradas: se omite la creación automática de superadmin.');
    return;
  }

  const passwordHash = await hashPassword(password);
  await pool.query(
    `INSERT INTO superadmins (nombre_completo, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, nombre_completo = EXCLUDED.nombre_completo`,
    [nombre, email, passwordHash]
  );
  console.log(`Superadmin listo: ${email}`);
}

bootstrapSuperadmin()
  .catch((error) => {
    console.error('Error creando el superadmin:', error);
    process.exit(1);
  })
  .finally(() => pool.end());
