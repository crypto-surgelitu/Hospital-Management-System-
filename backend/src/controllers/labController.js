const { pool } = require('../config/db');

async function getLabRequests(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
      whereClause += ' AND lr.status = ?';
      params.push(status);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM lab_requests lr WHERE ${whereClause}`,
      params
    );

    const [requests] = await pool.query(
      `SELECT lr.*, p.full_name as patient_name, u.full_name as requested_by_name
       FROM lab_requests lr
JOIN patients p ON lr.patient_id = p.patient_id
        JOIN users u ON lr.requested_by = u.user_id
       WHERE ${whereClause}
       ORDER BY 
         CASE lr.priority 
           WHEN 'stat' THEN 1 
           WHEN 'urgent' THEN 2 
           ELSE 3 
         END,
         lr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('getLabRequests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lab requests' });
  }
}

async function createLabRequest(req, res) {
  try {
    const { patient_id, test_type, priority, notes } = req.body;
    const requested_by = req.user.id;

    if (!patient_id || !test_type) {
      return res.status(400).json({ success: false, message: 'Patient ID and test type are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO lab_requests (patient_id, requested_by, test_type, priority, notes, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [patient_id, requested_by, test_type, priority || 'routine', notes || null]
    );

    const [newRequest] = await pool.query(
      `SELECT lr.*, p.full_name as patient_name, u.full_name as requested_by_name
       FROM lab_requests lr
JOIN patients p ON lr.patient_id = p.patient_id
        JOIN users u ON lr.requested_by = u.user_id
       WHERE lr.lab_request_id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, request: newRequest[0] });
  } catch (error) {
    console.error('createLabRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to create lab request' });
  }
}

async function updateSpecimenStatus(req, res) {
  try {
    const { id } = req.params;
    const { specimen_collected } = req.body;

    const specimen_collected_at = specimen_collected ? new Date() : null;

    await pool.query(
      `UPDATE lab_requests 
       SET specimen_collected = ?, specimen_collected_at = ?, status = CASE WHEN ? = 1 THEN 'in-progress' ELSE status END
       WHERE lab_request_id = ?`,
      [specimen_collected ? 1 : 0, specimen_collected_at, specimen_collected ? 1 : 0, id]
    );

    const [updated] = await pool.query(
      `SELECT lr.*, p.full_name as patient_name, u.full_name as requested_by_name
       FROM lab_requests lr
JOIN patients p ON lr.patient_id = p.patient_id
        JOIN users u ON lr.requested_by = u.user_id
       WHERE lr.lab_request_id = ?`,
      [id]
    );

    res.json({ success: true, request: updated[0] });
  } catch (error) {
    console.error('updateSpecimenStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update specimen status' });
  }
}

async function enterLabResults(req, res) {
  try {
    const { id } = req.params;
    const { results } = req.body;

    if (!results) {
      return res.status(400).json({ success: false, message: 'Results are required' });
    }

    await pool.query(
      `UPDATE lab_requests 
       SET results = ?, status = 'completed', completed_at = NOW()
       WHERE lab_request_id = ?`,
      [results, id]
    );

    const [updated] = await pool.query(
      `SELECT lr.*, p.full_name as patient_name, u.full_name as requested_by_name
       FROM lab_requests lr
       JOIN patients p ON lr.patient_id = p.patient_id
       JOIN users u ON lr.requested_by = u.user_id
       WHERE lr.lab_request_id = ?`,
      [id]
    );

    res.json({ success: true, request: updated[0] });
  } catch (error) {
    console.error('enterLabResults error:', error);
    res.status(500).json({ success: false, message: 'Failed to enter lab results' });
  }
}

async function getLabTestTypes(req, res) {
  try {
    const [types] = await pool.query(
      'SELECT test_type_id, test_name, category FROM lab_test_types WHERE is_active = 1 ORDER BY category, test_name'
    );

    res.json({ success: true, types });
  } catch (error) {
    console.error('getLabTestTypes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch test types' });
  }
}

module.exports = {
  getLabRequests,
  createLabRequest,
  updateSpecimenStatus,
  enterLabResults,
  getLabTestTypes
};