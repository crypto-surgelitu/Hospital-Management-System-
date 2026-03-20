<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();

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
        <script>document.getElementById('page-title').textContent = 'Register Patient';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-[860px] mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-6 text-sm font-medium">
                    <a href="index.php" class="text-slate-400 hover:text-blue-600 transition-colors">Patients</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900">Register Patient</span>
                </nav>

                <!-- Registration Card -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="p-6 lg:p-10">
                        <!-- ACTION: see contracts/backend-s01.md -->
                        <form id="register-form" method="POST" action="#" class="space-y-10">
                            
                            <!-- Section 1: Personal Details -->
                            <div>
                                <div class="flex items-center gap-3 mb-6">
                                    <div class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <i class="bi bi-person text-lg"></i>
                                    </div>
                                    <h3 class="font-display font-bold text-lg text-ink-900">Personal Details</h3>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="md:col-span-2">
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">
                                            Full Name <span class="text-red-500">*</span>
                                        </label>
                                        <input type="text" name="full_name" placeholder="Enter patient's full clinical name"
                                            class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                                        <p id="error-full_name" class="text-[11px] text-red-500 mt-1.5 font-medium hidden">Patient name is required.</p>
                                    </div>

                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">
                                            Gender <span class="text-red-500">*</span>
                                        </label>
                                        <div class="flex items-center gap-2">
                                            <button type="button" data-gender="Male" class="gender-btn flex-1 py-3 bg-surface rounded-custom border border-transparent hover:border-slate-300 transition-all font-bold text-sm text-slate-600">Male</button>
                                            <button type="button" data-gender="Female" class="gender-btn flex-1 py-3 bg-surface rounded-custom border border-transparent hover:border-slate-300 transition-all font-bold text-sm text-slate-600">Female</button>
                                            <button type="button" data-gender="Other" class="gender-btn flex-1 py-3 bg-surface rounded-custom border border-transparent hover:border-slate-300 transition-all font-bold text-sm text-slate-600">Other</button>
                                        </div>
                                        <input type="hidden" name="gender" id="gender-input">
                                        <p id="error-gender" class="text-[11px] text-red-500 mt-1.5 font-medium hidden">Please select a gender.</p>
                                    </div>

                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">
                                            Date of Birth <span class="text-red-500">*</span>
                                        </label>
                                        <div class="relative">
                                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <i class="bi bi-calendar3"></i>
                                            </span>
                                            <input type="text" name="date_of_birth" id="dob-picker" placeholder="DD/MM/YYYY"
                                                class="w-full pl-12 pr-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                                        </div>
                                        <p id="error-date_of_birth" class="text-[11px] text-red-500 mt-1.5 font-medium hidden">Date of birth is required.</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 2: Contact Information -->
                            <div>
                                <div class="flex items-center gap-3 mb-6">
                                    <div class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <i class="bi bi-telephone text-lg"></i>
                                    </div>
                                    <h3 class="font-display font-bold text-lg text-ink-900">Contact Information</h3>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Phone Number</label>
                                        <input type="text" name="phone" placeholder="e.g. 0712 345 678"
                                            class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                                    </div>

                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Email Address</label>
                                        <input type="email" name="email" placeholder="patient@example.com"
                                            class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                                    </div>

                                    <div class="md:col-span-2">
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Residential Address</label>
                                        <textarea name="address" rows="3" placeholder="e.g. Meru Town, Estate X"
                                            class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"></textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 3: Identity -->
                            <div>
                                <div class="flex items-center gap-3 mb-6">
                                    <div class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <i class="bi bi-card-text text-lg"></i>
                                    </div>
                                    <h3 class="font-display font-bold text-lg text-ink-900">Identity</h3>
                                </div>
                                
                                <div class="max-w-md">
                                    <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">National ID / Passport No.</label>
                                    <input type="text" name="national_id" placeholder="Patient's official ID"
                                        class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                                </div>
                            </div>

                            <!-- Form Footer -->
                            <div class="flex items-center justify-end gap-4 pt-8 border-t border-surface-dim">
                                <a href="index.php" class="px-8 py-3.5 text-slate-500 font-bold hover:text-ink-900 transition-all">Cancel</a>
                                <button type="submit" class="px-10 py-3.5 bg-primary text-ink-900 font-display font-extrabold rounded-custom hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/20">
                                    Register Patient
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

            </div>
        </main>
    </div>
</div>

<!-- Flatpickr JS -->
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    // DOB Picker
    flatpickr("#dob-picker", {
        dateFormat: "d/m/Y",
        maxDate: "today",
        allowInput: true
    });

    // Gender Selection
    const genderBtns = document.querySelectorAll('.gender-btn');
    const genderInput = document.getElementById('gender-input');

    genderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state from all
            genderBtns.forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600', 'shadow-md');
                b.classList.add('bg-surface', 'text-slate-600', 'border-transparent');
            });
            // Add to clicked
            btn.classList.remove('bg-surface', 'text-slate-600', 'border-transparent');
            btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600', 'shadow-md');
            genderInput.value = btn.getAttribute('data-gender');
            
            // Clear error
            document.getElementById('error-gender').classList.add('hidden');
        });
    });

    // Form Validation
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => {
        let hasError = false;
        const data = new FormData(form);

        // Name
        if (!data.get('full_name').trim()) {
            document.getElementById('error-full_name').classList.remove('hidden');
            hasError = true;
        } else {
            document.getElementById('error-full_name').classList.add('hidden');
        }

        // Gender
        if (!genderInput.value) {
            document.getElementById('error-gender').classList.remove('hidden');
            hasError = true;
        } else {
            document.getElementById('error-gender').classList.add('hidden');
        }

        // DOB
        if (!data.get('date_of_birth').trim()) {
            document.getElementById('error-date_of_birth').classList.remove('hidden');
            hasError = true;
        } else {
            document.getElementById('error-date_of_birth').classList.add('hidden');
        }

        if (hasError) {
            e.preventDefault();
            // Scroll to top of form
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Auto-clear error on input
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            const error = document.getElementById(`error-${input.name}`);
            if (error) error.classList.add('hidden');
        });
    });
});
</script>

</body>
</html>
