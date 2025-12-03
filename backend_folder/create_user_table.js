require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/whattodo';
const pool = new Pool({ connectionString: DATABASE_URL });

(async () => {
  try {
    const sql = `
    CREATE TABLE IF NOT EXISTS "user" (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      google_sub TEXT UNIQUE,
      bio TEXT,
      display_name TEXT,
      saved_itineraries JSONB NOT NULL DEFAULT '[]'::jsonb,
      completed_itineraries JSONB NOT NULL DEFAULT '[]'::jsonb
    );
    `;

    console.log('Connecting to', DATABASE_URL);
    await pool.connect();
    await pool.query(sql);
    console.log('Created or verified "user" table.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create "user" table:', err && err.message ? err.message : err);
    process.exit(2);
  } finally {
    try { await pool.end(); } catch (e) {}
  }
})();
