<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['pharmacy', 'admin']);

$stmt = $pdo->prepare("SELECT * FROM drugs WHERE is_active = 1 ORDER BY drug_name ASC");
$stmt->execute();
$drugs = $stmt->fetchAll();

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
                <div
                    class="mx-7 mt-4 p-4 bg-green-50 border border-green-200 rounded-btn text-green-700 text-sm font-medium flex items-center gap-2">
                    <i class="bi bi-check-circle-fill"></i>
                    <?php echo sanitize($_SESSION['flash_success']);
                    unset($_SESSION['flash_success']); ?>
                </div>
            <?php endif; ?>
            <?php if (!empty($_SESSION['flash_error'])): ?>
                <div
                    class="mx-7 mt-4 p-4 bg-red-50 border border-red-200 rounded-btn text-red-700 text-sm font-medium flex items-center gap-2">
                    <i class="bi bi-exclamation-circle-fill"></i>
                    <?php echo sanitize($_SESSION['flash_error']);
                    unset($_SESSION['flash_error']); ?>
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
                        <div
                            class="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                            <i class="bi bi-capsule text-2xl"></i>
                        </div>
                        <div>
                            <h2 class="font-display font-bold text-2xl text-ink-900 tracking-tight">Drug Inventory</h2>
                            <p class="text-xs text-slate-400 font-medium mt-1">Manage pharmaceutical stock and
                                expiration records</p>
                        </div>
                    </div>
                    <a href="drug_form.php"
                        class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10B981] text-white font-display font-bold rounded-custom hover:bg-[#059669] transition-all shadow-lg shadow-emerald-200">
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
                            <input type="text" placeholder="Search drug name..."
                                class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-emerald-500 outline-none text-sm transition-all font-medium">
                        </div>
                        <select
                            class="px-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-emerald-500 outline-none text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                            <option value="">All Categories</option>
                            <option>Antibiotic</option>
                            <option>Analgesic</option>
                            <option>Antimalaria</option>
                            <option>Other</option>
                        </select>
                        <select
                            class="px-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-emerald-500 outline-none text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                            <option value="">All Stock Status</option>
                            <option>Low Stock</option>
                            <option>Critical</option>
                        </select>
                        <button type="submit"
                            class="bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all">Search</button>
                    </form>
                </div>

                <!-- Data Table -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-surface-dim">
                                    <th
                                        class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        Drug Name</th>
                                    <th
                                        class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        Category</th>
                                    <th
                                        class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        Stock Level</th>
                                    <th
                                        class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        Reorder</th>
                                    <th
                                        class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        Expiry</th>
                                    <th
                                        class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        Price (KES)</th>
                                    <th
                                        class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                                        Actions</th>
                                </tr>
                            </thead>
                            <tbody id="inventory-table-body" class="divide-y divide-surface-dim">
                                <?php if (empty($drugs)): ?>
                                    <tr>
                                        <td colspan="7" class="px-6 py-12 text-center text-slate-400">No drugs in inventory
                                            yet</td>
                                    </tr>
                                <?php else:
                                    foreach ($drugs as $d):
                                        $qty = $d['quantity_in_stock'];
                                        $reorder = $d['reorder_level'];
                                        $expiry = $d['expiry_date'];
                                        $days_to_expiry = $expiry ? (strtotime($expiry) - time()) / 86400 : 999;
                                        $row_class = $qty <= $reorder ? 'bg-red-50/30' : '';
                                        $expiry_class = $days_to_expiry <= 30 ? 'text-red-500' : ($days_to_expiry <= 60 ? 'text-amber-500' : 'text-slate-500');
                                        ?>
                                        <tr class="hover:bg-slate-50/50 transition-colors <?= $row_class ?>"
                                            data-qty="<?= $qty ?>" data-reorder="<?= $reorder ?>">
                                            <td class="px-6 py-5">
                                                <div class="flex flex-col">
                                                    <span class="text-sm font-bold text-ink-900">
                                                        <?= htmlspecialchars($d['drug_name']) ?>
                                                    </span>
                                                    <span class="text-[10px] text-slate-400 font-medium">Generic:
                                                        <?= htmlspecialchars($d['generic_name'] ?? '—') ?>
                                                    </span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-5 text-sm text-slate-600 font-medium">
                                                <?= htmlspecialchars($d['category'] ?? '—') ?>
                                            </td>
                                            <td class="px-6 py-5">
                                                <div class="flex flex-col gap-1.5">
                                                    <span class="text-sm font-bold text-ink-900">
                                                        <?= $qty ?> <span
                                                            class="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                                                            <?= htmlspecialchars($d['unit'] ?? '') ?>
                                                        </span>
                                                    </span>
                                                    <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div class="h-1.5 rounded-full stock-bar" data-qty="<?= $qty ?>"
                                                            data-reorder="<?= $reorder ?>"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-5 text-sm font-mono text-slate-500">
                                                <?= $reorder ?>
                                            </td>
                                            <td class="px-6 py-5 text-sm font-bold <?= $expiry_class ?> expiry-cell"
                                                data-expiry="<?= $expiry ?>">
                                                <?= $expiry ? formatDate($expiry) : '—' ?>
                                            </td>
                                            <td class="px-6 py-5 text-sm font-bold text-ink-900">KES
                                                <?= number_format($d['unit_price'], 2) ?>
                                            </td>
                                            <td class="px-6 py-5 text-right">
                                                <div class="flex items-center justify-end gap-2">
                                                    <a href="/hms/modules/pharmacy/drug_form.php?id=<?= $d['drug_id'] ?>"
                                                        class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all"><i
                                                            class="bi bi-pencil-square"></i></a>
                                                    <button onclick="deleteDrug(<?= $d['drug_id'] ?>, this)"
                                                        class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"><i
                                                            class="bi bi-trash3"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; endif; ?>
                            </tbody>
                        </table>
                    </div>
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

                // Debounce function to limit API calls
                function debounce(func, delay = 300) {
                    let timeout;
                    return function(...args) {
                        const context = this;
                        clearTimeout(timeout);
                        timeout = setTimeout(() => func.apply(context, args), delay);
                    };
                }

                const searchInput = document.getElementById('search-input');
                const tableBody = document.getElementById('inventory-table-body');
                const spinner = document.getElementById('search-spinner');

                const handleSearch = debounce(() => {
                    const query = searchInput.value.trim();
                    if (query.length < 1) {
                        location.reload(); // Reload to show all drugs if search is cleared
                        return;
                    }
                    
                    spinner.classList.remove('hidden');
                    
                    fetch('/hms/modules/pharmacy/api/search.php?q=' + encodeURIComponent(query))
                        .then(res => res.json())
                        .then(data => {
                            spinner.classList.add('hidden');
                            tableBody.innerHTML = '';
                            
                            if (data.length === 0) {
                                tableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-12 text-center text-slate-400 font-medium">No matching drugs found</td></tr>';
                                return;
                            }
                            
                            data.forEach(drug => {
                                const statusClass = drug.quantity_in_stock <= drug.reorder_level ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600';
                                const expiryDate = drug.expiry_date ? new Date(drug.expiry_date) : null;
                                const today = new Date();
                                let expiryClass = 'text-slate-500';
                                if (expiryDate) {
                                    const diffTime = expiryDate - today;
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    if (diffDays <= 30) {
                                        expiryClass = 'text-red-600';
                                    } else if (diffDays <= 60) {
                                        expiryClass = 'text-amber-500';
                                    }
                                }

                                const row = `
                                    <tr class="hover:bg-slate-50/50 transition-colors ${drug.quantity_in_stock <= drug.reorder_level ? 'bg-red-50/30' : ''}">
                                        <td class="px-6 py-5">
                                            <div class="flex flex-col">
                                                <span class="text-sm font-bold text-ink-900">${drug.drug_name}</span>
                                                <span class="text-[10px] text-slate-400 font-medium">Generic: ${drug.generic_name || '—'}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-5 text-sm text-slate-600 font-medium">${drug.category || '—'}</td>
                                        <td class="px-6 py-5">
                                            <div class="flex flex-col gap-1.5">
                                                <span class="text-sm font-bold text-ink-900">
                                                    ${drug.quantity_in_stock} <span class="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">${drug.unit || ''}</span>
                                                </span>
                                                <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div class="h-1.5 rounded-full stock-bar" data-qty="${drug.quantity_in_stock}" data-reorder="${drug.reorder_level}" style="width: ${Math.min((drug.quantity_in_stock / (drug.reorder_level * 5)) * 100, 100)}%; background-color: ${drug.quantity_in_stock <= drug.reorder_level ? '#ef4444' : (drug.quantity_in_stock <= drug.reorder_level * 2 ? '#f59e0b' : '#10b981')};"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-5 text-sm font-mono text-slate-500">${drug.reorder_level}</td>
                                        <td class="px-6 py-5 text-sm font-bold ${expiryClass} expiry-cell" data-expiry="${drug.expiry_date || ''}">
                                            ${drug.expiry_date ? new Date(drug.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                        </td>
                                        <td class="px-6 py-5 text-sm font-bold text-ink-900">KES ${parseFloat(drug.unit_price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td class="px-6 py-5 text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                <a href="/hms/modules/pharmacy/drug_form.php?id=${drug.drug_id}"
                                                    class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all"><i
                                                        class="bi bi-pencil-square"></i></a>
                                                <button onclick="deleteDrug(${drug.drug_id}, this)"
                                                    class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"><i
                                                        class="bi bi-trash3"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                                tableBody.insertAdjacentHTML('beforeend', row);
                            });
                        })
                        .catch(error => {
                            spinner.classList.add('hidden');
                            console.error('Error during search:', error);
                            tableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-12 text-center text-red-500 font-medium">Error searching for drugs. Please try again.</td></tr>';
                        });
                });

                searchInput.addEventListener('input', handleSearch);

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