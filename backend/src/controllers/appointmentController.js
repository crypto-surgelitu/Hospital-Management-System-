const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

async function getAppointments(req, res) {
  try {
    const { date, status, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (date) {
      whereClause += ' AND DATE(a.appointment_date) = ?';
      params.push(date);
    }

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    if (req.user.role === 'doctor') {
      whereClause += ' AND a.doctor_id = ?';
      params.push(req.user.id);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM appointments a ${whereClause}`,
      params
    );

    const [appointments] = await pool.query(
      `SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name
       FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
        JOIN users u ON a.doctor_id = u.user_id
       ${whereClause}
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      appointments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('getAppointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
}

async function createAppointment(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { patient_id, doctor_id, appointment_date, appointment_time, notes } = req.body;

    const [patients] = await pool.query('SELECT patient_id FROM patients WHERE patient_id = ? AND deleted_at IS NULL', [patient_id]);
    if (patients.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient not found' });
    }

    const [doctors] = await pool.query("SELECT user_id FROM users WHERE user_id = ? AND role = 'doctor' AND is_active = 1", [doctor_id]);
    if (doctors.length === 0) {
      return res.status(400).json({ success: false, message: 'Doctor not found or not available' });
    }

    const appointmentDate = new Date(appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book appointment in the past' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != ?',
      [doctor_id, appointment_date, appointment_time, 'cancelled']
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Doctor already has appointment at this time' });
    }

    const [result] = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [patient_id, doctor_id, appointment_date, appointment_time, notes || null]
    );

    const [newAppointment] = await pool.query(
      `SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name
       FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
        JOIN users u ON a.doctor_id = u.user_id
       WHERE a.appointment_id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, appointment: newAppointment[0] });
  } catch (error) {
    console.error('createAppointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create appointment' });
  }
}

async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [appointments] = await pool.query('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = appointments[0];
    if (req.user.role !== 'admin' && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    await pool.query('UPDATE appointments SET status = ? WHERE appointment_id = ?', [status, id]);

    const [updated] = await pool.query(
      `SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name
       FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
        JOIN users u ON a.doctor_id = u.user_id
       WHERE a.appointment_id = ?`,
      [id]
    );

    res.json({ success: true, appointment: updated[0] });
  } catch (error) {
    console.error('updateAppointmentStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment status' });
  }
}

async function addDoctorNotes(req, res) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const [appointments] = await pool.query('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = appointments[0];
    if (appointment.doctor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can add notes' });
    }

    await pool.query('UPDATE appointments SET notes = ? WHERE appointment_id = ?', [notes, id]);

    const [updated] = await pool.query(
      `SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name
       FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
        JOIN users u ON a.doctor_id = u.user_id
       WHERE a.appointment_id = ?`,
      [id]
    );

    res.json({ success: true, appointment: updated[0] });
  } catch (error) {
    console.error('addDoctorNotes error:', error);
    res.status(500).json({ success: false, message: 'Failed to add notes' });
  }
}

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  addDoctorNotes
};