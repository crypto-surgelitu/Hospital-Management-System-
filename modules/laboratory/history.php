<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();

$where = 'WHERE 1=1';
$params = [];

$patient_id = intval($_GET['patient_id'] ?? 0);
$status = trim($_GET['status'] ?? '');
$date_from = trim($_GET['date_from'] ?? '');
$date_to = trim($_GET['date_to'] ?? '');

if ($patient_id) {
    $where .= ' AND lt.patient_id = ?';
    $params[] = $patient_id;
}

if (!empty($status) && in_array($status, ['Pending', 'Processing', 'Completed'])) {
    $where .= ' AND lt.status = ?';
    $params[] = $status;
}

if (!empty($date_from)) {
    $where .= ' AND lt.date_requested >= ?';
    $params[] = $date_from;
}

if (!empty($date_to)) {
    $where .= ' AND lt.date_requested <= ?';
    $params[] = $date_to;
}

$stmt = $pdo->prepare("
    SELECT lt.*, p.full_name as patient_name, p.patient_id, u.full_name as doctor_name
    FROM lab_tests lt
    JOIN patients p ON lt.patient_id = p.patient_id
    JOIN users u ON lt.requested_by = u.user_id
    $where
    ORDER BY lt.date_requested DESC, lt.created_at DESC
");
$stmt->execute($params);
$tests = $stmt->fetchAll();

require_once '../../includes/header.php';
?>

<!-- Flatpickr CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

<div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <?php require_once '../../includes/sidebar.php'; ?>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        <!-- Topbar -->
        <?php require_once '../../includes/topbar.php'; ?>
        <script>document.getElementById('page-title').textContent = 'Lab Test History';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-7xl mx-auto animate-fade-up">
                
                <!-- Filter Bar -->
                <div class="bg-white rounded-card ghost-border shadow-sm p-4 mb-8">
                    <form action="#" method="GET" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        
                        <!-- Patient Search -->
                        <div class="relative lg:col-span-2">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" placeholder="Search Patient Name or ID..." 
                                class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-cyan-500 focus:bg-white outline-none text-sm transition-all font-medium">
                        </div>

                        <!-- Status Filter -->
                        <div class="relative">
                            <select class="w-full px-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-cyan-500 focus:bg-white outline-none text-sm transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <!-- Date Range -->
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <i class="bi bi-calendar-range"></i>
                            </span>
                            <input type="text" id="date-range-picker" placeholder="Select Dates" 
                                class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-cyan-500 focus:bg-white outline-none text-sm transition-all font-medium">
                        </div>

                        <!-- Search Button -->
                        <button type="submit" class="bg-cyan-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-100 flex items-center justify-center gap-2">
                            <i class="bi bi-funnel"></i>
                            Filter
                        </button>

                    </form>
                </div>

                <!-- History Table -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-surface-dim">
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Test ID</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Patient</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Test Type</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Requested By</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Result Snippet</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-dim">
                                <!-- LT-001 (Completed) -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <span class="text-[11px] font-mono text-slate-400">LT-001</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">John Kamau</span>
                                            <span class="text-[10px] font-mono text-slate-400">P-00124</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">FBC</td>
                                    <td class="px-6 py-5 text-sm text-slate-500">Dr. Ochieng</td>
                                    <td class="px-6 py-5">
                                        <span class="px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">Completed</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500">19/03/2026</td>
                                    <td class="px-6 py-5">
                                        <p class="text-[11px] text-slate-400 font-mono line-clamp-1 italic">WBC: 7.2 • RBC: 4.8...</p>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="result.php?id=1" class="text-xs font-bold text-cyan-500 hover:text-cyan-700 transition-colors">View Details</a>
                                    </td>
                                </tr>
                                <!-- LT-002 (Pending) -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <span class="text-[11px] font-mono text-slate-400">LT-002</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">Grace Wanjiku</span>
                                            <span class="text-[10px] font-mono text-slate-400">P-00123</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">Malaria RDT</td>
                                    <td class="px-6 py-5 text-sm text-slate-500">Dr. Mutua</td>
                                    <td class="px-6 py-5">
                                        <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider">Pending</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500">20/03/2026</td>
                                    <td class="px-6 py-5 text-sm text-slate-300 font-medium">--</td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="result.php?id=2" class="text-xs font-bold text-cyan-500 hover:text-cyan-700 transition-colors">Process</a>
                                    </td>
                                </tr>
                                <!-- LT-003 (Processing) -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <span class="text-[11px] font-mono text-slate-400">LT-003</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">Brian Ochieng</span>
                                            <span class="text-[10px] font-mono text-slate-400">P-00122</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">Urinalysis</td>
                                    <td class="px-6 py-5 text-sm text-slate-500">Dr. Ochieng</td>
                                    <td class="px-6 py-5">
                                        <span class="px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 text-[10px] font-bold uppercase tracking-wider">Processing</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500">20/03/2026</td>
                                    <td class="px-6 py-5 text-sm text-slate-300 font-medium">--</td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="result.php?id=3" class="text-xs font-bold text-cyan-500 hover:text-cyan-700 transition-colors">Update</a>
                                    </td>
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
    flatpickr("#date-range-picker", {
        mode: "range",
        dateFormat: "d/m/Y",
        maxDate: "today"
    });
});
</script>

</body>
</html>
