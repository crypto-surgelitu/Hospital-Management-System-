require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('./config/db');

async function test() {
  const [r1] = await pool.query('SELECT COUNT(*) FROM patients');
  console.log('p1:', r1);
  const [r2] = await pool.query('SELECT COUNT(*) as cnt FROM patients');
  console.log('p2:', r2);
  process.exit();
}

test();