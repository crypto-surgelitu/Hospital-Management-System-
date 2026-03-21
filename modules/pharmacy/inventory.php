<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();
requireRole(['pharmacy', 'admin']);

$stmt = $pdo->prepare("SELECT * FROM drugs WHERE is_active = 1 ORDER BY drug_name ASC");
$stmt->execute();
$drugs = $stmt->fetchAll();

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

        <script>document.getElementById('page-title').textContent = 'Drug Inventory';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-7xl mx-auto animate-fade-up">
                
                <!-- Page Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                            <i class="bi bi-capsule text-2xl"></i>
                        </div>
                        <div>
                            <h2 class="font-display font-bold text-2xl text-ink-900 tracking-tight">Drug Inventory</h2>
                            <p class="text-xs text-slate-400 font-medium mt-1">Manage pharmaceutical stock and expiration records</p>
                        </div>
                    </div>
                    <a href="drug_form.php" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10B981] text-white font-display font-bold rounded-custom hover:bg-[#059669] transition-all shadow-lg shadow-emerald-200">
                        <i class="bi bi-plus-lg"></i>
                        Add New Drug
                    </a>
                </div>

                <!-- Filter Bar -->
                <div class="bg-white rounded-card ghost-border shadow-sm p-4 mb-8">
                    <form action="#" method="GET" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" placeholder="Search drug name..." class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-emerald-500 outline-none text-sm transition-all font-medium">
                        </div>
                        <select class="px-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-emerald-500 outline-none text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                            <option value="">All Categories</option>
                            <option>Antibiotic</option>
                            <option>Analgesic</option>
                            <option>Antimalaria</option>
                            <option>Other</option>
                        </select>
                        <select class="px-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-emerald-500 outline-none text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                            <option value="">All Stock Status</option>
                            <option>Low Stock</option>
                            <option>Critical</option>
                        </select>
                        <button type="submit" class="bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all">Search</button>
                    </form>
                </div>

                <!-- Data Table -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-surface-dim">
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Drug Name</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Stock Level</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Reorder</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Expiry</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Price (KES)</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="inventory-table-body" class="divide-y divide-surface-dim">
                                <!-- Amoxicillin (Green Stock, Safe Expiry) -->
                                <tr class="hover:bg-slate-50/50 transition-colors" data-qty="45" data-reorder="50">
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">Amoxicillin 500mg</span>
                                            <span class="text-[10px] text-slate-400 font-medium">Generic: Amoxicillin</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-600 font-medium">Antibiotic</td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col gap-1.5">
                                            <span class="text-sm font-bold text-ink-900">45 <span class="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">tabs</span></span>
                                            <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div class="h-1.5 rounded-full stock-bar" data-qty="45" data-reorder="50"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-mono text-slate-500">50</td>
                                    <td class="px-6 py-5 text-sm font-bold text-slate-600 expiry-cell" data-expiry="2026-06-15">15/06/2026</td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900">15.00</td>
                                    <td class="px-6 py-5 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="drug_form.php?id=1" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all"><i class="bi bi-pencil-square"></i></a>
                                            <button onclick="deleteDrug(1, this)" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"><i class="bi bi-trash3"></i></button>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Metformin (Critical, Expiring Soon) -->
                                <tr class="hover:bg-slate-50/50 transition-colors bg-red-50/30" data-qty="8" data-reorder="50">
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-red-700">Metformin 850mg</span>
                                            <span class="text-[10px] text-red-400/70 font-medium">Generic: Metformin</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-600 font-medium">Other</td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col gap-1.5">
                                            <div class="flex items-center gap-2">
                                                <span class="text-sm font-bold text-red-600">8</span>
                                                <span class="px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 text-[8px] font-bold uppercase">Critical</span>
                                            </div>
                                            <div class="w-16 bg-red-100 rounded-full h-1.5 overflow-hidden">
                                                <div class="h-1.5 rounded-full stock-bar" data-qty="8" data-reorder="50"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-mono text-slate-500">50</td>
                                    <td class="px-6 py-5 text-sm font-bold expiry-cell" data-expiry="2026-04-30">30/04/2026</td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900">25.00</td>
                                    <td class="px-6 py-5 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="drug_form.php?id=2" class="w-8 h-8 flex items-center justify-center rounded-lg border border-red-100 text-red-300 hover:text-emerald-600 hover:border-emerald-600 transition-all"><i class="bi bi-pencil-square"></i></a>
                                            <button onclick="deleteDrug(2, this)" class="w-8 h-8 flex items-center justify-center rounded-lg border border-red-100 text-red-300 hover:text-red-600 hover:border-red-600 transition-all"><i class="bi bi-trash3"></i></button>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Paracetamol -->
                                <tr class="hover:bg-slate-50/50 transition-colors" data-qty="200" data-reorder="50">
                                    <td class="px-6 py-5">
                                        <span class="text-sm font-bold text-ink-900">Paracetamol 500mg</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-600 font-medium">Analgesic</td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col gap-1.5">
                                            <span class="text-sm font-bold text-ink-900">200</span>
                                            <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div class="h-1.5 rounded-full stock-bar" data-qty="200" data-reorder="50"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-mono text-slate-500">50</td>
                                    <td class="px-6 py-5 text-sm font-bold text-slate-600 expiry-cell" data-expiry="2026-12-31">31/12/2026</td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900">5.00</td>
                                    <td class="px-6 py-5 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="drug_form.php?id=3" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all"><i class="bi bi-pencil-square"></i></a>
                                            <button onclick="deleteDrug(3, this)" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"><i class="bi bi-trash3"></i></button>
                                        </div>
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
function processInventory() {
    const bars = document.querySelectorAll('.stock-bar');
    const cells = document.querySelectorAll('.expiry-cell');
    const today = new Date();

    bars.forEach(bar => {
        const qty = parseInt(bar.getAttribute('data-qty'));
        const reorder = parseInt(bar.getAttribute('data-reorder'));
        const percent = Math.min((qty / (reorder * 5)) * 100, 100);
        
        bar.style.width = percent + '%';
        if (percent > 60) bar.classList.add('bg-green-500');
        else if (percent >= 20) bar.classList.add('bg-amber-500');
        else bar.classList.add('bg-red-500');

        // Row highlight if below reorder level
        if (qty < reorder) {
            bar.closest('tr').classList.add('bg-red-50/40');
        }
    });

    cells.forEach(cell => {
        const expiry = new Date(cell.getAttribute('data-expiry'));
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
            cell.classList.add('text-red-600');
        } else if (diffDays <= 60) {
            cell.classList.add('text-amber-500');
        }
    });
}

function deleteDrug(id, btn) {
    if (confirm('Are you sure you want to delete this drug from inventory?')) {
        fetch('api/delete_drug.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(res => res.json())
        .then(data => {
            btn.closest('tr').classList.add('opacity-0', 'transition-all', 'duration-500');
            setTimeout(() => btn.closest('tr').remove(), 500);
        });

    }
}

// Init
processInventory();
</script>

</body>
</html>
