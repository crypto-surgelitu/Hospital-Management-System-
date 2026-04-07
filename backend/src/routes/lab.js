const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getLabRequests,
  createLabRequest,
  updateSpecimenStatus,
  enterLabResults
} = require('../controllers/labController');

router.get('/', verifyToken, requireRole(['admin', 'doctor', 'nurse', 'lab']), getLabRequests);

router.post('/', verifyToken, requireRole(['admin', 'doctor', 'nurse']), createLabRequest);

router.patch('/:id/specimen', verifyToken, requireRole(['admin', 'lab']), updateSpecimenStatus);

router.patch('/:id/results', verifyToken, requireRole(['lab']), enterLabResults);

module.exports = router;