const { pool } = require('../config/db');

async function getQueue(req, res) {
  try {
    const { doctor_id, status } = req.query;
    let query = `
      SELECT q.*, p.full_name as patient_name, p.phone, p.gender,
             d.full_name as doctor_name
      FROM patient_queue q
      JOIN patients p ON q.patient_id = p.patient_id
      LEFT JOIN users d ON q.doctor_id = d.user_id
      WHERE p.deleted_at IS NULL
    `;
    const params = [];

    if (req.user.role === 'doctor') {
      query += ' AND (q.doctor_id = ? OR q.doctor_id IS NULL)';
      params.push(req.user.id);
    } else if (doctor_id) {
      query += ' AND q.doctor_id = ?';
      params.push(doctor_id);
    }

    if (status) {
      query += ' AND q.status = ?';
      params.push(status);
    } else {
      query += ' AND q.status IN (\'waiting\', \'in_progress\')';
    }

    query += ' ORDER BY q.priority DESC, q.queue_number ASC, q.created_at ASC';

    const [queue] = await pool.query(query, params);

    res.json({
      success: true,
      queue,
      count: queue.length
    });
  } catch (error) {
    console.error('getQueue error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch queue' });
  }
}

async function addToQueue(req, res) {
  try {
    const { patient_id, doctor_id, priority, chief_complaint } = req.body;
    const hasDoctorId = doctor_id !== undefined && doctor_id !== null && String(doctor_id).trim() !== '';
    const assignedDoctorId = hasDoctorId ? Number(doctor_id) : null;

    if (!patient_id) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    if (hasDoctorId && (!Number.isInteger(assignedDoctorId) || assignedDoctorId <= 0)) {
      return res.status(400).json({ success: false, message: 'Assigned doctor ID is invalid' });
    }

    const [[patient]] = await pool.query(
      'SELECT patient_id FROM patients WHERE patient_id = ? AND deleted_at IS NULL',
      [patient_id]
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (assignedDoctorId) {
      const [[doctor]] = await pool.query(
        "SELECT user_id FROM users WHERE user_id = ? AND role = 'doctor' AND is_active = 1",
        [assignedDoctorId]
      );

      if (!doctor) {
        return res.status(400).json({ success: false, message: 'Assigned doctor was not found' });
      }
    }

    const [[existing]] = await pool.query(
      `SELECT queue_id FROM patient_queue 
       WHERE patient_id = ? AND status IN ('waiting', 'in_progress')`,
      [patient_id]
    );

    if (existing) {
      return res.status(409).json({ success: false, message: 'Patient already in queue' });
    }

    const [[queueNum]] = await pool.query(
      `SELECT COALESCE(MAX(queue_number), 0) + 1 as next_num FROM patient_queue 
       WHERE DATE(created_at) = CURDATE()`
    );

    const [result] = await pool.query(
      `INSERT INTO patient_queue (patient_id, doctor_id, priority, chief_complaint, queue_number, status)
       VALUES (?, ?, ?, ?, ?, 'waiting')`,
      [patient_id, assignedDoctorId, priority || 'normal', chief_complaint || null, queueNum.next_num]
    );

    const [newEntry] = await pool.query(
      `SELECT q.*, p.full_name as patient_name 
       FROM patient_queue q
       JOIN patients p ON q.patient_id = p.patient_id
       WHERE q.queue_id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, queue: newEntry[0] });
  } catch (error) {
    console.error('addToQueue error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to queue' });
  }
}

async function getQueueById(req, res) {
  try {
    const { id } = req.params;

    const [[entry]] = await pool.query(
      `SELECT q.*, p.full_name as patient_name, p.phone, p.gender, p.date_of_birth,
              d.full_name as doctor_name
       FROM patient_queue q
       JOIN patients p ON q.patient_id = p.patient_id
       LEFT JOIN users d ON q.doctor_id = d.user_id
       WHERE q.queue_id = ?`,
      [id]
    );

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Queue entry not found' });
    }

    if (req.user.role === 'doctor' && entry.doctor_id && entry.doctor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'This patient is assigned to another doctor' });
    }

    res.json({ success: true, queue: entry });
  } catch (error) {
    console.error('getQueueById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch queue entry' });
  }
}

async function assignDoctor(req, res) {
  try {
    const { id } = req.params;
    const { doctor_id } = req.body;

    const [[existing]] = await pool.query(
      'SELECT queue_id FROM patient_queue WHERE queue_id = ?',
      [id]
    );

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Queue entry not found' });
    }

    await pool.query(
      'UPDATE patient_queue SET doctor_id = ?, updated_at = NOW() WHERE queue_id = ?',
      [doctor_id, id]
    );

    res.json({ success: true, message: 'Doctor assigned' });
  } catch (error) {
    console.error('assignDoctor error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign doctor' });
  }
}

async function callPatient(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE patient_queue SET called_at = NOW(), status = ?, updated_at = NOW() WHERE queue_id = ?',
      ['waiting', id]
    );

    res.json({ success: true, message: 'Patient called' });
  } catch (error) {
    console.error('callPatient error:', error);
    res.status(500).json({ success: false, message: 'Failed to call patient' });
  }
}

async function startConsultation(req, res) {
  try {
    const { id } = req.params;

    let result;
    if (req.user.role === 'doctor') {
      [result] = await pool.query(
        `UPDATE patient_queue 
         SET status = 'in_progress',
             doctor_id = ?,
             started_at = NOW(),
             updated_at = NOW()
         WHERE queue_id = ?
           AND status = 'waiting'
           AND (doctor_id IS NULL OR doctor_id = ?)`,
        [req.user.id, id, req.user.id]
      );
    } else {
      [result] = await pool.query(
        `UPDATE patient_queue 
         SET status = 'in_progress', started_at = NOW(), updated_at = NOW() 
         WHERE queue_id = ? AND status = 'waiting'`,
        [id]
      );
    }

    if (result.affectedRows === 0) {
      return res.status(409).json({ success: false, message: 'Patient is not available for this doctor' });
    }

    res.json({ success: true, message: 'Consultation started' });
  } catch (error) {
    console.error('startConsultation error:', error);
    res.status(500).json({ success: false, message: 'Failed to start consultation' });
  }
}

async function completeConsultation(req, res) {
  try {
    const { id } = req.params;
    const { notes, referral_type, referral_data, consultation_type } = req.body;

    const [[queueEntry]] = await pool.query(
      'SELECT queue_id, patient_id, doctor_id, status FROM patient_queue WHERE queue_id = ?',
      [id]
    );

    if (!queueEntry) {
      return res.status(404).json({ success: false, message: 'Queue entry not found' });
    }

    if (req.user.role === 'doctor' && queueEntry.doctor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'This patient is assigned to another doctor' });
    }

    if (queueEntry.status !== 'in_progress') {
      return res.status(409).json({ success: false, message: 'Consultation must be started before it can be completed' });
    }

    if (referral_type === 'lab' && !referral_data?.test_type) {
      return res.status(400).json({ success: false, message: 'Lab test type is required' });
    }

    if (referral_type === 'pharmacy' && !String(referral_data?.medication_requirements || '').trim()) {
      return res.status(400).json({ success: false, message: 'Medication requirements are required' });
    }

    if (referral_type === 'nurse' && !referral_data?.task_description) {
      return res.status(400).json({ success: false, message: 'Nurse task description is required' });
    }

    await pool.query(
      `UPDATE patient_queue 
       SET status = 'completed', completed_at = NOW(), notes = ?, updated_at = NOW() 
       WHERE queue_id = ?`,
      [notes || null, id]
    );

    // Generate consultation fee billing
    const consultationType = consultation_type || 'Follow-up';
    const [[service]] = await pool.query(
      'SELECT service_id, service_name, unit_price FROM service_prices WHERE service_type = ? AND service_name LIKE ? AND is_active = 1 LIMIT 1',
      ['Consultation', `%${consultationType}%`]
    );

    if (service && service.unit_price > 0) {
      const patient_id = queueEntry.patient_id;
      const doctor_id = req.user.id;
      
      // Check for existing unpaid bill today
      const [[existingBill]] = await pool.query(
        `SELECT bill_id FROM bills WHERE patient_id = ? AND payment_status = 'Unpaid' AND bill_date = CURDATE() ORDER BY bill_id DESC LIMIT 1`,
        [patient_id]
      );

      let bill_id;
      if (existingBill) {
        bill_id = existingBill.bill_id;
        await pool.query(
          'UPDATE bills SET total_amount = total_amount + ? WHERE bill_id = ?',
          [service.unit_price, bill_id]
        );
      } else {
        const [billResult] = await pool.query(
          `INSERT INTO bills (patient_id, total_amount, payment_status, bill_date, generated_by)
           VALUES (?, ?, 'Unpaid', CURDATE(), ?)`,
          [patient_id, service.unit_price, doctor_id]
        );
        bill_id = billResult.insertId;
      }

      await pool.query(
        `INSERT INTO bill_items (bill_id, description, quantity, unit_price, subtotal, category)
         VALUES (?, ?, 1, ?, ?, 'Consultation')`,
        [bill_id, service.service_name, service.unit_price, service.unit_price]
      );
    }

    // Create referral if provided
    if (referral_type && referral_data) {
      const doctor_id = req.user.id;
      const patient_id = queueEntry.patient_id;

      if (referral_type === 'lab') {
        const labPriority = ['routine', 'urgent', 'stat'].includes(referral_data.priority) ? referral_data.priority : 'routine';
        await pool.query(
          `INSERT INTO doctor_referrals (queue_id, patient_id, doctor_id, referral_type, item_description)
           VALUES (?, ?, ?, 'lab', ?)`,
          [id, patient_id, doctor_id, referral_data.test_type]
        );

        await pool.query(
          `INSERT INTO lab_requests (patient_id, requested_by, test_type, priority, notes, status, created_at)
           VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
          [patient_id, doctor_id, referral_data.test_type, labPriority, referral_data.notes || null]
        );

        // Generate lab fee billing
        const [[labService]] = await pool.query(
          'SELECT service_id, service_name, unit_price FROM service_prices WHERE service_type = ? AND service_name LIKE ? AND is_active = 1 LIMIT 1',
          ['Lab', `%${referral_data.test_type}%`]
        );

        if (labService && labService.unit_price > 0) {
          const labFee = Number(labService.unit_price);
          const [[existingLabBill]] = await pool.query(
            `SELECT bill_id FROM bills WHERE patient_id = ? AND payment_status = 'Unpaid' AND bill_date = CURDATE() ORDER BY bill_id DESC LIMIT 1`,
            [patient_id]
          );

          let billId;
          if (existingLabBill) {
            billId = existingLabBill.bill_id;
            await pool.query(
              `UPDATE bills SET total_amount = total_amount + ? WHERE bill_id = ?`,
              [labFee, billId]
            );
          } else {
            const [billResult] = await pool.query(
              `INSERT INTO bills (patient_id, total_amount, payment_status, bill_date, generated_by)
               VALUES (?, ?, 'Unpaid', CURDATE(), ?)`,
              [patient_id, labFee, doctor_id]
            );
            billId = billResult.insertId;
          }

          await pool.query(
            `INSERT INTO bill_items (bill_id, description, quantity, unit_price, subtotal, category)
             VALUES (?, ?, 1, ?, ?, 'Lab')`,
            [billId, labService.service_name, labFee, labFee]
          );
        }
      } else if (referral_type === 'pharmacy') {
        const requirements = String(referral_data.medication_requirements).trim();

        await pool.query(
          `INSERT INTO doctor_referrals (queue_id, patient_id, doctor_id, referral_type, item_description)
           VALUES (?, ?, ?, 'pharmacy', ?)`,
          [id, patient_id, doctor_id, requirements]
        );
      } else if (referral_type === 'nurse') {
        await pool.query(
          `INSERT INTO doctor_referrals (queue_id, patient_id, doctor_id, referral_type, item_description, quantity)
           VALUES (?, ?, ?, 'nurse', ?, ?)`,
          [id, patient_id, doctor_id, referral_data.task_description, referral_data.quantity || 1]
        );
      }
    }

    res.json({ success: true, message: 'Consultation completed' });
  } catch (error) {
    console.error('completeConsultation error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete consultation' });
  }
}

async function removeFromQueue(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE patient_queue SET status = \'cancelled\', updated_at = NOW() WHERE queue_id = ?',
      [id]
    );

    res.json({ success: true, message: 'Removed from queue' });
  } catch (error) {
    console.error('removeFromQueue error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from queue' });
  }
}

module.exports = {
  getQueue,
  addToQueue,
  getQueueById,
  assignDoctor,
  callPatient,
  startConsultation,
  completeConsultation,
  removeFromQueue
};
