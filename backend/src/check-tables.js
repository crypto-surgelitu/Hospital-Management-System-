require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('./config/db');

async function checkTables() {
  const tables = ['patients', 'appointments', 'lab_requests', 'pharmacy_inventory'];
  for (const table of tables) {
    try {
      const [rows] = await pool.query(`DESCRIBE ${table}`);
      console.log(`\n=== ${table} ===`);
      rows.forEach(r => console.log(r.Field, r.Type));
    } catch (e) {
      console.log(`${table}: ${e.message}`);
    }
  }
  process.exit();
}

checkTables();