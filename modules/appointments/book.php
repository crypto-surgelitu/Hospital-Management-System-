<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();

$errors = $_SESSION['errors'] ?? [];
unset($_SESSION['errors']);

$old = $_SESSION['old'] ?? [];
unset($_SESSION['old']);

$stmt = $pdo->prepare("SELECT user_id, full_name, department FROM users WHERE role = 'doctor' AND is_active = 1 ORDER BY full_name");
$stmt->execute();
$doctors = $stmt->fetchAll();

require_once '../../includes/header.php';
?>

<!-- Flatpickr CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

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

        <script>document.getElementById('page-title').textContent = 'Book Appointment';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-5xl mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-6 text-sm font-medium">
                    <a href="index.php" class="text-slate-400 hover:text-violet-600 transition-colors">Appointments</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900">Book Appointment</span>
                </nav>

                <!-- Booking Card -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="p-6 lg:p-10">
                        <form id="book-form" method="POST" action="actions/book.php" class="space-y-8">
                            
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                
                                <!-- LEFT COLUMN: Patient Selection -->
                                <div class="space-y-6">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center">
                                            <i class="bi bi-person-plus text-lg"></i>
                                        </div>
                                        <h3 class="font-display font-bold text-lg text-ink-900">Patient Selection</h3>
                                    </div>

                                    <div class="relative">
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Search Patient</label>
                                        <div class="relative">
                                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <i class="bi bi-search text-lg"></i>
                                            </span>
                                            <input type="text" id="patient-search-input" placeholder="Search patient name or ID..."
                                                class="w-full pl-12 pr-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-violet-500 focus:bg-white transition-all outline-none font-medium">
                                        </div>

                                        <!-- Results Dropdown -->
                                        <div id="patient-results" class="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 hidden overflow-hidden">
                                            <!-- Mock items -->
                                            <div class="p-2 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors patient-item" data-id="123" data-name="Grace Wanjiku" data-phone="0723 456 789">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold">GW</div>
                                                    <div>
                                                        <p class="text-xs font-bold text-ink-900">Grace Wanjiku</p>
                                                        <p class="text-[10px] text-slate-400 font-mono">P-00123 • 0723 456 789</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Patient Mini-Card (hidden) -->
                                    <div id="patient-mini-card" class="hidden animate-fade-in">
                                        <div class="p-4 bg-green-50 border border-green-200 rounded-xl relative flex items-center gap-4">
                                            <button type="button" id="clear-patient" class="absolute top-2 right-2 text-green-500 hover:text-green-700">
                                                <i class="bi bi-x-circle-fill"></i>
                                            </button>
                                            <div id="pmc-avatar" class="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-display font-bold">
                                                GW
                                            </div>
                                            <div>
                                                <h4 id="pmc-name" class="font-bold text-ink-900 leading-tight">Grace Wanjiku</h4>
                                                <p id="pmc-details" class="text-xs text-green-700 font-mono">P-00123 • 0723 456 789</p>
                                            </div>
                                        </div>
                                        <input type="hidden" name="patient_id" id="selected-patient-id">
                                    </div>

                                </div>

                                <!-- RIGHT COLUMN: Booking Details -->
                                <div class="space-y-6">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center">
                                            <i class="bi bi-clock-history text-lg"></i>
                                        </div>
                                        <h3 class="font-display font-bold text-lg text-ink-900">Booking Details</h3>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Doctor</label>
                                            <select name="doctor_id" id="doctor-select" class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-violet-500 outline-none font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                                                <option value="">Select Doctor</option>
                                                <option value="1">Dr. James Ochieng — General Medicine</option>
                                                <option value="2">Dr. David Mutua — Paediatrics</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Visit Date</label>
                                            <div class="relative">
                                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <i class="bi bi-calendar3"></i>
                                                </span>
                                                <input type="text" name="appointment_date" id="app-date-picker" placeholder="DD/MM/YYYY"
                                                    class="w-full pl-12 pr-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-violet-500 focus:bg-white transition-all outline-none font-medium">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Time Slots -->
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 pl-1">Available Time Slots</label>
                                        <div id="slot-placeholder" class="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                            <p id="placeholder-text" class="text-xs text-slate-400 font-medium">Select a doctor and date to see available slots</p>
                                            <div id="slots-loading" class="hidden flex flex-col items-center gap-2">
                                                <div class="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                                                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loading slots...</span>
                                            </div>
                                        </div>
                                        
                                        <div id="slots-grid" class="flex flex-wrap gap-2 hidden">
                                            <!-- Pills injected by JS -->
                                        </div>
                                        <input type="hidden" name="appointment_time" id="selected-time">
                                    </div>

                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Reason for Visit</label>
                                        <textarea name="reason" rows="3" placeholder="Briefly describe the reason for visit..."
                                            class="w-full px-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-violet-500 focus:bg-white transition-all outline-none font-medium"></textarea>
                                    </div>

                                </div>

                            </div>

                            <!-- Footer -->
                            <div class="flex items-center justify-end gap-4 pt-8 border-t border-surface-dim">
                                <a href="index.php" class="px-8 py-3.5 text-slate-500 font-bold hover:text-ink-900 transition-all">Cancel</a>
                                <button type="submit" class="px-10 py-3.5 bg-violet-600 text-white font-display font-extrabold rounded-custom hover:bg-violet-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-violet-200">
                                    Book Appointment
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
    
    // 1. Patient Selection Logic
    const patientInput = document.getElementById('patient-search-input');
    const resultsDiv = document.getElementById('patient-results');
    const miniCard = document.getElementById('patient-mini-card');
    const clearBtn = document.getElementById('clear-patient');
    const hiddenPatientId = document.getElementById('selected-patient-id');

    patientInput.addEventListener('keyup', () => {
        const query = patientInput.value.trim();
        if (query.length > 2) {
            fetch('../patients/api/search.php?q=' + encodeURIComponent(query))
                .then(res => res.json())
                .then(data => {
                    resultsDiv.innerHTML = '';
                    if (data.length > 0) {
                        data.forEach(patient => {
                            const div = document.createElement('div');
                            div.className = 'p-2 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors patient-item';
                            div.innerHTML = `
                                <div class="flex items-center gap-3">
                                    <div class="avatar-circle w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold">${patient.full_name.charAt(0)}</div>
                                    <div>
                                        <p class="text-xs font-bold text-ink-900">${patient.full_name}</p>
                                        <p class="text-[10px] text-slate-400 font-mono">P-${patient.patient_id.toString().padStart(5, '0')} • ${patient.phone}</p>
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
        patientInput.parentElement.classList.add('hidden');
        resultsDiv.classList.add('hidden');
    }


    clearBtn.addEventListener('click', () => {
        hiddenPatientId.value = '';
        miniCard.classList.add('hidden');
        patientInput.parentElement.classList.remove('hidden');
        patientInput.value = '';
    });

    // 2. Date Picker
    flatpickr("#app-date-picker", {
        dateFormat: "d/m/Y",
        minDate: "today",
        onChange: () => checkSlotsTrigger()
    });

    // 3. Slot Fetching Logic
    const doctorSelect = document.getElementById('doctor-select');
    const dateInput = document.getElementById('app-date-picker');
    const slotGrid = document.getElementById('slots-grid');
    const slotPlaceholder = document.getElementById('slot-placeholder');
    const placeholderText = document.getElementById('placeholder-text');
    const loadingSpinner = document.getElementById('slots-loading');
    const hiddenTime = document.getElementById('selected-time');

    doctorSelect.addEventListener('change', () => checkSlotsTrigger());

    function checkSlotsTrigger() {
        if (doctorSelect.value && dateInput.value) {
            fetchSlots();
        }
    }

    function fetchSlots() {
        placeholderText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        slotGrid.classList.add('hidden');
        slotPlaceholder.classList.remove('hidden');

        fetch(`api/slots.php?doctor_id=${doctorSelect.value}&date=${dateInput.value}`)
            .then(res => res.json())
            .then(data => {
                loadingSpinner.classList.add('hidden');
                slotPlaceholder.classList.add('hidden');
                slotGrid.classList.remove('hidden');
                renderSlots(data.available, data.taken);
            });
    }

    function renderSlots(slots, taken) {
        const slots = [
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
            "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
            "14:00", "14:30", "15:00", "15:30", "16:00"
        ];
        // Mock taken slots
        const taken = ["09:00", "10:30", "11:00"];

        slotGrid.innerHTML = '';
        slots.forEach(time => {
            const isTaken = taken.includes(time);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `px-4 py-2 rounded-lg text-xs font-bold transition-all border ${isTaken ? 'opacity-40 cursor-not-allowed line-through border-slate-100 bg-slate-50 text-slate-400' : 'border-slate-200 text-slate-600 hover:border-violet-400 hover:bg-violet-50'}`;
            btn.textContent = time;
            
            if (!isTaken) {
                btn.onclick = () => {
                    // Reset others
                    slotGrid.querySelectorAll('button').forEach(b => {
                        if (!b.classList.contains('opacity-40')) {
                            b.className = 'px-4 py-2 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:border-violet-400 hover:bg-violet-50';
                        }
                    });
                    // Set active
                    btn.className = 'px-4 py-2 rounded-lg text-xs font-bold border border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-100';
                    hiddenTime.value = time;
                };
            }
            slotGrid.appendChild(btn);
        });
    }

});
</script>

</body>
</html>
