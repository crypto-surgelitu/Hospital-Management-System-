const { pool } = require('../config/db');

async function getNurseTasks(req, res) {
  try {
    const { status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT t.*, p.full_name as patient_name, q.queue_number,
             d.full_name as assigned_by_name
      FROM nurse_tasks t
      JOIN patients p ON t.patient_id = p.patient_id
      LEFT JOIN patient_queue q ON t.queue_id = q.queue_id
      LEFT JOIN users d ON t.assigned_by = d.user_id
      WHERE 1=1
    `;
    const params = [];

    if (userRole !== 'admin') {
      query += ' AND (t.assigned_nurse = ? OR (t.assigned_nurse IS NULL AND t.status = \'pending\'))';
      params.push(userId);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.priority DESC, t.created_at ASC';

    const [tasks] = await pool.query(query, params);

    res.json({ success: true, tasks, count: tasks.length });
  } catch (error) {
    console.error('getNurseTasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
}

async function getNurseTaskById(req, res) {
  try {
    const { id } = req.params;

    const [[task]] = await pool.query(
      `SELECT t.*, p.full_name as patient_name, p.phone, p.gender,
              q.queue_number, d.full_name as assigned_by_name
       FROM nurse_tasks t
       JOIN patients p ON t.patient_id = p.patient_id
       LEFT JOIN patient_queue q ON t.queue_id = q.queue_id
       LEFT JOIN users d ON t.assigned_by = d.user_id
       WHERE t.task_id = ?`,
      [id]
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('getNurseTaskById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch task' });
  }
}

async function startTask(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [[task]] = await pool.query('SELECT task_id, status FROM nurse_tasks WHERE task_id = ?', [id]);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Task already started or completed' });
    }

    await pool.query(
      'UPDATE nurse_tasks SET status = \'in_progress\', assigned_nurse = ? WHERE task_id = ?',
      [userId, id]
    );

    res.json({ success: true, message: 'Task started' });
  } catch (error) {
    console.error('startTask error:', error);
    res.status(500).json({ success: false, message: 'Failed to start task' });
  }
}

async function completeTask(req, res) {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const [[task]] = await pool.query('SELECT task_id, status FROM nurse_tasks WHERE task_id = ?', [id]);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Task already completed' });
    }

    await pool.query(
      `UPDATE nurse_tasks 
       SET status = 'completed', completed_at = NOW(), assigned_nurse = ?, notes = ? 
       WHERE task_id = ?`,
      [userId, notes || null, id]
    );

    res.json({ success: true, message: 'Task completed' });
  } catch (error) {
    console.error('completeTask error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete task' });
  }
}

module.exports = {
  getNurseTasks,
  getNurseTaskById,
  startTask,
  completeTask
};