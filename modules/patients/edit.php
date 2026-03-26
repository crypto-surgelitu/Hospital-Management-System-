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

$stmt = $pdo->prepare("SELECT * FROM patients WHERE patient_id = ? AND is_active = 1");
$stmt->execute([$id]);
$patient = $stmt->fetch();

if (!$patient) {
    header('Location: index.php');
    exit;
}

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
                    <?php echo sanitize($_SESSION['flash_success']);
    unset($_SESSION['flash_success']); ?>
                </div>
            <?php
endif; ?>
            <?php if (!empty($_SESSION['flash_error'])): ?>
                <div class="mx-7 mt-4 p-4 bg-red-50 border border-red-200 rounded-btn text-red-700 text-sm font-medium flex items-center gap-2">
                    <i class="bi bi-exclamation-circle-fill"></i>
                    <?php echo sanitize($_SESSION['flash_error']);
    unset($_SESSION['flash_error']); ?>
                </div>
            <?php
endif; ?>
        </div>

        <script>document.getElementById('page-title').textContent = 'Edit Patient';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-[860px] mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-6 text-sm font-medium">
                    <a href="index.php" class="text-slate-400 hover:text-blue-600 transition-colors">Patients</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <a href="view.php?id=124" class="text-slate-400 hover:text-blue-600 transition-colors">John Kamau</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900">Edit</span>
                </nav>

                <!-- Edit Card -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="p-6 lg:p-10">
                        <form id="edit-form" method="POST" action="actions/update.php" class="space-y-10">
                            <input type="hidden" name="patient_id" value="124">
                            
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
                                        <input type="text" name="full_name" value="John Kamau"
                                            class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                                        <p id="error-full_name" class="text-[11px] text-red-500 mt-1.5 font-medium hidden">Patient name is required.</p>
                                    </div>

                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">
                                            Gender <span class="text-red-500">*</span>
                                        </label>
                                        <div class="flex items-center gap-2">
                                            <button type="button" data-gender="Male" class="gender-btn flex-1 py-3 bg-blue-600 text-white border-blue-600 shadow-md rounded-custom transition-all font-bold text-sm">Male</button>
                                            <button type="button" data-gender="Female" class="gender-btn flex-1 py-3 bg-surface rounded-custom border border-transparent hover:border-slate-300 transition-all font-bold text-sm text-slate-600">Female</button>
                                            <button type="button" data-gender="Other" class="gender-btn flex-1 py-3 bg-surface rounded-custom border border-transparent hover:border-slate-300 transition-all font-bold text-sm text-slate-600">Other</button>
                                        </div>
                                        <input type="hidden" name="gender" id="gender-input" value="Male">
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
                                            <input type="text" name="date_of_birth" id="dob-picker" value="15/03/1992"
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
                                        <input type="text" name="phone" value="0712 345 678"
                                            class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                                    </div>

                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Email Address</label>
                                        <input type="email" name="email" value="john.kamau@email.com"
                                            class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                                    </div>

                                    <div class="md:col-span-2">
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Residential Address</label>
                                        <textarea name="address" rows="3"
                                            class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">Meru Town, Kenya</textarea>
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
                                    <input type="text" name="national_id" value="12345678"
                                        class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                                </div>
                            </div>

                            <!-- Form Footer -->
                            <div class="flex items-center justify-end gap-4 pt-8 border-t border-surface-dim">
                                <a href="view.php?id=124" class="px-8 py-3.5 text-slate-500 font-bold hover:text-ink-900 transition-all">Cancel</a>
                                <button type="submit" class="px-10 py-3.5 bg-primary text-ink-900 font-display font-extrabold rounded-custom hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/20">
                                    Save Changes
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
        });
    });

    // Form Validation (Reuse logic from register.php)
    const form = document.getElementById('edit-form');
    form.addEventListener('submit', (e) => {
        let hasError = false;
        if (!form.full_name.value.trim()) {
            document.getElementById('error-full_name').classList.remove('hidden');
            hasError = true;
        }
        if (!genderInput.value) {
            document.getElementById('error-gender').classList.remove('hidden');
            hasError = true;
        }
        if (!form.date_of_birth.value.trim()) {
            document.getElementById('error-date_of_birth').classList.remove('hidden');
            hasError = true;
        }

        if (hasError) {
            e.preventDefault();
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
</script>

</body>
</html>
