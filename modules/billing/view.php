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
    SELECT b.*, p.full_name as patient_name, u.full_name as generated_by_name
    FROM bills b
    JOIN patients p ON b.patient_id = p.patient_id
    JOIN users u ON b.generated_by = u.user_id
    WHERE b.bill_id = ?
");
$stmt->execute([$id]);
$bill = $stmt->fetch();

if (!$bill) {
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM bill_items WHERE bill_id = ? ORDER BY item_id ASC");
$stmt->execute([$id]);
$items = $stmt->fetchAll();

$flash_success = $_SESSION['flash_success'] ?? null;
unset($_SESSION['flash_success']);

require_once 'C:/xampp/htdocs/hms/includes/header.php';
?>

<style>
@keyframes pulse-dot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #EF4444;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

@media print {
  .sidebar, .topbar, .no-print, #payment-modal { display: none !important; }
  .lg\:pl-\[260px\] { padding-left: 0 !important; }
  main { padding: 0 !important; }
  .invoice-card { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; }
  body { background: white !important; }
}
</style>

<div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <?php require_once 'C:/xampp/htdocs/hms/includes/sidebar.php'; ?>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        <!-- Topbar -->
        <?php require_once 'C:/xampp/htdocs/hms/includes/topbar.php'; ?>
        <script>document.getElementById('page-title').textContent = 'Invoice';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-4xl mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-6 text-sm font-medium no-print">
                    <a href="index.php" class="text-slate-400 hover:text-amber-600 transition-colors">Billing</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900 font-mono">INV-00247</span>
                </nav>

                <!-- Invoice Card -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden invoice-card mb-12">
                    <div class="p-10 lg:p-16">
                        
                        <!-- Header -->
                        <div class="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                            <div>
                                <h2 class="text-xl font-display font-extrabold text-ink-900 tracking-tight">MERU LEVEL 5 HOSPITAL</h2>
                                <p class="text-xs text-slate-400 font-medium">Meru County, Kenya <br> P.O. Box 8, Meru</p>
                            </div>
                            <div class="text-left md:text-right">
                                <h3 class="text-lg font-mono font-bold text-ink-900">Invoice #INV-00247</h3>
                                <p class="text-xs text-slate-400 font-medium mt-1">Date: 20/03/2026</p>
                            </div>
                        </div>

                        <div class="h-px bg-slate-100 w-full mb-12"></div>

                        <!-- Patient Info & Status -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">BILLED TO</p>
                                <h4 class="text-lg font-bold text-ink-900 mb-1">John Kamau</h4>
                                <p class="text-sm font-mono text-slate-400 mb-1">P-00124</p>
                                <p class="text-sm text-slate-500 font-medium">+254 712 345 678</p>
                            </div>
                            <div class="flex flex-col items-start md:items-end justify-center">
                                <div class="flex items-center gap-3 mb-3">
                                    <span class="pulse-dot"></span>
                                    <span class="px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest border border-red-100">Unpaid</span>
                                </div>
                                <h2 class="text-3xl font-display font-black text-red-600 tracking-tighter" id="invoice-total-display">KES 1,450.00</h2>
                            </div>
                        </div>

                        <!-- Line Items -->
                        <div class="overflow-x-auto mb-16">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50/50 border-y border-slate-100">
                                    <tr>
                                        <th class="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</th>
                                        <th class="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Qty</th>
                                        <th class="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Unit Price</th>
                                        <th class="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-50">
                                    <tr>
                                        <td class="px-4 py-5 text-sm font-bold text-ink-900">Consultation Fee</td>
                                        <td class="px-4 py-5 text-sm text-slate-500 text-center">1</td>
                                        <td class="px-4 py-5 text-sm text-slate-500 text-right italic font-mono">500.00</td>
                                        <td class="px-4 py-5 text-sm font-bold text-ink-900 text-right font-mono">500.00</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-5 text-sm font-bold text-ink-900">Full Blood Count (Lab)</td>
                                        <td class="px-4 py-5 text-sm text-slate-500 text-center">1</td>
                                        <td class="px-4 py-5 text-sm text-slate-500 text-right italic font-mono">800.00</td>
                                        <td class="px-4 py-5 text-sm font-bold text-ink-900 text-right font-mono">800.00</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-5 text-sm font-bold text-ink-900">Amoxicillin 500mg (Pharmacy)</td>
                                        <td class="px-4 py-5 text-sm text-slate-500 text-center">10</td>
                                        <td class="px-4 py-5 text-sm text-slate-500 text-right italic font-mono">15.00</td>
                                        <td class="px-4 py-5 text-sm font-bold text-ink-900 text-right font-mono">150.00</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" class="px-4 py-6 text-right text-xs font-medium text-slate-400">Subtotal</td>
                                        <td class="px-4 py-6 text-right text-sm font-bold text-slate-500 font-mono italic">KES 1,450.00</td>
                                    </tr>
                                    <tr class="border-t-2 border-slate-900">
                                        <td colspan="3" class="px-4 py-8 text-right text-sm font-bold uppercase tracking-widest text-ink-900">TOTAL DUE</td>
                                        <td class="px-4 py-8 text-right text-xl font-display font-black text-ink-900">KES 1,450.00</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Footer Actions -->
                        <div class="flex flex-wrap items-center justify-end gap-4 no-print border-t border-slate-100 pt-10">
                            <button onclick="window.print()" class="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
                                <i class="bi bi-printer"></i>
                                Print Invoice
                            </button>
                            <button class="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2">
                                <i class="bi bi-plus-lg"></i>
                                Add Line Item
                            </button>
                            <button onclick="openPaymentModal()" class="px-10 py-3 bg-amber-500 text-white font-display font-extrabold rounded-xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 flex items-center gap-2">
                                <i class="bi bi-wallet2"></i>
                                Record Payment
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </main>
    </div>
</div>

<!-- PAYMENT MODAL -->
<div id="payment-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onclick="closePaymentModal()"></div>
    <div class="bg-white rounded-[24px] shadow-2xl shadow-slate-900/20 w-full max-w-md relative z-10 animate-zoom-in overflow-hidden">
        <div class="p-8">
            <div class="flex items-center justify-between mb-8">
                <h3 class="text-xl font-display font-bold text-ink-900">Record Payment</h3>
                <button onclick="closePaymentModal()" class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <form id="payment-form" class="space-y-8">
                <!-- Amount Input -->
                <div class="space-y-3">
                    <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Amount Paid (KES)</label>
                    <div class="relative">
                        <span class="absolute left-5 top-1/2 -translate-y-1/2 font-display font-extrabold text-slate-300">KES</span>
                        <input type="number" name="amount_paid" step="0.01" value="1450.00" required autofocus
                            class="w-full pl-16 pr-5 py-5 bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-[16px] outline-none transition-all font-display font-black text-2xl text-ink-900">
                    </div>
                </div>

                <!-- Method Picker -->
                <div class="space-y-4">
                    <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Payment Method</label>
                    <div class="grid grid-cols-2 gap-3" id="method-selector">
                        <button type="button" onclick="setMethod('Cash', this)" class="px-4 py-3 bg-amber-500 text-white border-2 border-amber-500 rounded-xl text-xs font-bold transition-all method-btn">Cash</button>
                        <button type="button" onclick="setMethod('M-Pesa', this)" class="px-4 py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all hover:border-amber-200 method-btn">M-Pesa</button>
                        <button type="button" onclick="setMethod('Insurance', this)" class="px-4 py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all hover:border-amber-200 method-btn">Insurance</button>
                        <button type="button" onclick="setMethod('Other', this)" class="px-4 py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all hover:border-amber-200 method-btn">Other</button>
                    </div>
                    <input type="hidden" name="payment_method" id="payment-method-input" value="Cash">
                </div>

                <input type="hidden" name="bill_id" value="247">

                <div class="pt-6 flex gap-4">
                    <button type="button" onclick="closePaymentModal()" class="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-ink-900 transition-all">Cancel</button>
                    <button type="submit" class="flex-[2] py-4 bg-amber-500 text-white font-display font-extrabold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-200">
                        Confirm Payment
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function openPaymentModal() {
    document.getElementById('payment-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function setMethod(method, btn) {
    document.querySelectorAll('.method-btn').forEach(b => {
        b.className = 'px-4 py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all hover:border-amber-200 method-btn';
    });
    btn.className = 'px-4 py-3 bg-amber-500 text-white border-2 border-amber-500 rounded-xl text-xs font-bold transition-all method-btn shadow-md shadow-amber-100';
    document.getElementById('payment-method-input').value = method;
}

document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-arrow-repeat animate-spin"></i> Processing...';

    // ACTION: see contracts/backend-s05.md (AJAX Fetch POST)
    setTimeout(() => {
        closePaymentModal();
        alert('Payment Recorded Successfully!');
        // UI updates would happen here (e.g. status change to PAID)
        btn.disabled = false;
        btn.innerHTML = 'Confirm Payment';
    }, 1500);
});
</script>

</body>
</html>
