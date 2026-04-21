const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

let dbConnected = false;

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    dbConnected = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    dbConnected = false;
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Hint: Is MySQL server running on localhost?');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   Hint: Database '${process.env.DB_NAME}' does not exist. Run schema.sql first.`);
    }
    console.warn('⚠️  Server will continue running but API calls requiring DB will fail.');
  }
}

function isDbConnected() {
  return dbConnected;
}

module.exports = { pool, testConnection, isDbConnected };
