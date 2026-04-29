const { pool } = require('../config/db');

async function validateReferralQueue(queueId, patientId, user) {
  const [[queueEntry]] = await pool.query(
    'SELECT queue_id, patient_id, doctor_id, status FROM patient_queue WHERE queue_id = ?',
    [queueId]
  );

  if (!queueEntry) {
    return { status: 404, message: 'Queue entry not found' };
  }

  if (Number(queueEntry.patient_id) !== Number(patientId)) {
    return { status: 400, message: 'Patient does not match this queue entry' };
  }

  if (queueEntry.status !== 'in_progress') {
    return { status: 409, message: 'Consultation must be in progress before creating referrals' };
  }

  if (user.role === 'doctor' && queueEntry.doctor_id !== user.id) {
    return { status: 403, message: 'This patient is assigned to another doctor' };
  }

  return null;
}

async function createLabReferral(req, res) {
  try {
    const { queue_id, patient_id, test_type, priority, notes } = req.body;
    const doctor_id = req.user.id;
    const labPriority = ['routine', 'urgent', 'stat'].includes(priority) ? priority : 'routine';

    if (!queue_id || !patient_id || !test_type) {
      return res.status(400).json({ success: false, message: 'Queue ID, patient ID and test type are required' });
    }

    const queueError = await validateReferralQueue(queue_id, patient_id, req.user);
    if (queueError) {
      return res.status(queueError.status).json({ success: false, message: queueError.message });
    }

    const connection = await pool.getConnection();
    let referralId;
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO doctor_referrals (queue_id, patient_id, doctor_id, referral_type, item_description)
         VALUES (?, ?, ?, 'lab', ?)`,
        [queue_id, patient_id, doctor_id, test_type]
      );
      referralId = result.insertId;

      await connection.query(
        `INSERT INTO lab_requests (patient_id, requested_by, test_type, priority, notes, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
        [patient_id, doctor_id, test_type, labPriority, notes || null]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const [referral] = await pool.query(
      'SELECT * FROM doctor_referrals WHERE referral_id = ?',
      [referralId]
    );

    res.status(201).json({ success: true, referral: referral[0] });
  } catch (error) {
    console.error('createLabReferral error:', error);
    res.status(500).json({ success: false, message: 'Failed to create lab referral' });
  }
}

async function createPharmacyReferral(req, res) {
  try {
    const { queue_id, patient_id } = req.body;
    const doctor_id = req.user.id;
    const requirements = String(
      req.body.medication_requirements || req.body.requirements || req.body.drug_name || ''
    ).trim();

    if (!queue_id || !patient_id || !requirements) {
      return res.status(400).json({ success: false, message: 'Queue ID, patient ID and medication requirements are required' });
    }

    const queueError = await validateReferralQueue(queue_id, patient_id, req.user);
    if (queueError) {
      return res.status(queueError.status).json({ success: false, message: queueError.message });
    }

    const [result] = await pool.query(
      `INSERT INTO doctor_referrals (queue_id, patient_id, doctor_id, referral_type, item_description)
       VALUES (?, ?, ?, 'pharmacy', ?)`,
      [queue_id, patient_id, doctor_id, requirements]
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

    const queueError = await validateReferralQueue(queue_id, patient_id, req.user);
    if (queueError) {
      return res.status(queueError.status).json({ success: false, message: queueError.message });
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

    const [[referral]] = await pool.query(
      'SELECT * FROM doctor_referrals WHERE referral_id = ?',
      [id]
    );

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    if (referral.status !== 'pending') {
      return res.status(409).json({ success: false, message: 'Referral has already been completed or cancelled' });
    }

    if (req.user.role === 'lab' && referral.referral_type !== 'lab') {
      return res.status(403).json({ success: false, message: 'Lab users can only complete lab referrals' });
    }

    if (req.user.role === 'pharmacy' && referral.referral_type !== 'pharmacy') {
      return res.status(403).json({ success: false, message: 'Pharmacy users can only complete pharmacy referrals' });
    }

    if (referral.referral_type === 'pharmacy') {
      const prescribedDrugId = Number(req.body.drug_id || req.body.item_id);
      const quantity = Number(req.body.quantity || 1);
      const dosageInstructions = String(req.body.dosage_instructions || '').trim() || null;

      if (!Number.isInteger(prescribedDrugId) || prescribedDrugId <= 0 || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Pharmacist must select a valid medication and quantity' });
      }

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        const [[drug]] = await connection.query(
          'SELECT drug_id, drug_name, quantity_in_stock, unit_price FROM pharmacy_inventory WHERE drug_id = ? AND is_active = 1 FOR UPDATE',
          [prescribedDrugId]
        );

        if (!drug) {
          await connection.rollback();
          return res.status(404).json({ success: false, message: 'Medication not found in inventory' });
        }

        if (drug.quantity_in_stock < quantity) {
          await connection.rollback();
          return res.status(400).json({ success: false, message: 'Insufficient stock to complete prescription' });
        }

        const totalCost = (Number(drug.unit_price) || 0) * quantity;

        await connection.query(
          'UPDATE pharmacy_inventory SET quantity_in_stock = quantity_in_stock - ? WHERE drug_id = ?',
          [quantity, prescribedDrugId]
        );

        const [dispenseResult] = await connection.query(
          `INSERT INTO dispensing (patient_id, pharmacist_id, created_at)
           VALUES (?, ?, NOW())`,
          [referral.patient_id, req.user.id]
        );

        await connection.query(
          `INSERT INTO dispensing_items (dispense_id, drug_id, quantity, dosage_instructions)
           VALUES (?, ?, ?, ?)`,
          [dispenseResult.insertId, prescribedDrugId, quantity, dosageInstructions]
        );

        await connection.query(
          `INSERT INTO stock_log (drug_id, quantity_change, reason, performed_by, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [prescribedDrugId, -quantity, `Dispensed referral ${referral.referral_id}`, req.user.id]
        );

        await connection.query(
          `UPDATE doctor_referrals
           SET item_id = ?, item_description = ?, quantity = ?, dosage_instructions = ?, status = 'completed', completed_at = NOW()
           WHERE referral_id = ?`,
          [prescribedDrugId, drug.drug_name, quantity, dosageInstructions, id]
        );

        if (totalCost > 0) {
          const [billResult] = await connection.query(
            `INSERT INTO bills (patient_id, total_amount, payment_status, bill_date, created_by, created_at)
             VALUES (?, ?, 'Unpaid', CURDATE(), ?, NOW())`,
            [referral.patient_id, totalCost, req.user.id]
          );

          await connection.query(
            `INSERT INTO bill_items (bill_id, description, quantity, unit_price, subtotal)
             VALUES (?, ?, ?, ?, ?)`,
            [billResult.insertId, drug.drug_name, quantity, drug.unit_price, totalCost]
          );
        }

        await connection.commit();
        return res.json({ success: true, message: 'Referral completed' });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

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
    let { type } = req.query;
    if (req.user.role === 'lab') {
      type = 'lab';
    } else if (req.user.role === 'pharmacy') {
      type = 'pharmacy';
    }

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
