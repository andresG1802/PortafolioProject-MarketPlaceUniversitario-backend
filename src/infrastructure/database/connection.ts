import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'marketplace_db',
  user: process.env.DB_USER ?? 'marketplace_user',
  password: process.env.DB_PASSWORD ?? 'marketplace_pass',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const connectDB = async (): Promise<void> => {
  const client = await pool.connect();
  console.log('✅ PostgreSQL connected');
  client.release();
};
