<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();

$stmt = $pdo->prepare("
    SELECT b.*, p.full_name as patient_name 
    FROM bills b
    JOIN patients p ON b.patient_id = p.patient_id
    ORDER BY b.bill_date DESC
");
$stmt->execute();
$bills = $stmt->fetchAll();

$outstanding_stmt = $pdo->prepare("SELECT SUM(total_amount - amount_paid) FROM bills WHERE payment_status != 'Paid'");
$outstanding_stmt->execute();
$outstanding = $outstanding_stmt->fetchColumn() ?: 0;

$paid_today_stmt = $pdo->prepare("SELECT SUM(amount_paid) FROM bills WHERE payment_status = 'Paid' AND bill_date = CURDATE()");
$paid_today_stmt->execute();
$paid_today = $paid_today_stmt->fetchColumn() ?: 0;

$total_bills = count($bills);

$unpaid_stmt = $pdo->prepare("SELECT SUM(total_amount - amount_paid) FROM bills WHERE payment_status = 'Unpaid'");
$unpaid_stmt->execute();
$unpaid_kes = $unpaid_stmt->fetchColumn() ?: 0;

$counts = [
    'All' => $total_bills,
    'Unpaid' => 0,
    'Partial' => 0,
    'Paid' => 0
];
foreach ($bills as $b) {
    if (isset($counts[$b['payment_status']])) {
        $counts[$b['payment_status']]++;
    }
}

$totals = [
    'outstanding' => $outstanding,
    'paid_today' => $paid_today,
    'total' => $total_bills,
];

$flash_success = $_SESSION['flash_success'] ?? null;
unset($_SESSION['flash_success']);

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

        <script>document.getElementById('page-title').textContent = 'Billing';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-7xl mx-auto animate-fade-up">
                
                <!-- Summary Totals Bar -->
                <div class="bg-white rounded-card ghost-border shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6" 
                     id="billing-stats" data-outstanding="<?= $totals['outstanding'] ?>" data-paid-today="<?= $totals['paid_today'] ?>" data-total="<?= $totals['total'] ?>">
                    <div class="flex-1 flex flex-col items-center md:items-start">
                        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Outstanding</p>
                        <h3 class="text-2xl font-display font-extrabold text-red-500" id="stat-outstanding"><?= formatKES($totals['outstanding']) ?></h3>
                    </div>
                    <div class="hidden md:block w-px h-12 bg-slate-100"></div>
                    <div class="flex-1 flex flex-col items-center">
                        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Paid Today</p>
                        <h3 class="text-2xl font-display font-extrabold text-emerald-500" id="stat-paid"><?= formatKES($totals['paid_today']) ?></h3>
                    </div>
                    <div class="hidden md:block w-px h-12 bg-slate-100"></div>
                    <div class="flex-1 flex flex-col items-center md:items-end text-right">
                        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Invoices</p>
                        <h3 class="text-2xl font-display font-extrabold text-ink-900" id="stat-total"><?= $totals['total'] ?></h3>
                    </div>
                </div>

                <!-- Tab Bar & Actions -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center bg-white p-1 rounded-xl ghost-border overflow-x-auto no-scrollbar">
                        <button onclick="filterBilling('All', this)" class="px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-amber-500 text-white shadow-lg shadow-amber-100 transition-all tab-btn active">All (<?= $counts['All'] ?>)</button>
                        <button onclick="filterBilling('Unpaid', this)" class="px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg text-slate-500 hover:bg-slate-50 transition-all tab-btn">Unpaid (<?= $counts['Unpaid'] ?? 0 ?>)</button>
                        <button onclick="filterBilling('Partial', this)" class="px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg text-slate-500 hover:bg-slate-50 transition-all tab-btn">Partial (<?= $counts['Partial'] ?? 0 ?>)</button>
                        <button onclick="filterBilling('Paid', this)" class="px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg text-slate-500 hover:bg-slate-50 transition-all tab-btn">Paid (<?= $counts['Paid'] ?? 0 ?>)</button>
                    </div>
                    <a href="create.php" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F59E0B] text-white font-display font-bold rounded-custom hover:bg-[#D97706] transition-all shadow-lg shadow-amber-100">
                        <i class="bi bi-plus-circle"></i>
                        New Invoice
                    </a>
                </div>

                <!-- Data Table -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-surface-dim">
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Invoice #</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Patient</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Bill</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Amt Paid</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">View</th>
                                </tr>
                            </thead>
                            <tbody id="billing-table-body" class="divide-y divide-surface-dim">
                                <?php if (empty($bills)): ?>
                                <tr><td colspan="7" class="px-6 py-12 text-center text-slate-400">No billing records found</td></tr>
                                <?php else: foreach ($bills as $b): 
                                    $status_color = match($b['payment_status']) {
                                        'Paid' => 'emerald',
                                        'Partial' => 'amber',
                                        'Unpaid' => 'red',
                                        default => 'slate'
                                    };
                                ?>
                                <tr class="hover:bg-slate-50/50 transition-colors billing-row" data-status="<?= $b['payment_status'] ?>">
                                    <td class="px-6 py-5">
                                        <span class="text-[11px] font-mono font-bold text-slate-400">INV-<?= str_pad($b['bill_id'], 5, '0', STR_PAD_LEFT) ?></span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900"><?= htmlspecialchars($b['patient_name']) ?></span>
                                            <span class="text-[10px] font-mono text-slate-400 uppercase"><?= formatPatientID($b['patient_id']) ?></span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500"><?= formatDate($b['bill_date']) ?></td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900"><?= formatKES($b['total_amount']) ?></td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-400"><?= formatKES($b['amount_paid']) ?></td>
                                    <td class="px-6 py-5">
                                        <span class="px-2.5 py-1 rounded-full bg-<?= $status_color ?>-50 text-<?= $status_color ?>-600 text-[10px] font-bold uppercase tracking-wider"><?= $b['payment_status'] ?></span>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="/hms/modules/billing/view.php?id=<?= $b['bill_id'] ?>" class="text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors">Details</a>
                                    </td>
                                </tr>
                                <?php endforeach; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    </div>
</div>

<script>
function formatKES(amount) {
    return 'KES ' + Number(amount).toLocaleString('en-KE');
}

function initBillingStats() {
    const stats = document.getElementById('billing-stats');
    const outstanding = stats.getAttribute('data-outstanding');
    const paid = stats.getAttribute('data-paid-today');
    const total = stats.getAttribute('data-total');

    document.getElementById('stat-outstanding').textContent = formatKES(outstanding);
    document.getElementById('stat-paid').textContent = formatKES(paid);
    document.getElementById('stat-total').textContent = total;
}

function filterBilling(status, btn) {
    const rows = document.querySelectorAll('.billing-row');
    const btns = document.querySelectorAll('.tab-btn');

    // Toggle Button UI
    btns.forEach(b => {
        b.className = 'px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg text-slate-500 hover:bg-slate-50 transition-all tab-btn';
    });
    btn.className = 'px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-amber-500 text-white shadow-lg shadow-amber-100 transition-all tab-btn active';

    // Filter Rows
    rows.forEach(row => {
        if (status === 'All' || row.getAttribute('data-status') === status) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
}

// Initialize
initBillingStats();
</script>

</body>
</html>
