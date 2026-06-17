import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'trida_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Asegura que las consultas usen el schema trida por defecto.
  options: '-c search_path=trida,public'
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function checkDbConnection() {
  const result = await query('SELECT NOW() AS now');
  return result.rows[0];
}
