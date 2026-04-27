const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/adminController');
const { getUsers, getDoctors, createUser, updateUser, toggleUserStatus, generateRandomUsers, resetUserPassword } = require('../controllers/userController');

// Dashboard stats — accessible to all authenticated users
router.get('/stats', verifyToken, getDashboardStats);

// Doctors list — accessible to anyone authenticated (for appointment booking)
router.get('/doctors', verifyToken, getDoctors);

// User management — admin only
router.get('/users', verifyToken, requireRole(['admin']), getUsers);
router.post('/users', verifyToken, requireRole(['admin']), createUser);
router.put('/users/:id', verifyToken, requireRole(['admin']), updateUser);
router.patch('/users/:id/toggle', verifyToken, requireRole(['admin']), toggleUserStatus);
router.patch('/users/:id/reset-password', verifyToken, requireRole(['admin']), resetUserPassword);
router.post('/users/generate', verifyToken, requireRole(['admin']), generateRandomUsers);

module.exports = router;
