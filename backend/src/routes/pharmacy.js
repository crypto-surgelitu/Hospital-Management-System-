const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getInventory,
  addDrug,
  updateStock,
  dispenseMedication
} = require('../controllers/pharmacyController');

router.get('/drugs', verifyToken, getInventory);

router.post('/drugs', verifyToken, requireRole(['admin', 'pharmacy']), addDrug);

router.patch('/drugs/:id/stock', verifyToken, requireRole(['admin', 'pharmacy']), updateStock);

router.post('/dispense', verifyToken, requireRole(['admin', 'pharmacy']), dispenseMedication);

module.exports = router;