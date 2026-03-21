<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();
requireRole(['admin']);

$date_from_raw = trim($_GET['date_from'] ?? '');
$date_to_raw = trim($_GET['date_to'] ?? '');

$date_from = $date_from_raw ? DateTime::createFromFormat('d/m/Y', $date_from_raw)->format('Y-m-d') : date('Y-m-01');
$date_to = $date_to_raw ? DateTime::createFromFormat('d/m/Y', $date_to_raw)->format('Y-m-d') : date('Y-m-d');

$patients_stmt = $pdo->prepare("SELECT COUNT(*) FROM patients WHERE DATE(created_at) BETWEEN ? AND ?");
$patients_stmt->execute([$date_from, $date_to]);
$patients_count = $patients_stmt->fetchColumn();

$appointments_stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE appointment_date BETWEEN ? AND ?");
$appointments_stmt->execute([$date_from, $date_to]);
$appointments_count = $appointments_stmt->fetchColumn();

$lab_tests_stmt = $pdo->prepare("SELECT COUNT(*) FROM lab_tests WHERE status = 'Completed' AND date_processed BETWEEN ? AND ?");
$lab_tests_stmt->execute([$date_from, $date_to]);
$lab_tests_count = $lab_tests_stmt->fetchColumn();

$revenue_stmt = $pdo->prepare("SELECT COALESCE(SUM(amount_paid), 0) FROM bills WHERE payment_status = 'Paid' AND bill_date BETWEEN ? AND ?");
$revenue_stmt->execute([$date_from, $date_to]);
$revenue_total = $revenue_stmt->fetchColumn();

$stats = [
    'patients' => $patients_count,
    'appointments' => $appointments_count,
    'lab_tests' => $lab_tests_count,
    'revenue' => $revenue_total,
];

