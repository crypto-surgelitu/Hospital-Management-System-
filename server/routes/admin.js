const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/adminController');

router.get('/stats', verifyToken, requireRole(['admin', 'receptionist', 'doctor']), getDashboardStats);

module.exports = router;
