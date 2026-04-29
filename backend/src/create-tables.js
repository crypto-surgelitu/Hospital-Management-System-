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

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dispensing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        pharmacist_id INT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ dispensing table created');
  } catch (e) {
    console.log('dispensing:', e.message);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dispensing_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dispense_id INT NOT NULL,
        drug_id INT NOT NULL,
        quantity INT NOT NULL,
        dosage_instructions TEXT
      )
    `);
    console.log('✅ dispensing_items table created');
  } catch (e) {
    console.log('dispensing_items:', e.message);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_referrals (
        referral_id INT AUTO_INCREMENT PRIMARY KEY,
        queue_id INT NOT NULL,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        referral_type ENUM('lab', 'pharmacy', 'nurse') NOT NULL,
        item_id INT,
        item_description TEXT,
        quantity INT DEFAULT 1,
        dosage_instructions TEXT,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL
      )
    `);
    console.log('✅ doctor_referrals table created');
  } catch (e) {
    console.log('doctor_referrals:', e.message);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        drug_id INT NOT NULL,
        quantity_change INT NOT NULL,
        reason VARCHAR(255),
        performed_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ stock_log table created');
  } catch (e) {
    console.log('stock_log:', e.message);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        invoice_id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(20) NOT NULL UNIQUE,
        patient_id INT NOT NULL,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        amount_paid DECIMAL(10,2) DEFAULT 0,
        status ENUM('pending','partial','paid','waived') DEFAULT 'pending',
        generated_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ invoices table created');
  } catch (e) {
    console.log('invoices:', e.message);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        description VARCHAR(200),
        quantity INT DEFAULT 1,
        unit_price DECIMAL(10,2),
        subtotal DECIMAL(10,2)
      )
    `);
    console.log('✅ invoice_items table created');
  } catch (e) {
    console.log('invoice_items:', e.message);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        bill_id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        amount_paid DECIMAL(10,2) DEFAULT 0,
        payment_status ENUM('Unpaid', 'Partial', 'Paid', 'Waived') DEFAULT 'Unpaid',
        bill_date DATE NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ bills table created');
  } catch (e) {
    console.log('bills:', e.message);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_id INT NOT NULL,
        description VARCHAR(200),
        quantity INT DEFAULT 1,
        unit_price DECIMAL(10,2),
        subtotal DECIMAL(10,2)
      )
    `);
    console.log('✅ bill_items table created');
  } catch (e) {
    console.log('bill_items:', e.message);
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_id INT NOT NULL,
        amount_paid DECIMAL(10,2) NOT NULL,
        payment_method ENUM('Cash', 'M-Pesa', 'Insurance', 'Card') NOT NULL DEFAULT 'Cash',
        reference_number VARCHAR(100),
        received_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ payments table created');
  } catch (e) {
    console.log('payments:', e.message);
  }

  process.exit();
}

createTables();