$daily_stmt = $pdo->prepare("
    SELECT DATE(created_at) as date, COUNT(*) as count 
    FROM patients 
    WHERE DATE(created_at) BETWEEN ? AND ? 
    GROUP BY DATE(created_at) 
    ORDER BY date DESC
");
$daily_stmt->execute([$date_from, $date_to]);
$daily = $daily_stmt->fetchAll();

$by_doctor_stmt = $pdo->prepare("
    SELECT u.full_name, COUNT(*) as total,
           SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) as completed,
           SUM(CASE WHEN a.status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled
    FROM appointments a
    JOIN users u ON a.doctor_id = u.user_id
    WHERE a.appointment_date BETWEEN ? AND ?
    GROUP BY a.doctor_id
");
$by_doctor_stmt->execute([$date_from, $date_to]);
$by_doctor = $by_doctor_stmt->fetchAll();

$lab_volume_stmt = $pdo->prepare("
    SELECT test_type, COUNT(*) as total,
           SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
    FROM lab_tests
    WHERE date_requested BETWEEN ? AND ?
    GROUP BY test_type
    ORDER BY total DESC
");
$lab_volume_stmt->execute([$date_from, $date_to]);
$lab_volume = $lab_volume_stmt->fetchAll();

$revenue_stmt = $pdo->prepare("
    SELECT payment_status, COUNT(*) as count, SUM(total_amount) as amount
    FROM bills
    WHERE bill_date BETWEEN ? AND ?
    GROUP BY payment_status
");
$revenue_stmt->execute([$date_from, $date_to]);
$revenue = $revenue_stmt->fetchAll();

require_once '../../includes/header.php';
?>

<!-- Flatpickr CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

<body data-role-required="admin">
<div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <?php require_once '../../includes/sidebar.php'; ?>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        <!-- Topbar -->
        <?php require_once '../../includes/topbar.php'; ?>
        <script>document.getElementById('page-title').textContent = 'System Reports';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-7xl mx-auto animate-fade-up">
                
                <!-- Filter Bar -->
                <div class="bg-white rounded-card ghost-border shadow-sm p-4 mb-8">
                    <form method="GET" action="reports.php" class="flex flex-col md:flex-row items-center gap-4">
                        <div class="grid grid-cols-2 gap-4 flex-1">
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <i class="bi bi-calendar-event"></i>
                                </span>
                                <input type="text" name="date_from" id="date-from" value="<?php echo $date_from; ?>" placeholder="From Date"
                                    class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-red-500 focus:bg-white transition-all outline-none font-medium text-sm">
                            </div>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <i class="bi bi-calendar-check"></i>
                                </span>
                                <input type="text" name="date_to" id="date-to" value="<?php echo $date_to; ?>" placeholder="To Date"
                                    class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-red-500 focus:bg-white transition-all outline-none font-medium text-sm">
                            </div>
                        </div>
                        <button type="submit" class="w-full md:w-auto px-8 py-2.5 bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-100 flex items-center justify-center gap-2">
                            <i class="bi bi-funnel"></i>
                            Generate Report
                        </button>
                    </form>
                </div>

                <!-- Summary Stat Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <!-- Patients -->
                    <div class="bg-white rounded-card ghost-border p-6 shadow-sm border-l-4 border-blue-500 animate-fade-up" style="animation-delay: 100ms">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <i class="bi bi-people-fill text-xl"></i>
                            </div>
                            <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">+12%</span>
                        </div>
                        <h3 class="text-2xl font-display font-black text-ink-900 mb-1">1,284</h3>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Patients Registered</p>
                    </div>

                    <!-- Appointments -->
                    <div class="bg-white rounded-card ghost-border p-6 shadow-sm border-l-4 border-violet-500 animate-fade-up" style="animation-delay: 200ms">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
                                <i class="bi bi-calendar-check text-xl"></i>
                            </div>
                            <span class="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded uppercase">+5%</span>
                        </div>
                        <h3 class="text-2xl font-display font-black text-ink-900 mb-1">342</h3>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Appointments</p>
                    </div>

                    <!-- Lab Tests -->
                    <div class="bg-white rounded-card ghost-border p-6 shadow-sm border-l-4 border-cyan-500 animate-fade-up" style="animation-delay: 300ms">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
                                <i class="bi bi-droplet-fill text-xl"></i>
                            </div>
                            <span class="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded uppercase">Stable</span>
                        </div>
                        <h3 class="text-2xl font-display font-black text-ink-900 mb-1">187</h3>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Lab Tests Completed</p>
                    </div>

                    <!-- Revenue -->
                    <div class="bg-white rounded-card ghost-border p-6 shadow-sm border-l-4 border-amber-500 animate-fade-up" style="animation-delay: 400ms">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                <i class="bi bi-receipt text-xl"></i>
                            </div>
                            <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">Top Perf</span>
                        </div>
                        <h3 class="text-2xl font-display font-black text-ink-900 mb-1">KES 284,500</h3>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Revenue</p>
                    </div>
                </div>

                <!-- Detailed Tables Grid (2x2) -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    <!-- Table 1: Daily Registrations -->
                    <div class="bg-white rounded-card ghost-border shadow-sm overflow-hidden animate-fade-up" style="animation-delay: 500ms">
                        <div class="px-6 py-4 bg-slate-50 border-b border-surface-dim flex items-center gap-3">
                            <i class="bi bi-graph-up text-blue-500"></i>
                            <h4 class="text-sm font-display font-bold text-ink-900">Daily Registrations</h4>
                        </div>
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/50">
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Patients Registered</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-dim">
                                <tr>
                                    <td class="px-6 py-4 text-xs font-medium text-slate-600">20/03/2026</td>
                                    <td class="px-6 py-4 text-xs font-bold text-ink-900 text-right">8</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 text-xs font-medium text-slate-600">19/03/2026</td>
                                    <td class="px-6 py-4 text-xs font-bold text-ink-900 text-right">12</td>
                                </tr>
                                <tr class="bg-slate-50/30">
                                    <td class="px-6 py-4 text-xs font-medium text-slate-600">18/03/2026</td>
                                    <td class="px-6 py-4 text-xs font-bold text-ink-900 text-right">6</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Table 2: Appointments by Doctor -->
                    <div class="bg-white rounded-card ghost-border shadow-sm overflow-hidden animate-fade-up" style="animation-delay: 600ms">
                        <div class="px-6 py-4 bg-slate-50 border-b border-surface-dim flex items-center gap-3">
                            <i class="bi bi-person-check text-violet-500"></i>
                            <h4 class="text-sm font-display font-bold text-ink-900">Appointments by Doctor</h4>
                        </div>
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/50">
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Doctor</th>
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center">Total</th>
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center text-emerald-500 text-[10px]">Comp.</th>
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center text-red-500 text-[10px]">Canc.</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-dim text-xs">
                                <tr>
                                    <td class="px-6 py-4 font-bold text-slate-600">Dr. James Ochieng</td>
                                    <td class="px-6 py-4 text-center font-bold">145</td>
                                    <td class="px-6 py-4 text-center text-emerald-600 font-bold">120</td>
                                    <td class="px-6 py-4 text-center text-red-600 font-bold">10</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 font-bold text-slate-600">Dr. Simon Mutua</td>
                                    <td class="px-6 py-4 text-center font-bold">197</td>
                                    <td class="px-6 py-4 text-center text-emerald-600 font-bold">180</td>
                                    <td class="px-6 py-4 text-center text-red-600 font-bold">8</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Table 3: Lab Test Volume -->
                    <div class="bg-white rounded-card ghost-border shadow-sm overflow-hidden animate-fade-up" style="animation-delay: 700ms">
                        <div class="px-6 py-4 bg-slate-50 border-b border-surface-dim flex items-center gap-3">
                            <i class="bi bi-flask-fill text-cyan-500"></i>
                            <h4 class="text-sm font-display font-bold text-ink-900">Lab Test Volume</h4>
                        </div>
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/50">
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Test Type</th>
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center">Count</th>
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Completed</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-dim text-xs">
                                <tr>
                                    <td class="px-6 py-4 font-medium text-slate-600">Full Blood Count (FBC)</td>
                                    <td class="px-6 py-4 text-center font-bold">45</td>
                                    <td class="px-6 py-4 text-right text-cyan-600 font-bold">40</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 font-medium text-slate-600">Malaria RDT</td>
                                    <td class="px-6 py-4 text-center font-bold">62</td>
                                    <td class="px-6 py-4 text-right text-cyan-600 font-bold">58</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 font-medium text-slate-600">Urinalysis</td>
                                    <td class="px-6 py-4 text-center font-bold">28</td>
                                    <td class="px-6 py-4 text-right text-cyan-600 font-bold">25</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Table 4: Revenue Summary -->
                    <div class="bg-white rounded-card ghost-border shadow-sm overflow-hidden animate-fade-up" style="animation-delay: 800ms">
                        <div class="px-6 py-4 bg-slate-50 border-b border-surface-dim flex items-center gap-3">
                            <i class="bi bi-wallet2 text-amber-500"></i>
                            <h4 class="text-sm font-display font-bold text-ink-900">Revenue Summary</h4>
                        </div>
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/50">
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center">Invoices</th>
                                    <th class="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Amount (KES)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-dim text-xs">
                                <tr>
                                    <td class="px-6 py-4"><span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold">Paid</span></td>
                                    <td class="px-6 py-4 text-center font-bold text-slate-400">72</td>
                                    <td class="px-6 py-4 text-right font-black text-ink-900">284,500.00</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4"><span class="px-2 py-0.5 rounded bg-red-50 text-red-600 font-bold">Unpaid</span></td>
                                    <td class="px-6 py-4 text-center font-bold text-slate-400">12</td>
                                    <td class="px-6 py-4 text-right font-black text-ink-900">48,200.00</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4"><span class="px-2 py-0.5 rounded bg-amber-50 text-amber-600 font-bold">Partial</span></td>
                                    <td class="px-6 py-4 text-center font-bold text-slate-400">3</td>
                                    <td class="px-6 py-4 text-right font-black text-ink-900">15,000.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </main>
    </div>
</div>

<!-- Flatpickr JS -->
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    flatpickr("#date-from", { dateFormat: "d/m/Y" });
    flatpickr("#date-to", { dateFormat: "d/m/Y" });
});
</script>

</body>
</html>
