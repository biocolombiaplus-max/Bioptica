import { pool } from './pool';
import { hashPassword } from '../utils/password';

async function seed() {
  const opticaResult = await pool.query(
    `INSERT INTO opticas (nombre, slug, nit, email, activo, modulo_historia_clinica)
     VALUES ($1,$2,$3,$4,true,true)
     ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre
     RETURNING id`,
    ['Óptica Demo', 'optica-demo', '900000000-0', 'contacto@opticademo.test']
  );
  const opticaId = opticaResult.rows[0].id;

  const passwordHash = await hashPassword('demo1234');
  await pool.query(
    `INSERT INTO optometras (optica_id, nombre_completo, email, password_hash, numero_registro_profesional, rol)
     VALUES ($1,$2,$3,$4,$5,'admin_optica')
     ON CONFLICT (optica_id, email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [opticaId, 'Optómetra Demo', 'demo@opticademo.test', passwordHash, 'TP-12345']
  );

  const superadminPasswordHash = await hashPassword('super1234');
  await pool.query(
    `INSERT INTO superadmins (nombre_completo, email, password_hash)
     VALUES ($1,$2,$3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['Superadmin Bioptica', 'superadmin@bioptica.test', superadminPasswordHash]
  );

  console.log('Seed completo. Login de prueba:');
  console.log('  opticaSlug: optica-demo');
  console.log('  email: demo@opticademo.test');
  console.log('  password: demo1234');
  console.log('Login de superadmin:');
  console.log('  email: superadmin@bioptica.test');
  console.log('  password: super1234');
  await pool.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
