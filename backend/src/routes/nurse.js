const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getNurseTasks,
  getNurseTaskById,
  startTask,
  completeTask
} = require('../controllers/nurseController');

router.get('/', verifyToken, requireRole(['admin', 'nurse']), getNurseTasks);

router.get('/:id', verifyToken, requireRole(['admin', 'nurse']), getNurseTaskById);

router.patch('/:id/start', verifyToken, requireRole(['admin', 'nurse']), startTask);

router.patch('/:id/complete', verifyToken, requireRole(['admin', 'nurse']), completeTask);

module.exports = router;