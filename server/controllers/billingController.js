const { pool } = require('../config/db');

async function getInvoices(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, patient_id } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (status && ['pending', 'paid', 'partial', 'waived'].includes(status)) {
      whereClause += ' AND b.status = ?';
      params.push(status);
    }

    if (patient_id) {
      whereClause += ' AND b.patient_id = ?';
      params.push(patient_id);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM billing b WHERE ${whereClause}`,
      params
    );

    const [invoices] = await pool.query(
      `SELECT b.*, p.full_name as patient_name 
       FROM billing b
       JOIN patients p ON b.patient_id = p.id
       WHERE ${whereClause}
       ORDER BY b.created_at DESC
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
       FROM billing b
       JOIN patients p ON b.patient_id = p.id
       WHERE b.id = ?`,
      [id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const [items] = await pool.query(
      'SELECT * FROM billing_items WHERE billing_id = ?',
      [id]
    );

    const [payments] = await pool.query(
      `SELECT bp.*, u.full_name as recorded_by_name
       FROM billing_payments bp
       JOIN users u ON bp.recorded_by = u.id
       WHERE bp.billing_id = ?
       ORDER BY bp.created_at DESC`,
      [id]
    );

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

    for (const item of items) {
      if (!item.description || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, message: 'Valid description and quantity required for all items' });
      }
    }

    let subtotal = 0;
    for (const item of items) {
      subtotal += parseFloat(item.quantity) * parseFloat(item.unit_price || 0);
    }

    const invoice_number = 'INV-' + Date.now();
    const total = subtotal;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [billResult] = await connection.query(
        `INSERT INTO billing (patient_id, invoice_number, subtotal, total, status, created_at)
         VALUES (?, ?, ?, ?, 'pending', NOW())`,
        [patient_id, invoice_number, subtotal, total]
      );

      const billing_id = billResult.insertId;

      for (const item of items) {
        const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.unit_price || 0);
        await connection.query(
          `INSERT INTO billing_items (billing_id, description, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [billing_id, item.description, item.quantity, item.unit_price || 0, itemSubtotal]
        );
      }

      await connection.commit();

      const [newInvoice] = await pool.query(
        `SELECT b.*, p.full_name as patient_name 
         FROM billing b
         JOIN patients p ON b.patient_id = p.id
         WHERE b.id = ?`,
        [billing_id]
      );

      const [newItems] = await pool.query(
        'SELECT * FROM billing_items WHERE billing_id = ?',
        [billing_id]
      );

      res.status(201).json({ success: true, invoice: newInvoice[0], items: newItems });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('createInvoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
}

async function recordPayment(req, res) {
  try {
    const { id } = req.params;
    const { amount_paid, payment_method, reference_number } = req.body;
    const recorded_by = req.user.id;

    if (!amount_paid || amount_paid <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const [[invoice]] = await pool.query(
      'SELECT * FROM billing WHERE id = ?',
      [id]
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const newAmountPaid = (invoice.amount_paid || 0) + parseFloat(amount_paid);
    let newStatus = invoice.status;

    if (newAmountPaid >= invoice.total) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partial';
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE billing SET amount_paid = ?, status = ? WHERE id = ?`,
        [newAmountPaid, newStatus, id]
      );

      const [paymentResult] = await connection.query(
        `INSERT INTO billing_payments (billing_id, amount_paid, payment_method, reference_number, recorded_by, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [id, amount_paid, payment_method || 'cash', reference_number || null, recorded_by]
      );

      await connection.commit();

      const [[updatedInvoice]] = await pool.query(
        `SELECT b.*, p.full_name as patient_name 
         FROM billing b
         JOIN patients p ON b.patient_id = p.id
         WHERE b.id = ?`,
        [id]
      );

      const [payment] = await pool.query(
        'SELECT * FROM billing_payments WHERE id = ?',
        [paymentResult.insertId]
      );

      res.json({ success: true, invoice: updatedInvoice, payment: payment[0] });
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

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment
};