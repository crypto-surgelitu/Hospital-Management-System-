<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';
requireLogin();

$total_patients = $pdo->query("SELECT COUNT(*) FROM patients WHERE is_active=1")->fetchColumn();
$todays_appts = $pdo->query("SELECT COUNT(*) FROM appointments WHERE appointment_date=CURDATE()")->fetchColumn();
$pending_tests = $pdo->query("SELECT COUNT(*) FROM lab_tests WHERE status='Pending'")->fetchColumn();
$unpaid_bills = $pdo->query("SELECT COALESCE(SUM(total_amount-amount_paid),0) FROM bills WHERE payment_status!='Paid'")->fetchColumn();
$recent_patients = $pdo->query("SELECT * FROM patients WHERE is_active=1 ORDER BY created_at DESC LIMIT 5")->fetchAll();
$low_stock = $pdo->query("SELECT * FROM drugs WHERE quantity_in_stock <= reorder_level AND is_active=1 LIMIT 5")->fetchAll();
$todays_appt_list = $pdo->query("SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name FROM appointments a JOIN patients p ON a.patient_id=p.patient_id JOIN users u ON a.doctor_id=u.user_id WHERE a.appointment_date=CURDATE() ORDER BY a.appointment_time ASC LIMIT 8")->fetchAll();

$pageTitle = 'Dashboard';
require_once 'C:/xampp/htdocs/hms/includes/header.php';
require_once 'C:/xampp/htdocs/hms/includes/sidebar.php';
require_once 'C:/xampp/htdocs/hms/includes/topbar.php';
?>

