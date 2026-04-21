require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('./config/db');

async function test() {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM patients');
  console.log('Result:', JSON.stringify(rows));
  process.exit();
}

test();