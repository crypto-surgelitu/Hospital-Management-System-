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

router.get('/', verifyToken, requireRole(['admin', 'receptionist']), getInvoices);

router.get('/services', verifyToken, getServices);

router.post('/auto', verifyToken, requireRole(['admin', 'receptionist']), createBillFromServices);

router.get('/:id', verifyToken, requireRole(['admin', 'receptionist']), getInvoiceById);

router.post('/', verifyToken, requireRole(['admin', 'receptionist']), createInvoice);

router.post('/:id/payment', verifyToken, requireRole(['admin', 'receptionist']), recordPayment);

module.exports = router;
