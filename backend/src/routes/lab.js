const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getLabRequests,
  createLabRequest,
  updateSpecimenStatus,
  enterLabResults,
  getLabTestTypes
} = require('../controllers/labController');

router.get('/', verifyToken, requireRole(['admin', 'doctor', 'lab']), getLabRequests);

router.get('/types', verifyToken, requireRole(['admin', 'doctor', 'lab']), getLabTestTypes);

router.post('/', verifyToken, requireRole(['admin', 'doctor']), createLabRequest);

router.patch('/:id/specimen', verifyToken, requireRole(['admin', 'lab']), updateSpecimenStatus);

router.patch('/:id/results', verifyToken, requireRole(['lab']), enterLabResults);

module.exports = router;