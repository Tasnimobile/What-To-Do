require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/whattodo';
const pool = new Pool({ connectionString: DATABASE_URL });

(async () => {
  try {
    const sqlPath = path.resolve(__dirname, 'migrations', '001_create_tables.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('Migration file not found:', sqlPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Connecting to Postgres at', DATABASE_URL);
    await pool.connect();

    console.log('Running migration...');
    await pool.query(sql);

    console.log('Migration executed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:');
    console.error(err && err.message ? err.message : err);
    process.exit(2);
  } finally {
    try { await pool.end(); } catch (e) {}
  }
})();
