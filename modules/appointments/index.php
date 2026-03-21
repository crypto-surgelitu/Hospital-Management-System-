<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();

$where = 'WHERE 1=1';
$params = [];

if ($_SESSION['role'] === 'doctor') {
    $where .= ' AND a.doctor_id = ?';
    $params[] = $_SESSION['user_id'];
}

$stmt = $pdo->prepare("
    SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name 
    FROM appointments a 
    JOIN patients p ON a.patient_id = p.patient_id 
    JOIN users u ON a.doctor_id = u.user_id 
    $where 
    ORDER BY a.appointment_date DESC, a.appointment_time ASC
");
$stmt->execute($params);
$appointments = $stmt->fetchAll();

$counts = [
    'All' => count($appointments),
    'Scheduled' => 0,
    'Completed' => 0,
    'Cancelled' => 0,
    'No-Show' => 0
];
foreach ($appointments as $a) {
    if (isset($counts[$a['status']])) {
        $counts[$a['status']]++;
    }
}

$today = date('Y-m-d');

$flash_success = $_SESSION['flash_success'] ?? null;
unset($_SESSION['flash_success']);

require_once '../../includes/header.php';
?>

<div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <?php require_once '../../includes/sidebar.php'; ?>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        <!-- Topbar -->
        <?php require_once '../../includes/topbar.php'; ?>
        
        <!-- Flash Messages -->
        <div class="no-print">
            <?php if (!empty($_SESSION['flash_success'])): ?>
                <div class="mx-7 mt-4 p-4 bg-green-50 border border-green-200 rounded-btn text-green-700 text-sm font-medium flex items-center gap-2">
                    <i class="bi bi-check-circle-fill"></i>
                    <?php echo sanitize($_SESSION['flash_success']); unset($_SESSION['flash_success']); ?>
                </div>
            <?php endif; ?>
            <?php if (!empty($_SESSION['flash_error'])): ?>
                <div class="mx-7 mt-4 p-4 bg-red-50 border border-red-200 rounded-btn text-red-700 text-sm font-medium flex items-center gap-2">
                    <i class="bi bi-exclamation-circle-fill"></i>
                    <?php echo sanitize($_SESSION['flash_error']); unset($_SESSION['flash_error']); ?>
                </div>
            <?php endif; ?>
        </div>

        <script>document.getElementById('page-title').textContent = 'Appointments';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-7xl mx-auto animate-fade-up">
                
                <!-- Page Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-600 shadow-sm">
                            <i class="bi bi-calendar-check text-2xl"></i>
                        </div>
                        <div>
                            <h2 class="font-display font-bold text-2xl text-ink-900 tracking-tight">Appointments</h2>
                            <p class="text-xs text-slate-400 font-medium mt-1">Manage patient schedules and clinical sessions</p>
                        </div>
                    </div>
                    <a href="book.php" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#8B5CF6] text-white font-display font-bold rounded-custom hover:bg-[#7C3AED] transition-all shadow-lg shadow-violet-200">
                        <i class="bi bi-plus-lg"></i>
                        Book Appointment
                    </a>
                </div>

                <!-- Tab Bar -->
                <div class="bg-white rounded-card ghost-border shadow-sm px-2 mb-6 overflow-x-auto no-scrollbar">
                    <div class="flex items-center">
                        <button onclick="filterAppointments('All', this)" class="status-tab px-6 py-4 border-b-2 border-violet-600 text-violet-600 font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2">
                            All
                            <span class="w-5 h-5 flex items-center justify-center bg-violet-100 text-[10px] font-bold rounded-full">48</span>
                        </button>
                        <button onclick="filterAppointments('Today', this)" class="status-tab px-6 py-4 border-b-2 border-transparent text-slate-500 font-medium text-sm whitespace-nowrap hover:text-ink-900 transition-all flex items-center gap-2">
                            Today
                            <span class="w-5 h-5 flex items-center justify-center bg-slate-100 text-[10px] font-bold rounded-full">6</span>
                        </button>
                        <button onclick="filterAppointments('Scheduled', this)" class="status-tab px-6 py-4 border-b-2 border-transparent text-slate-500 font-medium text-sm whitespace-nowrap hover:text-ink-900 transition-all flex items-center gap-2">
                            Upcoming
                            <span class="w-5 h-5 flex items-center justify-center bg-slate-100 text-[10px] font-bold rounded-full">18</span>
                        </button>
                        <button onclick="filterAppointments('Completed', this)" class="status-tab px-6 py-4 border-b-2 border-transparent text-slate-500 font-medium text-sm whitespace-nowrap hover:text-ink-900 transition-all flex items-center gap-2">
                            Completed
                            <span class="w-5 h-5 flex items-center justify-center bg-slate-100 text-[10px] font-bold rounded-full">21</span>
                        </button>
                        <button onclick="filterAppointments('Cancelled', this)" class="status-tab px-6 py-4 border-b-2 border-transparent text-slate-500 font-medium text-sm whitespace-nowrap hover:text-ink-900 transition-all flex items-center gap-2">
                            Cancelled
                            <span class="w-5 h-5 flex items-center justify-center bg-slate-100 text-[10px] font-bold rounded-full">3</span>
                        </button>
                    </div>
                </div>

                <!-- Appointments Table -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-surface-dim">
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Patient</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Doctor</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date/Time</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Reason</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="appointment-table-body" class="divide-y divide-surface-dim">
                                <!-- Grace Wanjiku (Today) -->
                                <tr class="appointment-row hover:bg-slate-50/50 transition-colors border-l-4 border-amber-400" data-status="Scheduled" data-day="Today">
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">Grace Wanjiku</span>
                                            <span class="text-[10px] font-mono text-slate-400">P-00123</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-sm font-medium text-slate-600">Dr. Ochieng</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">20/03/2026</span>
                                            <span class="text-xs text-slate-400">09:00</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-sm text-slate-600">Headache</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider status-badge">Scheduled</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="view.php?id=1" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-violet-600 hover:border-violet-600 transition-all"><i class="bi bi-eye"></i></a>
                                            <button onclick="markComplete(1, this)" class="px-3 py-1.5 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:border-green-500 hover:text-green-600 transition-all">Mark Complete</button>
                                        </div>
                                    </td>
                                </tr>
                                <!-- John Kamau (Today) -->
                                <tr class="appointment-row hover:bg-slate-50/50 transition-colors border-l-4 border-amber-400" data-status="Scheduled" data-day="Today">
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">John Kamau</span>
                                            <span class="text-[10px] font-mono text-slate-400">P-00124</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-sm font-medium text-slate-600">Dr. Ochieng</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">20/03/2026</span>
                                            <span class="text-xs text-slate-400">10:30</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-sm text-slate-600">Follow-up</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider status-badge">Scheduled</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex items-center justify-end gap-2 text-right">
                                            <a href="view.php?id=2" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-violet-600 hover:border-violet-600 transition-all"><i class="bi bi-eye"></i></a>
                                            <button onclick="markComplete(2, this)" class="px-3 py-1.5 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:border-green-500 hover:text-green-600 transition-all">Mark Complete</button>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Auma Otieno (Completed) -->
                                <tr class="appointment-row hover:bg-slate-50/50 transition-colors" data-status="Completed">
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">Auma Otieno</span>
                                            <span class="text-[10px] font-mono text-slate-400">P-00121</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-sm font-medium text-slate-600">Dr. Mutua</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">19/03/2026 <span class="text-slate-400">14:00</span></td>
                                    <td class="px-6 py-5 text-sm text-slate-600">Chest pain</td>
                                    <td class="px-6 py-5">
                                        <span class="px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">Completed</span>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="view.php?id=3" class="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-violet-600 hover:border-violet-600 transition-all"><i class="bi bi-eye"></i></a>
                                    </td>
                                </tr>
                                <!-- Brian Ochieng (Cancelled) -->
                                <tr class="appointment-row hover:bg-slate-50/50 transition-colors" data-status="Cancelled">
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">Brian Ochieng</span>
                                            <span class="text-[10px] font-mono text-slate-400">P-00122</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-sm font-medium text-slate-600">Dr. Ochieng</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">18/03/2026 <span class="text-slate-400">08:30</span></td>
                                    <td class="px-6 py-5 text-sm text-slate-600">Malaria symptoms</td>
                                    <td class="px-6 py-5">
                                        <span class="px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider">Cancelled</span>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="view.php?id=4" class="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-violet-600 hover:border-violet-600 transition-all"><i class="bi bi-eye"></i></a>
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

<script>
function filterAppointments(status, btn) {
    const rows = document.querySelectorAll('.appointment-row');
    
    // Update Tabs UI
    document.querySelectorAll('.status-tab').forEach(t => {
        t.classList.remove('border-violet-600', 'text-violet-600', 'font-bold');
        t.classList.add('border-transparent', 'text-slate-500', 'font-medium');
    });
    btn.classList.add('border-violet-600', 'text-violet-600', 'font-bold');
    btn.classList.remove('border-transparent', 'text-slate-500', 'font-medium');

    // Filtering logic
    rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        const rowDay = row.getAttribute('data-day');
        
        if (status === 'All') {
            row.classList.remove('hidden');
        } else if (status === 'Today') {
            rowDay === 'Today' ? row.classList.remove('hidden') : row.classList.add('hidden');
        } else {
            rowStatus === status ? row.classList.remove('hidden') : row.classList.add('hidden');
        }
    });
}

function markComplete(id, btn) {
    if (confirm('Mark this appointment as completed?')) {
        const row = btn.closest('tr');
        const badge = row.querySelector('.status-badge');
        
        fetch('api/update_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: 'Completed' })
        })
        .then(res => res.json())
        .then(data => {
            badge.textContent = 'Completed';
            badge.classList.remove('bg-blue-50', 'text-blue-600');
            badge.classList.add('bg-green-50', 'text-green-600');
            row.setAttribute('data-status', 'Completed');
            btn.parentElement.innerHTML = '<a href="view.php?id=' + id + '" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-violet-600 hover:border-violet-600 transition-all"><i class="bi bi-eye"></i></a>';
        });

    }
}
</script>

</body>
</html>
