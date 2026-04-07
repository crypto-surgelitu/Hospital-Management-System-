const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getAllPatients,
  searchPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');

const createValidation = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('dob').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('national_id').trim().notEmpty().withMessage('National ID is required')
];

const updateValidation = [
  param('id').isInt().withMessage('Valid patient ID required'),
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional().trim(),
  body('emergency_contact').optional().trim()
];

router.get('/', verifyToken, requireRole(['admin', 'doctor', 'nurse', 'receptionist']), getAllPatients);

router.get('/search', verifyToken, requireRole(['admin', 'doctor', 'nurse', 'receptionist']), searchPatients);

router.get('/:id', verifyToken, requireRole(['admin', 'doctor', 'nurse']), getPatientById);

router.post('/', verifyToken, requireRole(['admin', 'receptionist']), createValidation, createPatient);

router.put('/:id', verifyToken, requireRole(['admin', 'receptionist']), updateValidation, updatePatient);

router.delete('/:id', verifyToken, requireRole(['admin']), deletePatient);

module.exports = router;
