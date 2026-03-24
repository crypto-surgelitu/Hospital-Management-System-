<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();

$id = intval($_GET['id'] ?? 0);

if (!$id) {
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare("
    SELECT a.*, p.full_name as patient_name, p.phone as patient_phone, p.gender as patient_gender, 
           p.date_of_birth as patient_dob, u.full_name as doctor_name, u.department as doctor_dept
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    JOIN users u ON a.doctor_id = u.user_id
    WHERE a.appointment_id = ?
");
$stmt->execute([$id]);
$appointment = $stmt->fetch();

if (!$appointment) {
    header('Location: index.php');
    exit;
}

$isClinical = in_array($_SESSION['role'], ['doctor', 'admin']);

require_once 'C:/xampp/htdocs/hms/includes/header.php';
?>

<div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <?php require_once 'C:/xampp/htdocs/hms/includes/sidebar.php'; ?>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        <!-- Topbar -->
        <?php require_once 'C:/xampp/htdocs/hms/includes/topbar.php'; ?>
        
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

        <script>document.getElementById('page-title').textContent = 'Appointment Details';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-5xl mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-6 text-sm font-medium">
                    <a href="index.php" class="text-slate-400 hover:text-violet-600 transition-colors">Appointments</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900">Details</span>
                </nav>

                <!-- Patient Info Bar -->
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center font-display font-bold">
                            GW
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-bold text-ink-900">Grace Wanjiku</h3>
                                <span class="text-[10px] font-mono text-slate-400">P-00123</span>
                            </div>
                            <p class="text-xs text-slate-500 font-medium">Dr. James Ochieng • General Medicine</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="text-right">
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Schedule</p>
                            <p class="text-sm font-bold text-ink-900">20/03/2026 at 09:00</p>
                        </div>
                        <span id="appointment-status" class="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">Scheduled</span>
                    </div>
                </div>

                <!-- Main Details Card -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    
                    <!-- Section 1: Appointment Info -->
                    <div class="p-8 border-b border-surface-dim">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 px-1">Appointment Information</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Patient</p>
                                <p class="text-sm font-bold text-ink-900">Grace Wanjiku (P-00123)</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Physician</p>
                                <p class="text-sm font-bold text-ink-900">Dr. James Ochieng</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Appointment Time</p>
                                <p class="text-sm font-bold text-ink-900">Friday, 20/03/2026 — 09:00</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority</p>
                                <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">Normal</span>
                            </div>
                            <div class="md:col-span-2">
                                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reason for Visit</p>
                                <p class="text-sm text-slate-700 leading-relaxed font-medium">Headache and fever for 3 days. Patient reports intermittent chills and body aches.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Section 2: Consultation Notes (Clinical Roles Only) -->
                    <?php if ($isClinical): ?>
                    <div class="p-8 bg-slate-50/50 border-b border-surface-dim">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Consultation Notes</h4>
                            <span class="text-[10px] text-slate-400 font-mono tracking-tighter">Clinical Record Only</span>
                        </div>
                        <textarea id="consult-notes" rows="6" class="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 transition-all font-mono text-sm leading-relaxed" placeholder="Enter consultation notes, diagnosis, and treatment plan..."></textarea>
                        <div class="flex justify-end mt-4">
                            <button onclick="saveNotes()" id="save-notes-btn" class="px-6 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2">
                                <i class="bi bi-journal-text"></i>
                                Save Notes
                            </button>
                        </div>
                    </div>

                    <!-- Section 3: Actions -->
                    <div class="p-8 flex items-center gap-4">
                        <button onclick="updateStatus('Completed', this)" class="flex-1 py-3.5 border border-green-200 text-green-600 bg-green-50 rounded-custom font-display font-bold hover:bg-green-600 hover:text-white transition-all shadow-sm">
                            Mark as Completed
                        </button>
                        <button onclick="cancelAppointment(this)" class="px-10 py-3.5 border border-red-100 text-red-500 bg-red-50/50 rounded-custom font-display font-bold hover:bg-red-500 hover:text-white transition-all">
                            Cancel Appointment
                        </button>
                    </div>
                    <?php endif; ?>

                </div>

            </div>
        </main>
    </div>
</div>

<script>
const appointmentId = 1;

function saveNotes() {
    const btn = document.getElementById('save-notes-btn');
    const notes = document.getElementById('consult-notes').value;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-arrow-repeat animate-spin"></i> Saving...';

    fetch('api/save_notes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId, notes: notes })
    })
    .then(res => res.json())
    .then(data => {
        btn.innerHTML = '<i class="bi bi-check2"></i> Saved';
        btn.className = 'px-6 py-2 bg-green-50 text-green-600 font-bold text-xs rounded-lg transition-all flex items-center gap-2';
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-journal-text"></i> Save Notes';
            btn.className = 'px-6 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2';
        }, 2000);
    });

}

function updateStatus(status, btn) {
    if (confirm(`Are you sure you want to mark this appointment as ${status}?`)) {
        btn.disabled = true;
        const statusBadge = document.getElementById('appointment-status');

        fetch('api/update_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: appointmentId, status: status })
        })
        .then(res => res.json())
        .then(data => {
            statusBadge.textContent = status;
            statusBadge.className = 'px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider';
            btn.parentElement.classList.add('hidden');
        });

    }
}

function cancelAppointment(btn) {
    if (confirm('Are you sure you want to CANCEL this appointment? This action cannot be undone.')) {
        btn.disabled = true;
        const statusBadge = document.getElementById('appointment-status');

        fetch('api/update_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: appointmentId, status: 'Cancelled' })
        })
        .then(res => res.json())
        .then(data => {
            statusBadge.textContent = 'Cancelled';
            statusBadge.className = 'px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider';
            btn.parentElement.classList.add('hidden');
        });

    }
}
</script>

</body>
</html>
