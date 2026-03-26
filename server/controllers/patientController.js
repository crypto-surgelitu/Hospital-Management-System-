const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

async function getAllPatients(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM patients WHERE deleted_at IS NULL');
    const [patients] = await pool.query(
      `SELECT id, full_name, dob, gender, phone, national_id, created_at 
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
    res.status(500).json({ success: false, message: 'Failed to fetch patients' });
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
      'SELECT * FROM patients WHERE id = ? AND deleted_at IS NULL',
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { full_name, dob, gender, phone, national_id, address, emergency_contact } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM patients WHERE national_id = ? AND deleted_at IS NULL',
      [national_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Patient already registered' });
    }

    const [result] = await pool.query(
      `INSERT INTO patients (full_name, dob, gender, phone, national_id, address, emergency_contact, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [full_name, dob, gender, phone, national_id, address || null, emergency_contact || null]
    );

    const [newPatient] = await pool.query('SELECT * FROM patients WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, patient: newPatient[0] });
  } catch (error) {
    console.error('createPatient error:', error);
    res.status(500).json({ success: false, message: 'Failed to create patient' });
  }
}

async function updatePatient(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { full_name, phone, address, emergency_contact } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await pool.query(
      `UPDATE patients SET full_name = ?, phone = ?, address = ?, emergency_contact = ? WHERE id = ?`,
      [full_name, phone, address || null, emergency_contact || null, id]
    );

    const [updated] = await pool.query('SELECT * FROM patients WHERE id = ?', [id]);

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
      'SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await pool.query('UPDATE patients SET deleted_at = NOW() WHERE id = ?', [id]);

    res.json({ success: true, message: 'Patient archived' });
  } catch (error) {
    console.error('deletePatient error:', error);
    res.status(500).json({ success: false, message: 'Failed to archive patient' });
  }
}

module.exports = {
  getAllPatients,
  searchPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};