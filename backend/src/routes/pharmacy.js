const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getInventory,
  addDrug,
  updateStock,
  dispenseMedication
} = require('../controllers/pharmacyController');

router.get('/drugs', verifyToken, requireRole(['admin', 'pharmacist']), getInventory);

router.post('/drugs', verifyToken, requireRole(['admin', 'pharmacist']), addDrug);

router.patch('/drugs/:id/stock', verifyToken, requireRole(['admin', 'pharmacist']), updateStock);

router.post('/dispense', verifyToken, requireRole(['pharmacist']), dispenseMedication);

module.exports = router;