const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
  getServices,
  createBillFromServices
} = require('../controllers/billingController');

router.get('/', verifyToken, requireRole(['admin', 'doctor', 'receptionist']), getInvoices);

router.get('/services', verifyToken, getServices);

router.post('/auto', verifyToken, requireRole(['admin', 'doctor', 'receptionist']), createBillFromServices);

router.get('/:id', verifyToken, requireRole(['admin', 'doctor', 'receptionist']), getInvoiceById);

router.post('/', verifyToken, requireRole(['admin', 'doctor', 'receptionist']), createInvoice);

router.post('/:id/payment', verifyToken, requireRole(['admin', 'doctor', 'receptionist']), recordPayment);

module.exports = router;