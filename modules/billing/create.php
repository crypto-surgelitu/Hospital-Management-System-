<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();
requireRole(['admin', 'receptionist']);

$errors = $_SESSION['errors'] ?? [];
unset($_SESSION['errors']);

$old = $_SESSION['old'] ?? [];
unset($_SESSION['old']);

require_once '../../includes/header.php';
?>

<div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <?php require_once '../../includes/sidebar.php'; ?>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        <!-- Topbar -->
        <?php require_once '../../includes/topbar.php'; ?>
        <script>document.getElementById('page-title').textContent = 'Create Invoice';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-5xl mx-auto animate-fade-up">
                
                <form id="create-bill-form" method="POST" action="modules/billing/actions/create.php" class="space-y-8">
                    <!-- ACTION: see contracts/backend-s05.md -->

                    <!-- 1. Patient Selection -->
                    <div class="bg-white rounded-card ghost-border shadow-card p-6 lg:p-8">
                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 pl-1">1. Select Patient</label>
                        
                        <div class="relative max-w-md" id="search-container">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <i class="bi bi-person-search text-xl"></i>
                            </span>
                            <input type="text" id="patient-search-input" placeholder="Search name or ID to auto-load services..."
                                class="w-full pl-12 pr-4 py-4 bg-surface rounded-custom border border-transparent focus:border-amber-500 focus:bg-white transition-all outline-none font-medium text-sm">
                            
                            <!-- Search Results Dropdown -->
                            <div id="patient-results" class="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 hidden overflow-hidden">
                                <div class="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors patient-item" data-id="124" data-name="John Kamau" data-phone="0712 345 678">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">JK</div>
                                        <div>
                                            <p class="text-xs font-bold text-ink-900">John Kamau</p>
                                            <p class="text-[10px] text-slate-400 font-mono italic">P-00124 • 0712 345 678</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Selected Patient Mini-Card -->
                        <div id="patient-mini-card" class="hidden animate-fade-in max-w-md">
                            <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl relative flex items-center gap-4">
                                <button type="button" id="clear-patient" class="absolute top-2 right-2 text-amber-500 hover:text-amber-700">
                                    <i class="bi bi-x-circle-fill"></i>
                                </button>
                                <div id="pmc-avatar" class="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-display font-bold text-sm">JK</div>
                                <div>
                                    <h4 id="pmc-name" class="font-bold text-ink-900 leading-tight text-sm">John Kamau</h4>
                                    <p id="pmc-details" class="text-[10px] text-amber-700 font-mono">P-00124 • 0712 345 678</p>
                                </div>
                            </div>
                            <input type="hidden" name="patient_id" id="selected-patient-id">
                        </div>
                    </div>

                    <!-- 2. Line Items -->
                    <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                        <div class="p-8 border-b border-slate-50 flex items-center justify-between">
                            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">2. Invoice Line Items</label>
                            <button type="button" onclick="addRow()" class="px-4 py-2 bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2">
                                <i class="bi bi-plus-lg"></i>
                                Add Manual Item
                            </button>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50/50">
                                        <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</th>
                                        <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-32">Qty</th>
                                        <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-48">Unit Price (KES)</th>
                                        <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-48 text-right">Subtotal</th>
                                        <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody id="line-items-body" class="divide-y divide-slate-50">
                                    <!-- Dynamic rows injected here -->
                                </tbody>
                            </table>
                        </div>

                        <!-- Empty State -->
                        <div id="empty-state" class="py-20 text-center">
                            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <i class="bi bi-receipt text-3xl"></i>
                            </div>
                            <p class="text-sm font-medium text-slate-400">No items added. Select a patient to load services <br> or add manual items.</p>
                        </div>

                        <!-- Footer / Totals -->
                        <div class="p-8 bg-slate-50/50 border-t border-slate-100">
                            <div class="flex flex-col items-end gap-2 pr-8">
                                <p class="text-xs font-medium text-slate-400">GRAND TOTAL</p>
                                <h2 class="text-3xl font-display font-black text-ink-900" id="grand-total">KES 0.00</h2>
                            </div>
                        </div>
                    </div>

                    <input type="hidden" name="generated_by" value="<?php echo $_SESSION['user_id'] ?? '1'; ?>">

                    <!-- Action Buttons -->
                    <div class="flex items-center justify-end gap-6 pt-4">
                        <a href="index.php" class="text-sm font-bold text-slate-400 hover:text-ink-900 transition-all">Cancel</a>
                        <button type="submit" class="px-12 py-4 bg-amber-500 text-white font-display font-extrabold rounded-custom hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 flex items-center gap-3">
                            Generate Invoice
                            <i class="bi bi-file-earmark-check text-xl"></i>
                        </button>
                    </div>
                </form>

            </div>
        </main>
    </div>
</div>

<script>
let rowCount = 0;

