const { pool } = require('../config/db');

async function createLabReferral(req, res) {
  try {
    const { queue_id, patient_id, test_type, priority, notes } = req.body;
    const doctor_id = req.user.id;

    if (!queue_id || !patient_id || !test_type) {
      return res.status(400).json({ success: false, message: 'Queue ID, patient ID and test type are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO doctor_referrals (queue_id, patient_id, doctor_id, referral_type, item_description, priority)
       VALUES (?, ?, ?, 'lab', ?, ?)`,
      [queue_id, patient_id, doctor_id, test_type, priority || 'normal']
    );

    const [referral] = await pool.query(
      'SELECT * FROM doctor_referrals WHERE referral_id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, referral: referral[0] });
  } catch (error) {
    console.error('createLabReferral error:', error);
    res.status(500).json({ success: false, message: 'Failed to create lab referral' });
  }
}

async function createPharmacyReferral(req, res) {
  try {
    const { queue_id, patient_id, drug_id, drug_name, quantity, dosage_instructions } = req.body;
    const doctor_id = req.user.id;

    if (!queue_id || !patient_id) {
      return res.status(400).json({ success: false, message: 'Queue ID and patient ID are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO doctor_referrals (queue_id, patient_id, doctor_id, referral_type, item_id, item_description, quantity, dosage_instructions)
       VALUES (?, ?, ?, 'pharmacy', ?, ?, ?, ?)`,
      [queue_id, patient_id, doctor_id, drug_id || null, drug_name, quantity || 1, dosage_instructions || null]
    );

    const [referral] = await pool.query(
      'SELECT * FROM doctor_referrals WHERE referral_id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, referral: referral[0] });
  } catch (error) {
    console.error('createPharmacyReferral error:', error);
    res.status(500).json({ success: false, message: 'Failed to create pharmacy referral' });
  }
}

async function createNurseTask(req, res) {
  try {
    const { queue_id, patient_id, task_description, task_type, priority } = req.body;
    const doctor_id = req.user.id;

    if (!queue_id || !patient_id || !task_description) {
      return res.status(400).json({ success: false, message: 'Queue ID, patient ID and task description are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO nurse_tasks (queue_id, patient_id, task_description, task_type, priority, assigned_by, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [queue_id, patient_id, task_description, task_type || 'other', priority || 'normal', doctor_id]
    );

    const [task] = await pool.query(
      'SELECT * FROM nurse_tasks WHERE task_id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, task: task[0] });
  } catch (error) {
    console.error('createNurseTask error:', error);
    res.status(500).json({ success: false, message: 'Failed to create nurse task' });
  }
}

async function getPatientReferrals(req, res) {
  try {
    const { patient_id } = req.params;

    const [referrals] = await pool.query(
      `SELECT r.*, d.full_name as doctor_name
       FROM doctor_referrals r
       JOIN users d ON r.doctor_id = d.user_id
       WHERE r.patient_id = ?
       ORDER BY r.created_at DESC`,
      [patient_id]
    );

    res.json({ success: true, referrals });
  } catch (error) {
    console.error('getPatientReferrals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch referrals' });
  }
}

async function completeReferral(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE doctor_referrals SET status = 'completed', completed_at = NOW() WHERE referral_id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Referral completed' });
  } catch (error) {
    console.error('completeReferral error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete referral' });
  }
}

async function getPendingReferrals(req, res) {
  try {
    const { type } = req.query;
    let query = `
      SELECT r.*, p.full_name as patient_name, d.full_name as doctor_name
      FROM doctor_referrals r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users d ON r.doctor_id = d.user_id
      WHERE r.status = 'pending'
    `;
    const params = [];

    if (type) {
      query += ' AND r.referral_type = ?';
      params.push(type);
    }

    query += ' ORDER BY r.created_at ASC';

    const [referrals] = await pool.query(query, params);

    res.json({ success: true, referrals, count: referrals.length });
  } catch (error) {
    console.error('getPendingReferrals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch referrals' });
  }
}

module.exports = {
  createLabReferral,
  createPharmacyReferral,
  createNurseTask,
  getPatientReferrals,
  completeReferral,
  getPendingReferrals
};