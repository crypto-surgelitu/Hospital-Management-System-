const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/adminController');
const { getUsers, getDoctors, createUser, updateUser, toggleUserStatus, generateRandomUsers } = require('../controllers/userController');

// Dashboard stats — accessible to admin, receptionist, doctor
router.get('/stats', verifyToken, requireRole(['admin', 'receptionist', 'doctor']), getDashboardStats);

// Doctors list — accessible to anyone authenticated (for appointment booking)
router.get('/doctors', verifyToken, getDoctors);

// User management — admin only
router.get('/users', verifyToken, requireRole(['admin']), getUsers);
router.post('/users', verifyToken, requireRole(['admin']), createUser);
router.put('/users/:id', verifyToken, requireRole(['admin']), updateUser);
router.patch('/users/:id/toggle', verifyToken, requireRole(['admin']), toggleUserStatus);
router.post('/users/generate', verifyToken, requireRole(['admin']), generateRandomUsers);

module.exports = router;
