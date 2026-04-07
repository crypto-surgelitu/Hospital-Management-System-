const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment
} = require('../controllers/billingController');

router.get('/', verifyToken, requireRole(['admin', 'receptionist']), getInvoices);

router.get('/:id', verifyToken, requireRole(['admin', 'receptionist']), getInvoiceById);

router.post('/', verifyToken, requireRole(['admin', 'receptionist']), createInvoice);

router.post('/:id/payment', verifyToken, requireRole(['admin', 'receptionist']), recordPayment);

module.exports = router;