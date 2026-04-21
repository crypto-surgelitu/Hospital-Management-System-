require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('./config/db');

async function checkAppointments() {
  const [rows] = await pool.query('DESCRIBE appointments');
  rows.forEach(r => console.log(r.Field, r.Type));
  process.exit();
}

checkAppointments();