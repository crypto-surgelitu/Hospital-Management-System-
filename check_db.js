const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/Users/antony/HMS/backend/.env' });
async function check() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables:', rows);
    process.exit(0);
  } catch (e) {
    console.error('DB Error:', e.message);
    process.exit(1);
  }
}
check();
