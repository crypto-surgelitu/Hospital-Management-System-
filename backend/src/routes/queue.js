const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getQueue,
  addToQueue,
  getQueueById,
  assignDoctor,
  callPatient,
  startConsultation,
  completeConsultation,
  removeFromQueue
} = require('../controllers/queueController');

const addValidation = [
  body('patient_id').isInt().withMessage('Patient ID is required'),
  body('doctor_id').optional().isInt(),
  body('priority').optional().isIn(['normal', 'urgent']),
  body('chief_complaint').optional().trim()
];

router.get('/', verifyToken, requireRole(['admin', 'doctor', 'receptionist']), getQueue);

router.get('/:id', verifyToken, requireRole(['admin', 'doctor', 'receptionist']), getQueueById);

router.post('/', verifyToken, requireRole(['admin', 'receptionist']), addValidation, addToQueue);

router.patch('/:id/assign', verifyToken, requireRole(['admin', 'receptionist']), assignDoctor);

router.patch('/:id/call', verifyToken, requireRole(['admin', 'doctor']), callPatient);

router.patch('/:id/start', verifyToken, requireRole(['admin', 'doctor']), startConsultation);

router.patch('/:id/complete', verifyToken, requireRole(['admin', 'doctor']), completeConsultation);

router.delete('/:id', verifyToken, requireRole(['admin']), removeFromQueue);

module.exports = router;