// Patient Search Snippet
const patientInput = document.getElementById('patient-search-input');
const resultsDiv = document.getElementById('patient-results');
const miniCard = document.getElementById('patient-mini-card');
const searchContainer = document.getElementById('search-container');
const clearBtn = document.getElementById('clear-patient');
const hiddenPatientId = document.getElementById('selected-patient-id');

patientInput.addEventListener('keyup', () => {
    if (patientInput.value.length >= 2) resultsDiv.classList.remove('hidden');
    else resultsDiv.classList.add('hidden');
});

document.querySelectorAll('.patient-item').forEach(item => {
    item.addEventListener('click', () => {
        const name = item.getAttribute('data-name');
        const id = item.getAttribute('data-id');
        const phone = item.getAttribute('data-phone');
        hiddenPatientId.value = id;
        document.getElementById('pmc-name').textContent = name;
        document.getElementById('pmc-details').textContent = `P-00${id} • ${phone}`;
        document.getElementById('pmc-avatar').textContent = name.split(' ').map(n => n[0]).join('');
        miniCard.classList.remove('hidden');
        searchContainer.classList.add('hidden');
        resultsDiv.classList.add('hidden');
        
        // Load services (Mock)
        loadPatientServices(id);
    });
});

clearBtn.addEventListener('click', () => {
    hiddenPatientId.value = '';
    miniCard.classList.add('hidden');
    searchContainer.classList.remove('hidden');
    patientInput.value = '';
    document.getElementById('line-items-body').innerHTML = '';
    rowCount = 0;
    updateGrandTotal();
});

// Dynamic Table Logic
function addRow(data = { description: '', quantity: 1, unit_price: 0 }) {
    const tbody = document.getElementById('line-items-body');
    document.getElementById('empty-state').classList.add('hidden');

    const tr = document.createElement('tr');
    tr.className = 'group hover:bg-white transition-colors';
    tr.innerHTML = `
        <td class="px-8 py-5">
            <input type="text" name="items[${rowCount}][description]" value="${data.description}" placeholder="Enter service or item name..." required
                class="w-full bg-transparent border-b border-transparent focus:border-amber-500 outline-none font-bold text-sm text-ink-900 py-1 transition-all">
        </td>
        <td class="px-8 py-5">
            <input type="number" name="items[${rowCount}][quantity]" value="${data.quantity}" min="1" step="1" oninput="calculateRow(this)" required
                class="w-full bg-slate-50 rounded-lg px-3 py-2 text-center text-sm font-bold text-ink-900 outline-none focus:ring-2 focus:ring-amber-500/20">
        </td>
        <td class="px-8 py-5">
            <div class="relative">
                <span class="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">KES</span>
                <input type="number" name="items[${rowCount}][unit_price]" value="${data.unit_price}" min="0" step="0.01" oninput="calculateRow(this)" required
                    class="w-full bg-transparent border-b border-transparent focus:border-amber-500 outline-none font-mono font-bold text-sm text-ink-900 py-1 pl-8 text-right transition-all">
            </div>
        </td>
        <td class="px-8 py-5 text-right font-mono font-black text-ink-900 text-sm row-subtotal">
            0.00
        </td>
        <td class="px-8 py-5 text-center">
            <button type="button" onclick="removeRow(this)" class="w-8 h-8 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                <i class="bi bi-trash3"></i>
            </button>
        </td>
    `;
    tbody.appendChild(tr);
    calculateRow(tr.querySelector('input[type="number"]'));
    rowCount++;
}

function removeRow(btn) {
    btn.closest('tr').remove();
    updateGrandTotal();
    if (document.getElementById('line-items-body').children.length === 0) {
        document.getElementById('empty-state').classList.remove('hidden');
    }
}

function calculateRow(input) {
    const row = input.closest('tr');
    const qty = parseFloat(row.querySelector('input[name*="[quantity]"]').value) || 0;
    const price = parseFloat(row.querySelector('input[name*="[unit_price]"]').value) || 0;
    const subtotal = qty * price;
    row.querySelector('.row-subtotal').textContent = subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 });
    updateGrandTotal();
}

function updateGrandTotal() {
    let total = 0;
    document.querySelectorAll('.row-subtotal').forEach(el => {
        total += parseFloat(el.textContent.replace(/,/g, '')) || 0;
    });
    document.getElementById('grand-total').textContent = 'KES ' + total.toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

function loadPatientServices(patientId) {
    // ACTION: see contracts/backend-s05.md (AJAX Fetch)
    // Simulating returned services
    const mockServices = [
        { description: 'Consultation Fee', quantity: 1, unit_price: 500.00 },
        { description: 'Full Blood Count', quantity: 1, unit_price: 800.00 }
    ];
    
    document.getElementById('line-items-body').innerHTML = '';
    rowCount = 0;
    mockServices.forEach(s => addRow(s));
}
</script>

</body>
</html>
