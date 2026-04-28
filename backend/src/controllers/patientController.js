const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

async function getAllPatients(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [countResult] = await pool.query('SELECT COUNT(*) as cnt FROM patients WHERE deleted_at IS NULL');
    const total = countResult[0]?.cnt ?? 0;
    const [patients] = await pool.query(
      `SELECT patient_id, full_name, date_of_birth, gender, phone, email, national_id, created_at 
       FROM patients WHERE deleted_at IS NULL 
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      success: true,
      patients,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('getAllPatients error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function searchPatients(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, patients: [] });
    }

    const [patients] = await pool.query(
      `SELECT id, full_name, dob, gender, phone, national_id, created_at 
       FROM patients 
       WHERE deleted_at IS NULL 
       AND (full_name LIKE ? OR national_id LIKE ? OR phone LIKE ?)
       ORDER BY full_name ASC LIMIT 50`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json({ success: true, patients });
  } catch (error) {
    console.error('searchPatients error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
}

async function getPatientById(req, res) {
  try {
    const { id } = req.params;

    const [patients] = await pool.query(
      'SELECT * FROM patients WHERE patient_id = ? AND deleted_at IS NULL',
      [id]
    );

    if (patients.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const [recentAppointments] = await pool.query(
      `SELECT * FROM appointments WHERE patient_id = ? ORDER BY created_at DESC LIMIT 5`,
      [id]
    );

    res.json({
      success: true,
      patient: { ...patients[0], recentAppointments }
    });
  } catch (error) {
    console.error('getPatientById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patient' });
  }
}

async function createPatient(req, res) {
  try {
    const { full_name, phone, national_id } = req.body;
    
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone is required' });
    }

    // Validate phone is numeric
    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 7) {
      return res.status(400).json({ success: false, message: 'Phone number must be at least 7 digits' });
    }

    // Validate national_id if provided
    if (national_id && national_id.trim()) {
      const nationalIdClean = national_id.replace(/\D/g, '');
      if (nationalIdClean.length < 4) {
        return res.status(400).json({ success: false, message: 'National ID must be at least 4 digits' });
      }
    }

    const { date_of_birth, gender, address, email } = req.body;
    
    if (national_id && national_id.trim()) {
      const [existing] = await pool.query(
        'SELECT patient_id FROM patients WHERE national_id = ? AND deleted_at IS NULL',
        [national_id]
      );
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Patient already registered with this National ID' });
      }
    }
    
    const birthDate = date_of_birth && date_of_birth.trim() ? date_of_birth : null;
    
    const [result] = await pool.query(
      `INSERT INTO patients (full_name, date_of_birth, gender, phone, national_id, address, email, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [full_name, birthDate, gender || null, phone, national_id || null, address || null, email || null]
    );

    const [newPatient] = await pool.query('SELECT * FROM patients WHERE patient_id = ?', [result.insertId]);

    res.status(201).json({ success: true, patient: newPatient[0] });
  } catch (error) {
    console.error('createPatient error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function updatePatient(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { full_name, phone, address, email } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM patients WHERE patient_id = ? AND deleted_at IS NULL',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await pool.query(
      `UPDATE patients SET full_name = ?, phone = ?, address = ?, email = ? WHERE patient_id = ?`,
      [full_name, phone, address || null, email || null, id]
    );

    const [updated] = await pool.query('SELECT * FROM patients WHERE patient_id = ?', [id]);

    res.json({ success: true, patient: updated[0] });
  } catch (error) {
    console.error('updatePatient error:', error);
    res.status(500).json({ success: false, message: 'Failed to update patient' });
  }
}

async function deletePatient(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM patients WHERE patient_id = ? AND deleted_at IS NULL',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await pool.query('UPDATE patients SET deleted_at = NOW() WHERE patient_id = ?', [id]);

    res.json({ success: true, message: 'Patient archived' });
  } catch (error) {
    console.error('deletePatient error:', error);
    res.status(500).json({ success: false, message: 'Failed to archive patient' });
  }
}

async function deletePatient(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT patient_id FROM patients WHERE patient_id = ? AND deleted_at IS NULL',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await pool.query('UPDATE patients SET deleted_at = NOW() WHERE patient_id = ?', [id]);

    res.json({ success: true, message: 'Patient archived' });
  } catch (error) {
    console.error('deletePatient error:', error);
    res.status(500).json({ success: false, message: 'Failed to archive patient' });
  }
}

async function getPatientHistory(req, res) {
  try {
    const { id } = req.params;

    const [[patient]] = await pool.query(
      'SELECT * FROM patients WHERE patient_id = ? AND deleted_at IS NULL',
      [id]
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const [appointments] = await pool.query(
      `SELECT a.*, u.full_name as doctor_name
       FROM appointments a
       LEFT JOIN users u ON a.doctor_id = u.user_id
       WHERE a.patient_id = ?
       ORDER BY a.created_at DESC
       LIMIT 20`,
      [id]
    );

    const [labResults] = await pool.query(
      `SELECT lr.*, u.full_name as requested_by_name
       FROM lab_requests lr
       LEFT JOIN users u ON lr.requested_by = u.user_id
       WHERE lr.patient_id = ?
       ORDER BY lr.created_at DESC
       LIMIT 10`,
      [id]
    );

    const [prescriptions] = await pool.query(
      `SELECT dr.*, u.full_name as doctor_name
       FROM doctor_referrals dr
       LEFT JOIN users u ON dr.doctor_id = u.user_id
       WHERE dr.patient_id = ? AND dr.referral_type = 'pharmacy'
       ORDER BY dr.created_at DESC
       LIMIT 10`,
      [id]
    );

    const [bills] = await pool.query(
      'SELECT * FROM bills WHERE patient_id = ? ORDER BY bill_date DESC LIMIT 10',
      [id]
    );

    const [queueVisits] = await pool.query(
      `SELECT q.*, u.full_name as doctor_name
       FROM patient_queue q
       LEFT JOIN users u ON q.doctor_id = u.user_id
       WHERE q.patient_id = ?
       ORDER BY q.created_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      patient,
      history: {
        appointments,
        labResults,
        prescriptions,
        bills,
        queueVisits
      }
    });
  } catch (error) {
    console.error('getPatientHistory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patient history' });
  }
}

module.exports = {
  getAllPatients,
  searchPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientHistory
};