<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();

$id = intval($_GET['id'] ?? 0);

if (!$id) {
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM patients WHERE patient_id = ? AND is_active = 1");
$stmt->execute([$id]);
$patient = $stmt->fetch();

if (!$patient) {
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare("
    SELECT a.*, u.full_name as doctor_name 
    FROM appointments a 
    JOIN users u ON a.doctor_id = u.user_id 
    WHERE a.patient_id = ? 
    ORDER BY a.appointment_date DESC
");
$stmt->execute([$id]);
$appointments = $stmt->fetchAll();

$stmt = $pdo->prepare("
    SELECT lt.*, u.full_name as requested_by_name 
    FROM lab_tests lt 
    JOIN users u ON lt.requested_by = u.user_id 
    WHERE lt.patient_id = ? 
    ORDER BY lt.date_requested DESC
");
$stmt->execute([$id]);
$lab_tests = $stmt->fetchAll();

$stmt = $pdo->prepare("
    SELECT dis.*, d.drug_name, u.full_name as pharmacist_name 
    FROM dispensing dis 
    JOIN drugs d ON dis.drug_id = d.drug_id 
    JOIN users u ON dis.pharmacist_id = u.user_id 
    WHERE dis.patient_id = ? 
    ORDER BY dis.dispense_date DESC
");
$stmt->execute([$id]);
$dispensing = $stmt->fetchAll();

$stmt = $pdo->prepare("SELECT * FROM bills WHERE patient_id = ? ORDER BY bill_date DESC");
$stmt->execute([$id]);
$bills = $stmt->fetchAll();

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
        <script>document.getElementById('page-title').textContent = 'Patient Profile';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-7xl mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-6 text-sm font-medium">
                    <a href="index.php" class="text-slate-400 hover:text-blue-600 transition-colors">Patients</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900">John Kamau</span>
                </nav>

                <div class="flex flex-col lg:flex-row gap-6">
                    <!-- Left Strip: Profile Summary -->
                    <aside class="w-full lg:w-[280px] shrink-0">
                        <div class="bg-white rounded-card ghost-border shadow-card p-6 flex flex-col items-center text-center">
                            <!-- Avatar -->
                            <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-3xl font-display font-bold text-white mb-4 shadow-lg shadow-blue-200">
                                JK
                            </div>
                            
                            <!-- ID & Name -->
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Patient ID</p>
                            <h3 class="font-mono text-lg font-bold text-blue-600 mb-1">P-00124</h3>
                            <h2 class="text-xl font-display font-extrabold text-ink-900 mb-6">John Kamau</h2>
                            
                            <hr class="w-full border-surface-dim mb-6">
                            
                            <!-- Data Rows -->
                            <div class="w-full space-y-4 text-left">
                                <div class="flex items-center gap-3">
                                    <i class="bi bi-gender-ambiguous text-slate-400"></i>
                                    <div>
                                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Gender</p>
                                        <p class="text-sm font-bold text-ink-900">Male</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i class="bi bi-calendar3 text-slate-400"></i>
                                    <div>
                                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Age</p>
                                        <p class="text-sm font-bold text-ink-900">34 years</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i class="bi bi-telephone text-slate-400"></i>
                                    <div>
                                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Phone</p>
                                        <p class="text-sm font-bold text-ink-900">0712 345 678</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i class="bi bi-envelope text-slate-400"></i>
                                    <div>
                                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Email</p>
                                        <p class="text-sm font-bold text-ink-900 truncate max-w-[160px]">john.kamau@email.com</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i class="bi bi-geo-alt text-slate-400"></i>
                                    <div>
                                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Address</p>
                                        <p class="text-sm font-bold text-ink-900">Meru Town, Kenya</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i class="bi bi-card-text text-slate-400"></i>
                                    <div>
                                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Natl. ID</p>
                                        <p class="text-sm font-bold text-ink-900">12345678</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i class="bi bi-clock text-slate-400"></i>
                                    <div>
                                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Registered</p>
                                        <p class="text-sm font-bold text-ink-900">15/03/2026</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Actions -->
                            <a href="edit.php?id=124" class="w-full mt-8 py-3.5 bg-slate-50 border border-surface-dim text-ink-900 font-bold text-sm rounded-custom hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                                <i class="bi bi-pencil-square"></i>
                                Edit Details
                            </a>
                        </div>
                    </aside>

                    <!-- Right Area: Tabs & Records -->
                    <div class="flex-1 flex flex-col gap-6 min-w-0">
                        <!-- Tab Bar -->
                        <div class="bg-white rounded-card ghost-border shadow-sm px-2 overflow-x-auto no-scrollbar">
                            <div class="flex items-center">
                                <button onclick="switchTab('overview', this)" class="tab-btn px-6 py-4 border-b-2 border-blue-600 text-blue-600 font-bold text-sm whitespace-nowrap transition-all">
                                    Overview
                                </button>
                                <button onclick="switchTab('appointments', this)" class="tab-btn px-6 py-4 border-b-2 border-transparent text-slate-500 font-medium text-sm whitespace-nowrap hover:text-ink-900 transition-all flex items-center gap-2">
                                    Appointments
                                    <span class="w-5 h-5 flex items-center justify-center bg-slate-100 text-[10px] font-bold rounded-full">0</span>
                                </button>
                                <button onclick="switchTab('lab', this)" class="tab-btn px-6 py-4 border-b-2 border-transparent text-slate-500 font-medium text-sm whitespace-nowrap hover:text-ink-900 transition-all flex items-center gap-2">
                                    Lab Results
                                    <span class="w-5 h-5 flex items-center justify-center bg-slate-100 text-[10px] font-bold rounded-full text-slate-400">0</span>
                                </button>
                                <button onclick="switchTab('dispensing', this)" class="tab-btn px-6 py-4 border-b-2 border-transparent text-slate-500 font-medium text-sm whitespace-nowrap hover:text-ink-900 transition-all flex items-center gap-2">
                                    Dispensing
                                    <span class="w-5 h-5 flex items-center justify-center bg-slate-100 text-[10px] font-bold rounded-full text-slate-400">0</span>
                                </button>
                                <button onclick="switchTab('billing', this)" class="tab-btn px-6 py-4 border-b-2 border-transparent text-slate-500 font-medium text-sm whitespace-nowrap hover:text-ink-900 transition-all flex items-center gap-2">
                                    Billing
                                    <span class="w-5 h-5 flex items-center justify-center bg-slate-100 text-[10px] font-bold rounded-full text-slate-400">0</span>
                                </button>
                            </div>
                        </div>

                        <!-- Tab Panels -->
                        <div id="tab-overview" class="tab-panel animate-fade-up">
                            <div class="bg-white rounded-card ghost-border shadow-card p-8">
                                <h3 class="font-display font-bold text-lg text-ink-900 mb-4">Patient Overview</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Registration Notes</p>
                                        <div class="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <p class="text-sm text-slate-500 italic">No special conditions or notes were recorded during initial registration on 15/03/2026.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Primary Department</p>
                                        <p class="text-sm font-bold text-ink-900">General Consultation</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="tab-appointments" class="tab-panel hidden animate-fade-up">
                            <div class="bg-white rounded-card ghost-border shadow-card p-12 flex flex-col items-center justify-center text-center">
                                <div class="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                    <i class="bi bi-calendar-x text-3xl"></i>
                                </div>
                                <h4 class="font-bold text-ink-900 mb-1">No appointments yet</h4>
                                <p class="text-sm text-slate-400 max-w-xs">There are no future or past clinical appointments scheduled for this patient.</p>
                            </div>
                        </div>

                        <div id="tab-lab" class="tab-panel hidden animate-fade-up">
                            <div class="bg-white rounded-card ghost-border shadow-card p-12 flex flex-col items-center justify-center text-center">
                                <div class="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                    <i class="bi bi-droplet text-3xl"></i>
                                </div>
                                <h4 class="font-bold text-ink-900 mb-1">No lab tests yet</h4>
                                <p class="text-sm text-slate-400 max-w-xs">No laboratory diagnostics have been requested or finalized for John Kamau.</p>
                            </div>
                        </div>

                        <div id="tab-dispensing" class="tab-panel hidden animate-fade-up">
                            <div class="bg-white rounded-card ghost-border shadow-card p-12 flex flex-col items-center justify-center text-center">
                                <div class="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                    <i class="bi bi-capsule text-3xl"></i>
                                </div>
                                <h4 class="font-bold text-ink-900 mb-1">No dispensing records yet</h4>
                                <p class="text-sm text-slate-400 max-w-xs">Pharmacy records show no drugs have been dispensed to this patient.</p>
                            </div>
                        </div>

                        <div id="tab-billing" class="tab-panel hidden animate-fade-up">
                            <div class="bg-white rounded-card ghost-border shadow-card p-12 flex flex-col items-center justify-center text-center">
                                <div class="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                    <i class="bi bi-receipt text-3xl"></i>
                                </div>
                                <h4 class="font-bold text-ink-900 mb-1">No billing records yet</h4>
                                <p class="text-sm text-slate-400 max-w-xs">No invoices or statements have been generated for current or past visits.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>
</div>

<script>
function switchTab(tabId, btn) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
    // Show clicked panel
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    
    // Reset all buttons
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('border-blue-600', 'text-blue-600', 'font-bold');
        b.classList.add('border-transparent', 'text-slate-500', 'font-medium');
    });
    // Set active button
    btn.classList.remove('border-transparent', 'text-slate-500', 'font-medium');
    btn.classList.add('border-blue-600', 'text-blue-600', 'font-bold');
}
</script>

</body>
</html>
