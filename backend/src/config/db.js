const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Hint: Is MySQL server running on localhost?');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   Hint: Database '${process.env.DB_NAME}' does not exist.`);
    }
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
