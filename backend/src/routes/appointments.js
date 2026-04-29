const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  addDoctorNotes
} = require('../controllers/appointmentController');

const createValidation = [
  body('patient_id').isInt().withMessage('Valid patient ID required'),
  body('doctor_id').isInt().withMessage('Valid doctor ID required'),
  body('appointment_date').notEmpty().withMessage('Date is required'),
  body('appointment_time').notEmpty().withMessage('Time is required'),
  body('notes').optional().trim()
];

const statusValidation = [
  body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
];

const notesValidation = [
  body('notes').trim().notEmpty().withMessage('Notes cannot be empty')
];

router.get('/', verifyToken, getAppointments);

router.post('/', verifyToken, requireRole(['admin', 'receptionist', 'doctor']), createValidation, createAppointment);

router.patch('/:id/status', verifyToken, requireRole(['admin', 'doctor']), statusValidation, updateAppointmentStatus);

router.patch('/:id/notes', verifyToken, requireRole(['doctor']), notesValidation, addDoctorNotes);

module.exports = router;
