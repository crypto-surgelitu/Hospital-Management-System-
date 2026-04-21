require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('./config/db');

async function addDeletedAt() {
  try {
    await pool.query('ALTER TABLE patients ADD COLUMN deleted_at TIMESTAMP NULL');
    console.log('✅ added deleted_at to patients');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('deleted_at already exists');
    else console.log('patients:', e.message);
  }
  process.exit();
}

addDeletedAt();