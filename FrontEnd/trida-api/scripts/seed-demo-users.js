import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool, query } from '../src/config/db.js';

dotenv.config();

const users = [
  {
    name: 'Administrador TriDa',
    email: 'admin@trida.co',
    password: 'admin123',
    role: 'ADMINISTRADOR'
  },
  {
    name: 'Analista TriDa',
    email: 'analyst@trida.co',
    password: 'analyst123',
    role: 'ANALISTA'
  },
  {
    name: 'Operador TriDa',
    email: 'operator@trida.co',
    password: 'operator123',
    role: 'OPERADOR'
  }
];

try {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    await query(
      `INSERT INTO trida.usuarios_sistemas
       (nombre_completo, email, password_hash, rol, estado)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO UPDATE
       SET nombre_completo = EXCLUDED.nombre_completo,
           password_hash = EXCLUDED.password_hash,
           rol = EXCLUDED.rol,
           estado = TRUE`,
      [u.name, u.email, hash, u.role]
    );
    console.log(`✅ Usuario demo listo: ${u.email} / ${u.password}`);
  }
} catch (err) {
  console.error('❌ Error creando usuarios demo:', err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
