<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['pharmacy', 'admin']);

$stmt = $pdo->prepare("SELECT drug_id, drug_name, quantity_in_stock, unit FROM drugs WHERE is_active = 1 AND quantity_in_stock > 0 ORDER BY drug_name ASC");
$stmt->execute();
$drugs = $stmt->fetchAll();

$errors = $_SESSION['errors'] ?? [];
unset($_SESSION['errors']);

$old = $_SESSION['old'] ?? [];
unset($_SESSION['old']);

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

        <script>document.getElementById('page-title').textContent = 'Dispense Drug';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-6xl mx-auto animate-fade-up">
                
                <form id="dispense-form" method="POST" action="actions/dispense.php" class="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <!-- LEFT: Patient Selection -->
                    <div class="lg:col-span-4 space-y-6">
                        <div class="bg-white rounded-card ghost-border shadow-card p-6 lg:p-8">
                            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 pl-1">1. Select Patient</label>
                            
                            <!-- Patient Selection -->
                            <div class="space-y-4">
                                <div class="relative" id="search-container">
                                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <i class="bi bi-person-search text-xl"></i>
                                    </span>
                                    <input type="text" id="patient-search-input" placeholder="Search name or ID..."
                                        class="w-full pl-12 pr-4 py-4 bg-surface rounded-custom border border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium text-sm">
                                    
                                    <!-- Results Dropdown -->
                                    <div id="patient-results" class="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 hidden overflow-hidden">
                                        <div class="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors patient-item" data-id="124" data-name="John Kamau" data-phone="0712 345 678">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">JK</div>
                                                <div>
                                                    <p class="text-xs font-bold text-ink-900">John Kamau</p>
                                                    <p class="text-[10px] text-slate-400 font-mono italic">P-00124 • 0712 345 678</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Patient Mini-Card -->
                                <div id="patient-mini-card" class="hidden animate-fade-in">
                                    <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl relative flex items-center gap-4">
                                        <button type="button" id="clear-patient" class="absolute top-2 right-2 text-emerald-500 hover:text-emerald-700">
                                            <i class="bi bi-x-circle-fill"></i>
                                        </button>
                                        <div id="pmc-avatar" class="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-display font-bold">JK</div>
                                        <div>
                                            <h4 id="pmc-name" class="font-bold text-ink-900 leading-tight text-sm">John Kamau</h4>
                                            <p id="pmc-details" class="text-[10px] text-emerald-700 font-mono">P-00124 • 0712 345 678</p>
                                        </div>
                                    </div>
                                    <input type="hidden" name="patient_id" id="selected-patient-id">
                                </div>
                            </div>
                        </div>

                        <div class="bg-emerald-600 rounded-card shadow-lg p-6 text-white overflow-hidden relative group">
                            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <i class="bi bi-shield-check text-8xl"></i>
                            </div>
                            <h4 class="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Pharmacist Notes</h4>
                            <p class="text-xs leading-relaxed font-medium opacity-90">Always verify patient identity and drug allergies before dispensing. Double-check dosage against prescription instructions.</p>
                        </div>
                    </div>

                    <!-- RIGHT: Drug & Prescription -->
                    <div class="lg:col-span-8 space-y-6">
                        <div class="bg-white rounded-card ghost-border shadow-card p-8 lg:p-10">
                            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-8 pl-1">2. Prescription Details</label>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <!-- Drug Selector -->
                                <div class="space-y-4">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Select Drug</label>
                                    <div class="relative">
                                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <i class="bi bi-capsule-pill text-xl"></i>
                                        </span>
                                        <select name="drug_id" id="drug-select" required 
                                            class="w-full pl-12 pr-4 py-4 bg-surface rounded-custom border border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1.25rem_center] bg-no-repeat">
                                            <option value="">Choose drug...</option>
                                            <option value="1" data-stock="45" data-unit="tablets">Amoxicillin 500mg — Stock: 45 tabs</option>
                                            <option value="2" data-stock="8" data-unit="tablets">Metformin 850mg — Stock: 8 tabs</option>
                                            <option value="3" data-stock="200" data-unit="tablets">Paracetamol 500mg — Stock: 200 tabs</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Quantity Stepper -->
                                <div class="space-y-4">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Dispense Quantity</label>
                                    <div class="flex items-center gap-4">
                                        <div class="flex overflow-hidden rounded-xl border border-surface-dim bg-surface">
                                            <button type="button" onclick="adjustQty(-1)" class="px-5 py-4 hover:bg-slate-100 transition-colors text-slate-500">
                                                <i class="bi bi-dash-lg"></i>
                                            </button>
                                            <input type="number" name="quantity_issued" id="qty-input" value="1" min="1" 
                                                class="w-20 text-center bg-white border-x border-surface-dim font-display font-extrabold text-lg outline-none appearance-none">
                                            <button type="button" onclick="adjustQty(1)" class="px-5 py-4 hover:bg-slate-100 transition-colors text-slate-500">
                                                <i class="bi bi-plus-lg"></i>
                                            </button>
                                        </div>
                                        <span id="unit-label" class="text-[10px] font-bold uppercase tracking-widest text-slate-400">units</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Live Stock Widget -->
                            <div id="stock-widget" class="hidden animate-fade-in p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-8">
                                <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div class="flex-1 w-full space-y-3">
                                        <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                                            <span class="text-slate-400">Stock Status</span>
                                            <span id="stock-count-label" class="text-emerald-600">45 tablets</span>
                                        </div>
                                        <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                                            <div id="current-stock-bar" class="h-3 bg-emerald-500 transition-all duration-300 shadow-sm shadow-emerald-200" style="width: 80%"></div>
                                            <div id="dispense-stock-bar" class="h-3 bg-red-400 transition-all duration-300 opacity-50" style="width: 5%"></div>
                                        </div>
                                        <div class="flex justify-between items-center text-[9px] font-medium text-slate-400 italic">
                                            <span>Current Shelf</span>
                                            <span id="after-stock-label" class="text-slate-500">Remaining after dispense: 43 tablets</span>
                                        </div>
                                    </div>
                                </div>
                                <p id="stock-error" class="hidden mt-3 text-[10px] font-bold text-red-600 uppercase tracking-widest text-center animate-bounce">
                                    <i class="bi bi-exclamation-triangle-fill mr-1"></i>
                                    Insufficent Stock in pharmacy
                                </p>
                            </div>

                            <!-- Dosage Instructions -->
                            <div class="space-y-4">
                                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Dosage Instructions</label>
                                <textarea name="dosage_instructions" rows="3" placeholder="e.g. Take 1 tablet 3 times daily after meals for 7 days"
                                    class="w-full px-4 py-4 bg-surface rounded-custom border border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium text-sm"></textarea>
                            </div>

                            <input type="hidden" name="pharmacist_id" value="<?php echo $_SESSION['user_id'] ?? '3'; ?>">

                            <div class="pt-10">
                                <button type="submit" id="submit-btn" class="w-full py-5 bg-[#10B981] text-white font-display font-extrabold rounded-custom hover:bg-[#059669] transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-[0.98]">
                                    Dispense & Update Stock
                                    <i class="bi bi-check2-circle text-xl"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

            </div>
        </main>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    
    // Patient Search (Standard snippet)
    const patientInput = document.getElementById('patient-search-input');
    const resultsDiv = document.getElementById('patient-results');
    const miniCard = document.getElementById('patient-mini-card');
    const searchContainer = document.getElementById('search-container');
    const clearBtn = document.getElementById('clear-patient');
    const hiddenPatientId = document.getElementById('selected-patient-id');

    patientInput.addEventListener('keyup', () => {
        const query = patientInput.value.trim();
        if (query.length >= 2) {
            fetch('../patients/api/search.php?q=' + encodeURIComponent(query))
                .then(res => res.json())
                .then(data => {
                    resultsDiv.innerHTML = '';
                    if (data.length > 0) {
                        data.forEach(patient => {
                            const div = document.createElement('div');
                            div.className = 'p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors patient-item';
                            div.innerHTML = `
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">${patient.full_name.charAt(0)}</div>
                                    <div>
                                        <p class="text-xs font-bold text-ink-900">${patient.full_name}</p>
                                        <p class="text-[10px] text-slate-400 font-mono italic">P-${patient.patient_id.toString().padStart(5, '0')} • ${patient.phone}</p>
                                    </div>
                                </div>
                            `;
                            div.onclick = () => selectPatient(patient);
                            resultsDiv.appendChild(div);
                        });
                        resultsDiv.classList.remove('hidden');
                    } else {
                        resultsDiv.classList.add('hidden');
                    }
                });
        } else {
            resultsDiv.classList.add('hidden');
        }
    });

    function selectPatient(patient) {
        hiddenPatientId.value = patient.patient_id;
        document.getElementById('pmc-name').textContent = patient.full_name;
        document.getElementById('pmc-details').textContent = `P-${patient.patient_id.toString().padStart(5, '0')} • ${patient.phone}`;
        document.getElementById('pmc-avatar').textContent = patient.full_name.split(' ').map(n => n[0]).join('');
        miniCard.classList.remove('hidden');
        searchContainer.classList.add('hidden');
        resultsDiv.classList.add('hidden');
    }


    clearBtn.addEventListener('click', () => {
        hiddenPatientId.value = '';
        miniCard.classList.add('hidden');
        searchContainer.classList.remove('hidden');
        patientInput.value = '';
    });

    // Drug Stock Logic
    const drugSelect = document.getElementById('drug-select');
    const qtyInput = document.getElementById('qty-input');
    const stockWidget = document.getElementById('stock-widget');
    const unitLabel = document.getElementById('unit-label');
    const stockCountLabel = document.getElementById('stock-count-label');
    const currentBar = document.getElementById('current-stock-bar');
    const dispenseBar = document.getElementById('dispense-stock-bar');
    const afterLabel = document.getElementById('after-stock-label');
    const stockError = document.getElementById('stock-error');
    const submitBtn = document.getElementById('submit-btn');

    let currentStock = 0;
    let drugUnit = '';

    drugSelect.addEventListener('change', () => {
        const option = drugSelect.selectedOptions[0];
        if (option && option.value) {
            currentStock = parseInt(option.getAttribute('data-stock'));
            drugUnit = option.getAttribute('data-unit');
            
            unitLabel.textContent = drugUnit;
            stockCountLabel.textContent = `${currentStock} ${drugUnit}`;
            stockWidget.classList.remove('hidden');
            updateVisuals();
        } else {
            stockWidget.classList.add('hidden');
        }
    });

    qtyInput.addEventListener('input', updateVisuals);

    window.adjustQty = function(d) {
        const newVal = parseInt(qtyInput.value) + d;
        if (newVal >= 1) {
            qtyInput.value = newVal;
            updateVisuals();
        }
    };

    function updateVisuals() {
        if (!currentStock) return;
        const dispenseQty = parseInt(qtyInput.value) || 0;
        const maxDisplay = Math.max(currentStock * 1.2, 50); // Scale bar base
        
        const currentPercent = (currentStock / maxDisplay) * 100;
        const dispensePercent = (dispenseQty / maxDisplay) * 100;
        const remaining = currentStock - dispenseQty;

        currentBar.style.width = Math.max(0, currentPercent - dispensePercent) + '%';
        dispenseBar.style.width = Math.min(dispensePercent, currentPercent) + '%';
        
        if (remaining < 0) {
            afterLabel.textContent = `Insufficient stock: Needs ${Math.abs(remaining)} more`;
            afterLabel.classList.add('text-red-500');
            stockError.classList.remove('hidden');
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            afterLabel.textContent = `Remaining after dispense: ${remaining} ${drugUnit}`;
            afterLabel.classList.remove('text-red-500');
            stockError.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
});
</script>

</body>
</html>
