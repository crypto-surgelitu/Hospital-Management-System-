const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getInventory,
  addDrug,
  updateStock,
  dispenseMedication,
  getDrugsForReferral
} = require('../controllers/pharmacyController');

router.get('/', verifyToken, requireRole(['admin', 'pharmacy']), getInventory);

router.get('/drugs', verifyToken, getDrugsForReferral);

router.post('/drugs', verifyToken, requireRole(['admin', 'pharmacy']), addDrug);

router.patch('/drugs/:id/stock', verifyToken, requireRole(['admin', 'pharmacy']), updateStock);

router.post('/dispense', verifyToken, requireRole(['admin', 'pharmacy']), dispenseMedication);

module.exports = router;