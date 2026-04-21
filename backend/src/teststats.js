require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('./config/db');

async function testStats() {
  try {
    console.log('Step 1: patients');
    const p = await pool.query('SELECT COUNT(*) as cnt FROM patients WHERE deleted_at IS NULL');
    console.log('p result:', JSON.stringify(p));

    console.log('Step 2: appointments');
    const a = await pool.query('SELECT COUNT(*) as cnt FROM appointments WHERE DATE(appointment_date) = CURDATE()');
    console.log('a result:', JSON.stringify(a));

    console.log('Step 3: lab_requests');
    const l = await pool.query("SELECT COUNT(*) as cnt FROM lab_requests WHERE status = 'pending'");
    console.log('l result:', JSON.stringify(l));

    console.log('Step 4: pharmacy_inventory');
    const d = await pool.query('SELECT COUNT(*) as cnt FROM pharmacy_inventory WHERE quantity_in_stock <= reorder_level AND is_active = 1');
    console.log('d result:', JSON.stringify(d));

    console.log('Success!');
  } catch (e) {
    console.log('Error:', e.message);
  }
  process.exit();
}

testStats();