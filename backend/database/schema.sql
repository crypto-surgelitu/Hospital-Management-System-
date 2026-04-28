-- ============================================
-- HMS Meru — Database Schema
-- Engine: InnoDB, Charset: utf8mb4
-- ============================================

CREATE DATABASE IF NOT EXISTS hms_db;
USE hms_db;

-- ─── Patients ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    gender ENUM('male','female','other') NOT NULL,
    dob DATE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    national_id VARCHAR(20) UNIQUE,
    emergency_contact VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Users ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','doctor','nurse','pharmacy','lab','receptionist') NOT NULL,
    department VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Appointments ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    status ENUM('pending','in-progress','completed','cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Lab Requests ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lab_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    requested_by INT NOT NULL,
    test_type VARCHAR(150) NOT NULL,
    status ENUM('pending','processing','completed') DEFAULT 'pending',
    priority ENUM('routine','urgent','stat') DEFAULT 'routine',
    specimen_collected TINYINT(1) DEFAULT 0,
    specimen_collected_at TIMESTAMP NULL DEFAULT NULL,
    results TEXT,
    notes TEXT,
    technician_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Pharmacy Inventory ──────────────────────────────────────

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Dispensing ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dispensing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    pharmacist_id INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (pharmacist_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dispensing_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispense_id INT NOT NULL,
    drug_id INT NOT NULL,
    quantity INT NOT NULL,
    dosage_instructions TEXT,
    FOREIGN KEY (dispense_id) REFERENCES dispensing(id) ON DELETE CASCADE,
    FOREIGN KEY (drug_id) REFERENCES pharmacy_inventory(drug_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Stock Log ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stock_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drug_id INT NOT NULL,
    quantity_change INT NOT NULL,
    reason VARCHAR(255),
    performed_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drug_id) REFERENCES pharmacy_inventory(drug_id) ON DELETE RESTRICT,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Invoices (Billing) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(20) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending','partial','paid','waived') DEFAULT 'pending',
    generated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    description VARCHAR(200),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash','mpesa','insurance','card') NOT NULL DEFAULT 'cash',
    reference_number VARCHAR(100),
    received_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Patient Queue Management
-- ============================================

CREATE TABLE IF NOT EXISTS patient_queue (
    queue_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT,
    status ENUM('waiting', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'waiting',
    priority ENUM('normal', 'urgent') DEFAULT 'normal',
    chief_complaint TEXT,
    notes TEXT,
    queue_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    called_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Nurse Tasks
-- ============================================

CREATE TABLE IF NOT EXISTS nurse_tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    queue_id INT NOT NULL,
    patient_id INT NOT NULL,
    task_description TEXT NOT NULL,
    task_type ENUM('injection', 'vital_signs', 'wound_care', 'observation', 'dressing', 'other') DEFAULT 'other',
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    priority ENUM('normal', 'urgent') DEFAULT 'normal',
    assigned_by INT NOT NULL,
    assigned_nurse INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (queue_id) REFERENCES patient_queue(queue_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id),
    FOREIGN KEY (assigned_nurse) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Doctor Referrals
-- ============================================

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
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (queue_id) REFERENCES patient_queue(queue_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Seed Data
-- Password for ALL users: Admin@1234
-- bcryptjs hash ($2a$) of "Admin@1234"
-- ============================================

INSERT INTO users (full_name, username, password_hash, role, department) VALUES
('System Admin',    'admin',       NULL, 'admin',        'Administration'),
('Dr. James Ochieng','dr.ochieng', NULL, 'doctor',       'General Medicine'),
('Mary Wanjiku',    'm.wanjiku',   NULL, 'receptionist', 'Front Desk'),
('Sam Oduor',       's.oduor',     NULL, 'lab',          'Laboratory'),
('Grace Akinyi',    'g.akinyi',    NULL, 'pharmacy',   'Pharmacy'),
('Nurse Faith Njeri','f.njeri',    NULL, 'nurse',        'Nursing');