<main class="flex-1 overflow-y-auto p-6 bg-surface ml-64">

    <div class="mb-6">
        <h1 class="text-2xl font-display font-bold text-ink-900">Overview</h1>
        <p class="text-slate-500 text-sm mt-1">Welcome back, <?= htmlspecialchars($_SESSION['full_name']) ?></p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <div class="bg-white rounded-card border border-border-subtle p-5 shadow-card">
            <div class="w-11 h-11 rounded-xl bg-blue-50 grid place-items-center mb-4">
                <i class="bi bi-people-fill text-xl text-blue-500"></i>
            </div>
            <div class="text-3xl font-display font-bold text-ink-900 mb-1"><?= number_format($total_patients) ?></div>
            <div class="text-sm text-slate-500">Total Patients</div>
        </div>

        <div class="bg-white rounded-card border border-border-subtle p-5 shadow-card">
            <div class="w-11 h-11 rounded-xl bg-violet-50 grid place-items-center mb-4">
                <i class="bi bi-calendar-check text-xl text-violet-500"></i>
            </div>
            <div class="text-3xl font-display font-bold text-ink-900 mb-1"><?= number_format($todays_appts) ?></div>
            <div class="text-sm text-slate-500">Appointments Today</div>
        </div>

        <div class="bg-white rounded-card border border-border-subtle p-5 shadow-card">
            <div class="w-11 h-11 rounded-xl bg-cyan-50 grid place-items-center mb-4">
                <i class="bi bi-droplet-fill text-xl text-cyan-500"></i>
            </div>
            <div class="text-3xl font-display font-bold text-ink-900 mb-1"><?= number_format($pending_tests) ?></div>
            <div class="text-sm text-slate-500">Pending Lab Tests</div>
        </div>

        <div class="bg-white rounded-card border border-border-subtle p-5 shadow-card">
            <div class="w-11 h-11 rounded-xl bg-amber-50 grid place-items-center mb-4">
                <i class="bi bi-receipt text-xl text-amber-500"></i>
            </div>
            <div class="text-3xl font-display font-bold text-ink-900 mb-1"><?= formatKES($unpaid_bills) ?></div>
            <div class="text-sm text-slate-500">Outstanding Bills</div>
        </div>

    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        <div class="xl:col-span-2 bg-white rounded-card border border-border-subtle shadow-card overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                <h3 class="font-bold text-ink-900">Today's Appointments</h3>
                <a href="/hms/modules/appointments/index.php"
                    class="text-xs font-semibold text-accent hover:underline">View All →</a>
            </div>
            <table class="w-full">
                <thead>
                    <tr class="bg-surface-bg">
                        <th class="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">Patient</th>
                        <th class="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">Doctor</th>
                        <th class="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">Time</th>
                        <th class="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($todays_appt_list)): ?>
                        <tr>
                            <td colspan="4" class="px-4 py-8 text-center text-slate-400 text-sm">No appointments today</td>
                        </tr>
                    <?php else:
                        foreach ($todays_appt_list as $a): ?>
                            <tr class="border-t border-border-subtle hover:bg-surface-hover">
                                <td class="px-4 py-3 text-sm font-medium text-ink-900">
                                    <?= htmlspecialchars($a['patient_name']) ?></td>
                                <td class="px-4 py-3 text-sm text-slate-500"><?= htmlspecialchars($a['doctor_name']) ?></td>
                                <td class="px-4 py-3 text-sm font-mono text-slate-500">
                                    <?= substr($a['appointment_time'], 0, 5) ?></td>
                                <td class="px-4 py-3">
                                    <span
                                        class="px-2.5 py-1 rounded-pill text-xs font-semibold
                  <?= $a['status'] === 'Completed' ? 'bg-green-50 text-green-600' : ($a['status'] === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600') ?>">
                                        <?= $a['status'] ?>
                                    </span>
                                </td>
                            </tr>
                        <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>

        <div class="bg-white rounded-card border border-border-subtle shadow-card overflow-hidden">
            <div class="px-5 py-4 border-b border-border-subtle">
                <h3 class="font-bold text-ink-900">Low Stock Alerts</h3>
            </div>
            <div class="divide-y divide-border-subtle">
                <?php if (empty($low_stock)): ?>
                    <p class="px-5 py-8 text-center text-slate-400 text-sm">All drugs well stocked</p>
                <?php else:
                    foreach ($low_stock as $d): ?>
                        <div class="flex items-center justify-between px-5 py-3">
                            <div>
                                <p class="text-sm font-semibold text-ink-900"><?= htmlspecialchars($d['drug_name']) ?></p>
                                <p class="text-xs text-slate-400 mt-0.5"><?= $d['quantity_in_stock'] ?>         <?= $d['unit'] ?>
                                    remaining</p>
                            </div>
                            <span class="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-pill">Low</span>
                        </div>
                    <?php endforeach; endif; ?>
            </div>
            <div class="px-5 py-3 border-t border-border-subtle">
                <a href="/hms/modules/pharmacy/inventory.php"
                    class="text-xs font-semibold text-accent hover:underline">View Inventory →</a>
            </div>
        </div>

    </div>

    <div class="bg-white rounded-card border border-border-subtle shadow-card overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
            <h3 class="font-bold text-ink-900">Recent Registrations</h3>
            <a href="/hms/modules/patients/index.php" class="text-xs font-semibold text-accent hover:underline">View All
                →</a>
        </div>
        <table class="w-full">
            <thead>
                <tr class="bg-surface-bg">
                    <th class="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">Patient ID</th>
                    <th class="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">Name</th>
                    <th class="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">Phone</th>
                    <th class="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">Registered</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($recent_patients)): ?>
                    <tr>
                        <td colspan="4" class="px-4 py-8 text-center text-slate-400 text-sm">No patients yet</td>
                    </tr>
                <?php else:
                    foreach ($recent_patients as $p): ?>
                        <tr class="border-t border-border-subtle hover:bg-surface-hover">
                            <td class="px-4 py-3 font-mono text-sm text-slate-400"><?= formatPatientID($p['patient_id']) ?></td>
                            <td class="px-4 py-3 text-sm font-medium text-ink-900"><?= htmlspecialchars($p['full_name']) ?></td>
                            <td class="px-4 py-3 text-sm text-slate-500"><?= htmlspecialchars($p['phone'] ?? '—') ?></td>
                            <td class="px-4 py-3 text-sm text-slate-500"><?= formatDate($p['created_at']) ?></td>
                        </tr>
                    <?php endforeach; endif; ?>
            </tbody>
        </table>
    </div>

</main>
</body>

</html>