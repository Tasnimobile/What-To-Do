require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/whattodo';
const pool = new Pool({ connectionString: DATABASE_URL });

(async () => {
  try {
    console.log('Connecting to', DATABASE_URL);

    const counts = {};
    try {
      const r = await pool.query('SELECT count(*)::int AS c FROM "user"');
      counts.user = r.rows[0].c;
    } catch (e) {
      counts.user = 'ERROR: ' + e.message;
    }
    try {
      const r2 = await pool.query('SELECT count(*)::int AS c FROM users');
      counts.users = r2.rows[0].c;
    } catch (e) {
      counts.users = 'ERROR: ' + e.message;
    }

    console.log('Row counts:', counts);

    const cols = {};
    try {
      const r = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='user' ORDER BY ordinal_position");
      cols.user = r.rows;
    } catch (e) {
      cols.user = 'ERROR: ' + e.message;
    }
    try {
      const r2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position");
      cols.users = r2.rows;
    } catch (e) {
      cols.users = 'ERROR: ' + e.message;
    }

    console.log('Columns:', JSON.stringify(cols, null, 2));

    try {
      const s = await pool.query('SELECT * FROM "user" ORDER BY id DESC LIMIT 5');
      console.log('Sample "user" rows:', s.rows);
    } catch (e) {
      console.log('Sample "user" error:', e.message);
    }

    try {
      const s2 = await pool.query('SELECT * FROM users ORDER BY id DESC LIMIT 5');
      console.log('Sample users rows:', s2.rows);
    } catch (e) {
      console.log('Sample users error:', e.message);
    }
  } catch (err) {
    console.error(err && err.message ? err.message : err);
  } finally {
    try { await pool.end(); } catch (e) {}
  }
})();
