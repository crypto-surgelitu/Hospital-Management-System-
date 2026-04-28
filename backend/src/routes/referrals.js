const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  createLabReferral,
  createPharmacyReferral,
  createNurseTask,
  getPatientReferrals,
  completeReferral,
  getPendingReferrals
} = require('../controllers/referralController');

const labValidation = [
  body('queue_id').isInt().withMessage('Queue ID is required'),
  body('patient_id').isInt().withMessage('Patient ID is required'),
  body('test_type').notEmpty().withMessage('Test type is required')
];

const pharmacyValidation = [
  body('queue_id').isInt().withMessage('Queue ID is required'),
  body('patient_id').isInt().withMessage('Patient ID is required')
];

const nurseValidation = [
  body('queue_id').isInt().withMessage('Queue ID is required'),
  body('patient_id').isInt().withMessage('Patient ID is required'),
  body('task_description').notEmpty().withMessage('Task description is required')
];

router.get('/', verifyToken, requireRole(['admin', 'lab', 'pharmacy']), getPendingReferrals);

router.get('/patient/:patient_id', verifyToken, requireRole(['admin', 'doctor', 'lab', 'pharmacy', 'nurse']), getPatientReferrals);

router.post('/lab', verifyToken, requireRole(['admin', 'doctor']), labValidation, createLabReferral);

router.post('/pharmacy', verifyToken, requireRole(['admin', 'doctor']), pharmacyValidation, createPharmacyReferral);

router.post('/nurse', verifyToken, requireRole(['admin', 'doctor']), nurseValidation, createNurseTask);

router.patch('/:id/complete', verifyToken, requireRole(['admin', 'lab', 'pharmacy']), completeReferral);

module.exports = router;