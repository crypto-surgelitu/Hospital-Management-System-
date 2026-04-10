const { pool } = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const [
      totalPatientsResult,
      todayAppointmentsResult,
      pendingLabTestsResult,
      lowStockDrugsResult
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL'),
      pool.query("SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = CURDATE()"),
      pool.query("SELECT COUNT(*) as count FROM lab_requests WHERE status = 'pending'"),
      pool.query('SELECT COUNT(*) as count FROM pharmacy_inventory WHERE quantity_in_stock <= reorder_level AND is_active = 1')
    ]);

    const stats = {
      totalPatients: totalPatientsResult[0][0].count,
      todayAppointments: todayAppointmentsResult[0][0].count,
      pendingLabTests: pendingLabTestsResult[0][0].count,
      lowStockDrugs: lowStockDrugsResult[0][0].count
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
}

module.exports = { getDashboardStats };