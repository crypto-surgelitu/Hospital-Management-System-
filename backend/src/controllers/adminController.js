const { pool } = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const p = await pool.query('SELECT COUNT(*) as cnt FROM patients WHERE deleted_at IS NULL');
    const a = await pool.query('SELECT COUNT(*) as cnt FROM appointments WHERE DATE(appointment_date) = CURDATE()');
    const l = await pool.query("SELECT COUNT(*) as cnt FROM lab_requests WHERE status = 'pending'");
    const d = await pool.query('SELECT COUNT(*) as cnt FROM pharmacy_inventory WHERE quantity_in_stock <= reorder_level AND is_active = 1');

    const stats = {
      totalPatients: p[0][0]?.cnt || 0,
      todayAppointments: a[0][0]?.cnt || 0,
      pendingLabTests: l[0][0]?.cnt || 0,
      lowStockDrugs: d[0][0]?.cnt || 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { getDashboardStats };