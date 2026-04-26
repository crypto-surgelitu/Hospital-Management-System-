const { pool } = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === 'admin' || userRole === 'receptionist') {
      const pendingPatients = await pool.query('SELECT COUNT(*) as cnt FROM patients WHERE deleted_at IS NULL');
      const todayAppointments = await pool.query('SELECT COUNT(*) as cnt FROM appointments WHERE DATE(appointment_date) = CURDATE()');
      const pendingLabTests = await pool.query("SELECT COUNT(*) as cnt FROM lab_requests WHERE status = 'pending'");
      const lowStockDrugs = await pool.query('SELECT COUNT(*) as cnt FROM drugs WHERE quantity_in_stock <= reorder_level AND is_active = 1');
      const pendingPayments = await pool.query("SELECT COUNT(*) as cnt FROM bills WHERE payment_status = 'pending'");
      const invoicesToday = await pool.query('SELECT COUNT(*) as cnt FROM bills WHERE DATE(bill_date) = CURDATE()');

      return res.json({ success: true, stats: {
        totalPatients: pendingPatients[0][0].cnt || 0,
        todayAppointments: todayAppointments[0][0].cnt || 0,
        pendingLabTests: pendingLabTests[0][0].cnt || 0,
        lowStockDrugs: lowStockDrugs[0][0].cnt || 0,
        pendingPayments: pendingPayments[0][0].cnt || 0,
        invoicesToday: invoicesToday[0][0].cnt || 0,
      }});
    }

    if (userRole === 'doctor') {
      const myPatients = await pool.query('SELECT COUNT(DISTINCT patient_id) as cnt FROM appointments WHERE doctor_id = ? AND DATE(appointment_date) = CURDATE()', [userId]);
      const appointments = await pool.query('SELECT COUNT(*) as cnt FROM appointments WHERE doctor_id = ? AND DATE(appointment_date) = CURDATE()', [userId]);
      const labResults = await pool.query("SELECT COUNT(*) as cnt FROM lab_requests WHERE requested_by = ? AND status = 'pending'", [userId]);
      const unfinishedNotes = await pool.query("SELECT COUNT(*) as cnt FROM appointments WHERE doctor_id = ? AND notes IS NULL AND status = 'completed'", [userId]);

      return res.json({ success: true, stats: {
        myPatients: myPatients[0][0].cnt || 0,
        todayAppointments: appointments[0][0].cnt || 0,
        pendingLabTests: labResults[0][0].cnt || 0,
        unfinishedNotes: unfinishedNotes[0][0].cnt || 0,
      }});
    }

    if (userRole === 'pharmacy') {
      const drugsInStock = await pool.query('SELECT COUNT(*) as cnt FROM drugs WHERE is_active = 1');
      const lowStock = await pool.query('SELECT COUNT(*) as cnt FROM drugs WHERE quantity_in_stock <= reorder_level AND is_active = 1');

      return res.json({ success: true, stats: {
        drugsInStock: drugsInStock[0][0].cnt || 0,
        lowStockDrugs: lowStock[0][0].cnt || 0,
        pendingDispense: 0,
        dispensedToday: 0,
      }});
    }

    if (userRole === 'lab') {
      const pendingTests = await pool.query("SELECT COUNT(*) as cnt FROM lab_requests WHERE status = 'pending'");
      const completedToday = await pool.query("SELECT COUNT(*) as cnt FROM lab_requests WHERE status = 'completed' AND completed_at >= CURDATE()");
      const urgentRequests = await pool.query("SELECT COUNT(*) as cnt FROM lab_requests WHERE priority = 'urgent' AND status = 'pending'");

      return res.json({ success: true, stats: {
        pendingLabTests: pendingTests[0][0].cnt || 0,
        completedTests: completedToday[0][0].cnt || 0,
        urgentRequests: urgentRequests[0][0].cnt || 0,
        avgTurnaround: '2h',
      }});
    }

    // Default stats for any role
    const patients = await pool.query('SELECT COUNT(*) as cnt FROM patients WHERE deleted_at IS NULL');
    const appointments = await pool.query('SELECT COUNT(*) as cnt FROM appointments WHERE DATE(appointment_date) = CURDATE()');

    res.json({ success: true, stats: {
      totalPatients: patients[0][0].cnt || 0,
      todayAppointments: appointments[0][0].cnt || 0,
    }});
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { getDashboardStats };