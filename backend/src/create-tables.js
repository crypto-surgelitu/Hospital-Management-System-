require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('./config/db');

async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lab_requests (
        lab_request_id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        requested_by INT NOT NULL,
        test_type VARCHAR(150) NOT NULL,
        status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
        priority ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
        specimen_collected TINYINT(1) DEFAULT 0,
        specimen_collected_at TIMESTAMP NULL,
        results TEXT,
        notes TEXT,
        technician_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL
      )
    `);
    console.log('✅ lab_requests table created');
  } catch (e) {
    console.log('lab_requests:', e.message);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pharmacy_inventory (
        drug_id INT AUTO_INCREMENT PRIMARY KEY,
        drug_name VARCHAR(150) NOT NULL,
        generic_name VARCHAR(150),
        category VARCHAR(100),
        quantity_in_stock INT NOT NULL DEFAULT 0,
        unit VARCHAR(50),
        expiry_date DATE,
        reorder_level INT DEFAULT 10,
        unit_price DECIMAL(10,2),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ pharmacy_inventory table created');
  } catch (e) {
    console.log('pharmacy_inventory:', e.message);
  }

  process.exit();
}

createTables();