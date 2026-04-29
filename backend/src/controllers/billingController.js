const { pool } = require('../config/db');

async function getInvoices(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, patient_id } = req.query;

    let whereClause = '1=1';
    const params = [];

    const normalizedStatus = status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : null;

    if (normalizedStatus && ['Unpaid', 'Partial', 'Paid'].includes(normalizedStatus)) {
      whereClause += ' AND b.payment_status = ?';
      params.push(normalizedStatus);
    }

    if (patient_id) {
      whereClause += ' AND b.patient_id = ?';
      params.push(patient_id);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM bills b WHERE ${whereClause}`,
      params
    );

    const [invoices] = await pool.query(
      `SELECT b.*, p.full_name as patient_name 
       FROM bills b
       JOIN patients p ON b.patient_id = p.patient_id
       WHERE ${whereClause}
       ORDER BY b.bill_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('getInvoices error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
}

async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;

    const [invoices] = await pool.query(
      `SELECT b.*, p.full_name as patient_name 
       FROM bills b
       JOIN patients p ON b.patient_id = p.patient_id
       WHERE b.bill_id = ?`,
      [id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const [items] = await pool.query(
      'SELECT * FROM bill_items WHERE bill_id = ?',
      [id]
    );

    let payments = [];
    try {
      [payments] = await pool.query(
        `SELECT bp.*, u.full_name as recorded_by_name
         FROM payments bp
         JOIN users u ON bp.received_by = u.user_id
         WHERE bp.bill_id = ?
         ORDER BY bp.created_at DESC`,
        [id]
      );
    } catch (paymentError) {
      if (!['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(paymentError.code)) {
        throw paymentError;
      }
    }

    res.json({
      success: true,
      invoice: invoices[0],
      items,
      payments
    });
  } catch (error) {
    console.error('getInvoiceById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
  }
}

async function createInvoice(req, res) {
  try {
    const { patient_id, items } = req.body;
    const generated_by = req.user.id;

    if (!patient_id || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient ID and items are required' });
    }

    // Validate patient exists
    const [patients] = await pool.query('SELECT patient_id, full_name FROM patients WHERE patient_id = ? AND deleted_at IS NULL', [patient_id]);
    if (patients.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient not found. Please select an existing patient from the search.' });
    }

    // Validate items have required fields
    const validItems = items.filter(item => item.description && item.quantity > 0);
    if (validItems.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one valid item with description and quantity is required' });
    }

    let total = 0;
    for (const item of validItems) {
      const qty = parseInt(item.quantity) || 1;
      const price = parseFloat(item.unit_price) || 0;
      total += qty * price;
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [billResult] = await connection.query(
        `INSERT INTO bills (patient_id, total_amount, generated_by, payment_status, bill_date)
         VALUES (?, ?, ?, 'Unpaid', CURDATE())`,
        [patient_id, total, generated_by]
      );

      const bill_id = billResult.insertId;

      for (const item of validItems) {
        const qty = parseInt(item.quantity) || 1;
        const price = parseFloat(item.unit_price) || 0;
        const subtotal = qty * price;
        await connection.query(
          `INSERT INTO bill_items (bill_id, description, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [bill_id, item.description, qty, price, subtotal]
        );
      }

      await connection.commit();

      const [newInvoice] = await pool.query(
        `SELECT b.*, p.full_name as patient_name 
         FROM bills b
         JOIN patients p ON b.patient_id = p.patient_id
         WHERE b.bill_id = ?`,
        [bill_id]
      );

      res.status(201).json({ success: true, invoice: newInvoice[0] });
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error in createInvoice:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to create invoice - rollback performed' });
    } finally {
      if (connection) connection.release();
    }
  } catch (error) {
    console.error('createInvoice error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create invoice' });
  }
}

async function recordPayment(req, res) {
  try {
    const { id } = req.params;
    const { amount_paid, payment_method, reference_number } = req.body;
    const received_by = req.user.id;

    if (!amount_paid || amount_paid <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const [[invoice]] = await pool.query(
      'SELECT * FROM bills WHERE bill_id = ?',
      [id]
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const newAmountPaid = Number(invoice.amount_paid || 0) + parseFloat(amount_paid);
    let newStatus = invoice.payment_status;

    if (newAmountPaid >= Number(invoice.total_amount || 0)) {
      newStatus = 'Paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'Partial';
    } else {
      newStatus = 'Unpaid';
    }

    const paymentMethods = {
      cash: 'Cash',
      mpesa: 'M-Pesa',
      'm-pesa': 'M-Pesa',
      insurance: 'Insurance',
      card: 'Other',
      other: 'Other'
    };
    const normalizedPaymentMethod = paymentMethods[String(payment_method || 'cash').toLowerCase()] || 'Cash';

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE bills SET amount_paid = ?, payment_status = ?, payment_method = ? WHERE bill_id = ?`,
        [newAmountPaid, newStatus, normalizedPaymentMethod, id]
      );

      let payment = {
        bill_id: Number(id),
        amount_paid: parseFloat(amount_paid),
        payment_method: normalizedPaymentMethod,
        reference_number: reference_number || null,
        received_by
      };

      try {
        const [paymentResult] = await connection.query(
          `INSERT INTO payments (bill_id, amount_paid, payment_method, reference_number, received_by, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [id, amount_paid, normalizedPaymentMethod, reference_number || null, received_by]
        );
        const [paymentRows] = await connection.query(
          'SELECT * FROM payments WHERE id = ?',
          [paymentResult.insertId]
        );
        payment = paymentRows[0] || payment;
      } catch (paymentError) {
        if (!['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(paymentError.code)) {
          throw paymentError;
        }
      }

      await connection.commit();

      const [[updatedInvoice]] = await pool.query(
        `SELECT b.*, p.full_name as patient_name 
         FROM bills b
         JOIN patients p ON b.patient_id = p.patient_id
         WHERE b.bill_id = ?`,
        [id]
      );

      res.json({ success: true, invoice: updatedInvoice, payment });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('recordPayment error:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
}

async function getServices(req, res) {
  try {
    const { type } = req.query;
    
    let query = 'SELECT service_id, service_name, service_type, unit_price FROM service_prices WHERE is_active = 1';
    const params = [];
    
    if (type) {
      query += ' AND service_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY service_type, service_name';
    
    const [services] = await pool.query(query, params);
    
    res.json({ success: true, services });
  } catch (error) {
    console.error('getServices error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
}

async function createBillFromServices(req, res) {
  try {
    const { patient_id, services } = req.body;
    const generated_by = req.user.id;

    if (!patient_id || !services || services.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient ID and services are required' });
    }

    const [[patient]] = await pool.query(
      'SELECT patient_id FROM patients WHERE patient_id = ? AND deleted_at IS NULL',
      [patient_id]
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [billResult] = await connection.query(
        `INSERT INTO bills (patient_id, total_amount, payment_status, bill_date, generated_by)
         VALUES (?, 0, 'Unpaid', CURDATE(), ?)`,
        [patient_id, generated_by]
      );

      const bill_id = billResult.insertId;
      let total = 0;

      for (const svc of services) {
        const [[service]] = await connection.query(
          'SELECT service_name, unit_price FROM service_prices WHERE service_id = ? AND is_active = 1',
          [svc.service_id]
        );

        if (service) {
          const itemTotal = service.unit_price * (svc.quantity || 1);
          total += itemTotal;

          await connection.query(
            `INSERT INTO bill_items (bill_id, description, quantity, unit_price, subtotal)
             VALUES (?, ?, ?, ?, ?)`,
            [bill_id, service.service_name, svc.quantity || 1, service.unit_price, itemTotal]
          );
        }
      }

      await connection.query(
        'UPDATE bills SET total_amount = ? WHERE bill_id = ?',
        [total, bill_id]
      );

      await connection.commit();

      const [[bill]] = await pool.query(
        `SELECT b.*, p.full_name as patient_name
         FROM bills b
         JOIN patients p ON b.patient_id = p.patient_id
         WHERE b.bill_id = ?`,
        [bill_id]
      );

      const [items] = await pool.query(
        'SELECT * FROM bill_items WHERE bill_id = ?',
        [bill_id]
      );

      res.status(201).json({ success: true, invoice: bill, items });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('createBillFromServices error:', error);
    res.status(500).json({ success: false, message: 'Failed to create bill' });
  }
}

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
  getServices,
  createBillFromServices
};
