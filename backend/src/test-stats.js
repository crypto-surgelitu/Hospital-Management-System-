require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('./config/db');

async function testStats() {
  try {
    // Test patients
    const [p] = await pool.query('SELECT COUNT(*) as count FROM patients');
    console.log('patients:', p[0].count);
  } catch (e) {
    console.log('patients error:', e.message);
  }

  try {
    // Test appointments
    const [a] = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = CURDATE()");
    console.log('appointments:', a[0].count);
  } catch (e) {
    console.log('appointments error:', e.message);
  }

  try {
    // Test lab_requests
    const [l] = await pool.query("SELECT COUNT(*) as count FROM lab_requests WHERE status = 'pending'");
    console.log('lab_requests:', l[0].count);
  } catch (e) {
    console.log('lab_requests error:', e.message);
  }

  try {
    // Test pharmacy_inventory
    const [d] = await pool.query('SELECT COUNT(*) as count FROM pharmacy_inventory WHERE quantity_in_stock <= reorder_level AND is_active = 1');
    console.log('pharmacy_inventory:', d[0].count);
  } catch (e) {
    console.log('pharmacy_inventory error:', e.message);
  }

  process.exit();
}

testStats();