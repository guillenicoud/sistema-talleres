// Compatibilidad con la configuración alternativa de PostgreSQL.
// No se utiliza en los controladores MySQL. Nunca guardar credenciales aquí.
import 'dotenv/config';
import pg from 'pg';
export const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  connectionTimeoutMillis: 5000
});
