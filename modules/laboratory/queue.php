<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['lab', 'admin']);

$stmt = $pdo->prepare("
    SELECT lt.*, p.full_name as patient_name, p.patient_id, u.full_name as doctor_name, lt.date_requested, lt.date_requested
    FROM lab_tests lt
    JOIN patients p ON lt.patient_id = p.patient_id
    JOIN users u ON lt.requested_by = u.user_id
    WHERE lt.status IN ('Pending', 'Processing')
    ORDER BY lt.date_requested ASC, lt.date_requested ASC
");
$stmt->execute();
$queue = $stmt->fetchAll();

$completed_today = $pdo->prepare("SELECT COUNT(*) FROM lab_tests WHERE status = 'Completed' AND date_processed = CURDATE()");
$completed_today->execute();
$completed_today = $completed_today->fetchColumn();

$pending_count = count(array_filter($queue, fn($t) => $t['status'] === 'Pending'));
$processing_count = count(array_filter($queue, fn($t) => $t['status'] === 'Processing'));

$flash_success = $_SESSION['flash_success'] ?? null;
$flash_error = $_SESSION['flash_error'] ?? null;
unset($_SESSION['flash_success'], $_SESSION['flash_error']);

require_once 'C:/xampp/htdocs/hms/includes/header.php';
?>

<style>
@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
.pulse-urgent {
  animation: pulse-red 2s infinite;
}
</style>

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

        <script>document.getElementById('page-title').textContent = 'Test Queue';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-6xl mx-auto animate-fade-up">
                
                <!-- Stat Bar -->
                <div class="bg-white rounded-card ghost-border shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-surface-dim mb-8">
                    <div class="flex-1 p-6 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pending Tests</p>
                            <h3 class="text-2xl font-display font-extrabold text-amber-500">7</h3>
                        </div>
                        <div class="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
                            <i class="bi bi-hourglass-top text-xl"></i>
                        </div>
                    </div>
                    <div class="flex-1 p-6 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Processing</p>
                            <h3 class="text-2xl font-display font-extrabold text-violet-500">2</h3>
                        </div>
                        <div class="w-10 h-10 bg-violet-50 text-violet-500 rounded-lg flex items-center justify-center">
                            <i class="bi bi-gear-wide-connected text-xl"></i>
                        </div>
                    </div>
                    <div class="flex-1 p-6 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Completed Today</p>
                            <h3 class="text-2xl font-display font-extrabold text-green-500">18</h3>
                        </div>
                        <div class="w-10 h-10 bg-green-50 text-green-500 rounded-lg flex items-center justify-center">
                            <i class="bi bi-check2-all text-xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-1">
                    <div>
                        <h4 class="text-sm font-bold text-ink-900">7 tests pending <span class="text-slate-300 mx-2">•</span> <span class="text-slate-500 font-medium text-xs">2 processing</span></h4>
                    </div>
                    <div class="flex items-center bg-white p-1 rounded-xl border border-surface-dim shadow-sm">
                        <button onclick="sortQueue('oldest')" class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-slate-100 text-ink-900 shadow-sm transition-all" id="sort-oldest">Oldest First</button>
                        <button onclick="sortQueue('newest')" class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg text-slate-500 hover:bg-slate-50 transition-all" id="sort-newest">Newest First</button>
                    </div>
                </div>

                <!-- Queue Cards Container -->
                <div id="queue-container" class="space-y-4 mb-12">
                    <?php if (empty($queue)): ?>
                    <div class="bg-white rounded-card ghost-border p-12 text-center">
                        <div class="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="bi bi-inbox text-3xl"></i>
                        </div>
                        <p class="text-slate-400 font-medium tracking-tight">The test queue is currently empty</p>
                    </div>
                    <?php else: foreach ($queue as $t): 
                        $is_processing = $t['status'] === 'Processing';
                        $status_badge_class = $is_processing ? 'bg-violet-50 text-violet-600' : 'bg-amber-50 text-amber-600';
                        $icon_class = match($t['test_type']) {
                            'Full Blood Count (FBC)', 'FBC' => 'bi-droplet',
                            'Malaria RDT', 'Malaria' => 'bi-virus',
                            'Urinalysis' => 'bi-palette',
                            'Blood Glucose' => 'bi-activity',
                            default => 'bi-clipboard-pulse'
                        };
                    ?>
                    <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden queue-card" 
                         data-requested-at="<?= $t['date_requested'] ?>T00:00:00">
                        <div class="flex items-center gap-0">
                            <div class="w-1.5 self-stretch <?= $is_processing ? 'bg-violet-500' : 'urgency-border' ?>"></div>
                            <div class="flex-1 p-5 flex flex-wrap items-center justify-between gap-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-xl <?= $is_processing ? 'bg-violet-50 text-violet-500' : 'bg-slate-50 text-slate-400' ?> flex items-center justify-center">
                                        <i class="bi <?= $icon_class ?> text-xl"></i>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h4 class="text-sm font-bold text-ink-900"><?= htmlspecialchars($t['patient_name']) ?></h4>
                                            <span class="text-[10px] font-mono text-slate-400 uppercase tracking-tighter"><?= formatPatientID($t['patient_id']) ?></span>
                                        </div>
                                        <p class="text-[10px] text-slate-500 font-medium">Requested by Dr. <?= htmlspecialchars(explode(' ', $t['doctor_name'])[1] ?? $t['doctor_name']) ?></p>
                                    </div>
                                </div>
                                <div class="flex-1 md:px-8">
                                    <div class="flex items-center gap-3">
                                        <h3 class="text-lg font-display font-bold text-ink-900"><?= htmlspecialchars($t['test_type']) ?></h3>
                                        <span class="px-2 py-0.5 rounded <?= $status_badge_class ?> text-[10px] font-bold uppercase tracking-wider status-badge"><?= $t['status'] ?></span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-6">
                                    <?php if ($is_processing): ?>
                                    <div class="text-right">
                                        <p class="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-0.5">Active</p>
                                        <p class="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">In Progress</p>
                                    </div>
                                    <a href="/hms/modules/laboratory/result.php?id=<?= $t['test_id'] ?>" class="px-5 py-2.5 bg-violet-500 text-white text-xs font-bold rounded-lg hover:bg-violet-600 transition-all shadow-md shadow-violet-100 flex items-center gap-2">
                                        Enter Result
                                        <i class="bi bi-clipboard2-check"></i>
                                    </a>
                                    <?php else: ?>
                                    <div class="text-right">
                                        <p class="text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-0.5 elapsed-time">--</p>
                                        <p class="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">Waiting Time</p>
                                    </div>
                                    <button onclick="processTest(<?= $t['test_id'] ?>, this)" class="px-5 py-2.5 bg-cyan-500 text-white text-xs font-bold rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-100 flex items-center gap-2">
                                        Process Test
                                        <i class="bi bi-arrow-right"></i>
                                    </button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; endif; ?>
                </div>

                <!-- Completed Today Section -->
                <div class="mt-12">
                    <button onclick="toggleCompleted()" class="flex items-center gap-3 text-slate-400 hover:text-ink-900 transition-all group">
                        <i id="completed-chevron" class="bi bi-chevron-right transition-transform"></i>
                        <span class="text-xs font-bold uppercase tracking-widest">Show Completed Today (18)</span>
                    </button>
                    <div id="completed-section" class="hidden mt-6 animate-fade-down">
                        <div class="bg-white rounded-card ghost-border shadow-sm overflow-hidden">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50 border-b border-surface-dim">
                                    <tr>
                                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Patient</th>
                                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Test Type</th>
                                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Result Summary</th>
                                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Completed At</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-surface-dim">
                                    <tr class="hover:bg-slate-50/50 transition-colors">
                                        <td class="px-6 py-4 text-xs font-bold text-ink-900 uppercase tracking-tighter">David Mutua P-00125</td>
                                        <td class="px-6 py-4 text-xs font-medium text-slate-600">HIV Test</td>
                                        <td class="px-6 py-4 text-xs text-slate-400 font-mono italic">Non-reactive (Negative)</td>
                                        <td class="px-6 py-4 text-xs font-medium text-slate-500 text-right">14:22</td>
                                    </tr>
                                    <tr class="hover:bg-slate-50/50 transition-colors">
                                        <td class="px-6 py-4 text-xs font-bold text-ink-900 uppercase tracking-tighter">Mary Achieng P-00126</td>
                                        <td class="px-6 py-4 text-xs font-medium text-slate-600">FBC</td>
                                        <td class="px-6 py-4 text-xs text-slate-400 font-mono italic">Normal parameters...</td>
                                        <td class="px-6 py-4 text-xs font-medium text-slate-500 text-right">13:05</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>
</div>

<script>
function calculateElapsed() {
    const cards = document.querySelectorAll('.queue-card');
    const now = new Date();

    cards.forEach(card => {
        const requestedAt = new Date(card.getAttribute('data-requested-at'));
        const diffMs = now - requestedAt;
        const diffHrs = diffMs / (1000 * 60 * 60);
        const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
        const totalHrs = Math.floor(diffHrs);

        const timeLabel = card.querySelector('.elapsed-time');
        const border = card.querySelector('.urgency-border');
        const cardBody = card;

        if (timeLabel) {
            timeLabel.textContent = totalHrs > 0 ? `${totalHrs}h ${diffMins}m ago` : `${diffMins}m ago`;
        }

        // Processing status (violet) overrides urgency border logic
        const statusBadge = card.querySelector('.status-badge');
        if (statusBadge && statusBadge.textContent.trim() === 'Processing') return;

        if (border) {
            border.className = 'w-1.5 self-stretch urgency-border ';
            cardBody.classList.remove('pulse-urgent');
            
            if (diffHrs > 4) {
                border.classList.add('bg-red-400');
                cardBody.classList.add('pulse-urgent');
            } else if (diffHrs >= 1) {
                border.classList.add('bg-amber-400');
            } else {
                border.classList.add('bg-green-400');
            }
        }
    });
}

function sortQueue(method) {
    const container = document.getElementById('queue-container');
    const cards = Array.from(container.querySelectorAll('.queue-card'));
    
    // Toggle Button UI
    document.getElementById('sort-oldest').className = method === 'oldest' ? 'px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-slate-100 text-ink-900 shadow-sm transition-all' : 'px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg text-slate-500 hover:bg-slate-50 transition-all';
    document.getElementById('sort-newest').className = method === 'newest' ? 'px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-slate-100 text-ink-900 shadow-sm transition-all' : 'px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg text-slate-500 hover:bg-slate-50 transition-all';

    cards.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-requested-at'));
        const dateB = new Date(b.getAttribute('data-requested-at'));
        return method === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    cards.forEach(card => container.appendChild(card));
}

function processTest(id, btn) {
    const card = btn.closest('.queue-card');
    const border = card.querySelector('.urgency-border');
    const badge = card.querySelector('.status-badge');
    
    fetch('api/process.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        if (border) {
            border.className = 'w-1.5 self-stretch bg-violet-500';
            card.classList.remove('pulse-urgent');
        }
        badge.textContent = 'Processing';
        badge.className = 'px-2 py-0.5 rounded bg-violet-50 text-violet-600 text-[10px] font-bold uppercase tracking-wider status-badge';
        
        btn.parentElement.innerHTML = `
            <div class="text-right">
                <p class="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-0.5">Active</p>
                <p class="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">In Progress</p>
            </div>
            <a href="result.php?id=${id}" class="px-5 py-2.5 bg-violet-500 text-white text-xs font-bold rounded-lg hover:bg-violet-600 transition-all shadow-md shadow-violet-100 flex items-center gap-2">
                Enter Result
                <i class="bi bi-clipboard2-check"></i>
            </a>
        `;
    });

}

function toggleCompleted() {
    const section = document.getElementById('completed-section');
    const chevron = document.getElementById('completed-chevron');
    section.classList.toggle('hidden');
    chevron.classList.toggle('rotate-90');
}

// Initialize
calculateElapsed();
setInterval(calculateElapsed, 60000); // Update every minute
</script>

</body>
</html>
