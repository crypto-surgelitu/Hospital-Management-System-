<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['lab', 'admin']);

$id = intval($_GET['id'] ?? 0);

if (!$id) {
    header('Location: queue.php');
    exit;
}

$stmt = $pdo->prepare("
    SELECT lt.*, p.full_name as patient_name, p.patient_id, u.full_name as doctor_name
    FROM lab_tests lt
    JOIN patients p ON lt.patient_id = p.patient_id
    JOIN users u ON lt.requested_by = u.user_id
    WHERE lt.test_id = ?
");
$stmt->execute([$id]);
$test = $stmt->fetch();

if (!$test) {
    header('Location: queue.php');
    exit;
}

$flash_error = $_SESSION['flash_error'] ?? null;
unset($_SESSION['flash_error']);

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

        <script>document.getElementById('page-title').textContent = 'Enter Test Results';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-4xl mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-6 text-sm font-medium">
                    <a href="queue.php" class="text-slate-400 hover:text-cyan-600 transition-colors">Lab Queue</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900">Enter Results</span>
                </nav>

                <!-- Patient Info Bar -->
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 flex flex-wrap items-center justify-between gap-6">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-display font-bold">JK</div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-bold text-ink-900">John Kamau</h3>
                                <span class="text-[10px] font-mono text-slate-400">P-00124</span>
                            </div>
                            <p class="text-xs text-slate-500 font-medium">Requested: Full Blood Count (FBC)</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-10">
                        <div class="hidden sm:block">
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Requested By</p>
                            <p class="text-xs font-bold text-ink-900">Dr. James Ochieng</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-1">Time Elapsed</p>
                            <p class="text-xs font-bold text-ink-900">3h 22m ago</p>
                        </div>
                    </div>
                </div>

                <!-- Result Card -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="p-8 lg:p-10">
                        
                        <form id="result-form" method="POST" action="actions/save_result.php" class="space-y-10">
                            
                            <!-- Status Selector -->
                            <div class="space-y-4">
                                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Test Status</label>
                                <div class="flex items-center gap-3">
                                    <button type="button" onclick="setStatus('Pending', this)" class="status-pill px-6 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold transition-all focus:outline-none bg-white">
                                        Pending
                                    </button>
                                    <button type="button" onclick="setStatus('Processing', this)" class="status-pill px-6 py-3 rounded-xl border-violet-600 bg-violet-600 text-white text-xs font-bold transition-all focus:outline-none shadow-lg shadow-violet-100">
                                        Processing
                                    </button>
                                    <button type="button" onclick="setStatus('Completed', this)" class="status-pill px-6 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold transition-all focus:outline-none bg-white">
                                        Completed
                                    </button>
                                </div>
                                <input type="hidden" name="status" id="test-status-input" value="Processing">
                            </div>

                            <!-- Result Area -->
                            <div class="space-y-4">
                                <div class="flex items-center justify-between pl-1">
                                    <label class="block text-xs font-bold uppercase tracking-widest text-slate-500">Test Results / Clinical Findings</label>
                                    <span class="text-[10px] font-mono text-slate-400">Markdown / Plain Text Supported</span>
                                </div>
                                <textarea name="result" id="test-result-textarea" 
                                    class="w-full p-6 bg-slate-50 border border-transparent focus:border-cyan-500 focus:bg-white rounded-xl outline-none transition-all font-mono text-sm leading-relaxed min-h-[220px]" 
                                    placeholder="Enter clinical findings, values, and observations here..."></textarea>
                            </div>

                            <input type="hidden" name="test_id" value="<?php echo $_GET['id'] ?? '1'; ?>">
                            <input type="hidden" name="technician_id" value="<?php echo $_SESSION['user_id'] ?? '2'; ?>">

                            <!-- Buttons -->
                            <div class="flex items-center gap-4 pt-10 border-t border-surface-dim">
                                <button type="button" class="px-8 py-4 bg-slate-100 text-slate-500 font-bold rounded-custom hover:bg-slate-200 transition-all flex items-center gap-2">
                                    <i class="bi bi-save2"></i>
                                    Save Draft
                                </button>
                                <button type="submit" id="submit-btn" class="flex-1 py-4 bg-cyan-500 text-white font-display font-extrabold rounded-custom hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100 flex items-center justify-center gap-3">
                                    Mark Completed & Notify Doctor
                                    <i class="bi bi-bell-fill text-xs"></i>
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

            </div>
        </main>
    </div>
</div>

<script>
function setStatus(status, btn) {
    const input = document.getElementById('test-status-input');
    const submitBtn = document.getElementById('submit-btn');
    const textarea = document.getElementById('test-result-textarea');
    
    input.value = status;

    // Reset all pills
    document.querySelectorAll('.status-pill').forEach(p => {
        p.className = 'status-pill px-6 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold transition-all focus:outline-none bg-white';
    });

    // Apply active style
    if (status === 'Pending') {
        btn.className = 'status-pill px-6 py-3 rounded-xl border-slate-600 bg-slate-600 text-white text-xs font-bold transition-all focus:outline-none shadow-lg shadow-slate-100';
        submitBtn.className = 'flex-1 py-4 bg-slate-400 text-white font-display font-extrabold rounded-custom cursor-not-allowed opacity-50 flex items-center justify-center gap-2';
        submitBtn.innerHTML = 'Submission Restricted';
        textarea.required = false;
    } else if (status === 'Processing') {
        btn.className = 'status-pill px-6 py-3 rounded-xl border-violet-600 bg-violet-600 text-white text-xs font-bold transition-all focus:outline-none shadow-lg shadow-violet-100';
        submitBtn.className = 'flex-1 py-4 bg-cyan-500 text-white font-display font-extrabold rounded-custom hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100 flex items-center justify-center gap-3';
        submitBtn.innerHTML = 'Mark Completed & Notify Doctor <i class="bi bi-bell-fill text-xs"></i>';
        textarea.required = false;
    } else if (status === 'Completed') {
        btn.className = 'status-pill px-6 py-3 rounded-xl border-green-600 bg-green-600 text-white text-xs font-bold transition-all focus:outline-none shadow-lg shadow-green-100';
        submitBtn.className = 'flex-1 py-4 bg-cyan-500 text-white font-display font-extrabold rounded-custom hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100 flex items-center justify-center gap-3';
        submitBtn.innerHTML = 'Finalize & Notify Doctor <i class="bi bi-check-circle-fill text-xs"></i>';
        textarea.required = true;
    }
}
</script>

</body>
</html>
