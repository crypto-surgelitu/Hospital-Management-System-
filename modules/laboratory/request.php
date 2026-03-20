<?php 
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';
requireLogin();
require_once '../../includes/header.php'; 
?>

<div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <?php require_once '../../includes/sidebar.php'; ?>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        <!-- Topbar -->
        <?php require_once '../../includes/topbar.php'; ?>
        <script>document.getElementById('page-title').textContent = 'Request Lab Test';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-2xl mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-6 text-sm font-medium">
                    <a href="queue.php" class="text-slate-400 hover:text-cyan-600 transition-colors">Laboratory</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900">Request Test</span>
                </nav>

                <!-- Request Card -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="p-8 lg:p-12">
                        <div class="flex items-center gap-4 mb-10">
                            <div class="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center">
                                <i class="bi bi-file-earmark-plus text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="font-display font-bold text-xl text-ink-900">New Test Request</h3>
                                <p class="text-xs text-slate-400 font-medium">Specify the patient and required clinical tests</p>
                            </div>
                        </div>

                        <!-- ACTION: see contracts/backend-s03.md -->
                        <form id="request-form" method="POST" action="#" class="space-y-8">
                            
                            <!-- Patient Selection -->
                            <div class="space-y-4">
                                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Target Patient</label>
                                <div class="relative" id="search-container">
                                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <i class="bi bi-person-search text-xl"></i>
                                    </span>
                                    <input type="text" id="patient-search-input" placeholder="Search patient name or ID..."
                                        class="w-full pl-12 pr-4 py-4 bg-surface rounded-custom border border-transparent focus:border-cyan-500 focus:bg-white transition-all outline-none font-medium">
                                    
                                    <!-- Results Dropdown -->
                                    <div id="patient-results" class="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 hidden overflow-hidden">
                                        <div class="p-2 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors patient-item" data-id="124" data-name="John Kamau" data-phone="0712 345 678">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-[10px] font-bold">JK</div>
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
                                    <div class="p-4 bg-cyan-50 border border-cyan-200 rounded-xl relative flex items-center gap-4">
                                        <button type="button" id="clear-patient" class="absolute top-2 right-2 text-cyan-500 hover:text-cyan-700">
                                            <i class="bi bi-x-circle-fill"></i>
                                        </button>
                                        <div id="pmc-avatar" class="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center font-display font-bold">JK</div>
                                        <div>
                                            <h4 id="pmc-name" class="font-bold text-ink-900 leading-tight">John Kamau</h4>
                                            <p id="pmc-details" class="text-xs text-cyan-700 font-mono">P-00124 • 0712 345 678</p>
                                        </div>
                                    </div>
                                    <input type="hidden" name="patient_id" id="selected-patient-id">
                                </div>
                            </div>

                            <!-- Test Type -->
                            <div class="space-y-4">
                                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Required Test</label>
                                <div class="relative">
                                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <i class="bi bi-beaker text-xl"></i>
                                    </span>
                                    <select name="test_type" required class="w-full pl-12 pr-4 py-4 bg-surface rounded-custom border border-transparent focus:border-cyan-500 focus:bg-white transition-all outline-none font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1.5rem_center] bg-no-repeat">
                                        <option value="">Select Test Type...</option>
                                        <option value="Full Blood Count (FBC)">Full Blood Count (FBC)</option>
                                        <option value="Malaria RDT">Malaria RDT</option>
                                        <option value="HIV Test">HIV Test</option>
                                        <option value="Urinalysis">Urinalysis</option>
                                        <option value="Blood Glucose (Fasting)">Blood Glucose (Fasting)</option>
                                        <option value="Liver Function Tests (LFT)">Liver Function Tests (LFT)</option>
                                        <option value="Renal Function Tests (RFT)">Renal Function Tests (RFT)</option>
                                        <option value="Widal Test">Widal Test</option>
                                        <option value="Sputum AFB">Sputum AFB</option>
                                        <option value="Pregnancy Test (UPT)">Pregnancy Test (UPT)</option>
                                        <option value="Stool Analysis">Stool Analysis</option>
                                        <option value="CD4 Count">CD4 Count</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Notes -->
                            <div class="space-y-4">
                                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Clinical Instructions</label>
                                <textarea name="notes" rows="3" placeholder="Additional instructions for the lab technician..."
                                    class="w-full px-4 py-4 bg-surface rounded-custom border border-transparent focus:border-cyan-500 focus:bg-white transition-all outline-none font-medium"></textarea>
                            </div>

                            <input type="hidden" name="requested_by" value="<?php echo $_SESSION['user_id'] ?? '1'; ?>">

                            <!-- Buttons -->
                            <div class="flex items-center justify-end gap-6 pt-10 border-t border-surface-dim">
                                <a href="queue.php" class="text-sm font-bold text-slate-400 hover:text-ink-900 transition-all">Cancel</a>
                                <button type="submit" class="px-10 py-4 bg-cyan-500 text-white font-display font-extrabold rounded-custom hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100 flex items-center gap-3">
                                    Submit Test Request
                                    <i class="bi bi-send-fill text-xs"></i>
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
document.addEventListener('DOMContentLoaded', () => {
    
    // Patient Selection Logic (Reusable from S02)
    const patientInput = document.getElementById('patient-search-input');
    const resultsDiv = document.getElementById('patient-results');
    const miniCard = document.getElementById('patient-mini-card');
    const searchContainer = document.getElementById('search-container');
    const clearBtn = document.getElementById('clear-patient');
    const hiddenPatientId = document.getElementById('selected-patient-id');

    patientInput.addEventListener('keyup', () => {
        if (patientInput.value.length >= 2) {
            resultsDiv.classList.remove('hidden');
        } else {
            resultsDiv.classList.add('hidden');
        }
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
        });
    });

    clearBtn.addEventListener('click', () => {
        hiddenPatientId.value = '';
        miniCard.classList.add('hidden');
        searchContainer.classList.remove('hidden');
        patientInput.value = '';
    });

});
</script>

</body>
</html>
