<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();

$stmt = $pdo->prepare("SELECT * FROM patients WHERE is_active = 1 ORDER BY created_at DESC");
$stmt->execute();
$patients = $stmt->fetchAll();

$patient_count = count($patients);

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
        <script>document.getElementById('page-title').textContent = 'Patients';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-7xl mx-auto animate-fade-up">
                
                <!-- Page Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                            <i class="bi bi-people-fill text-2xl"></i>
                        </div>
                        <div>
                            <h2 class="font-display font-bold text-2xl text-ink-900 tracking-tight">Patients</h2>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">Total: <?= number_format($patient_count) ?></span>
                                <span class="text-xs text-slate-400 font-medium">Meru Level 5 Records</span>
                            </div>
                        </div>
                    </div>
                    <a href="register.php" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-ink-900 font-display font-bold rounded-custom hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                        <i class="bi bi-plus-lg"></i>
                        Register Patient
                    </a>
                </div>

                <!-- Filter Bar -->
                <div class="bg-white rounded-card ghost-border p-4 mb-6 shadow-sm">
                    <form action="#" class="flex flex-col md:flex-row items-center gap-4">
                        <div class="relative flex-1 w-full">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <i class="bi bi-search text-lg"></i>
                            </span>
                            <input type="text" id="patient-search" placeholder="Search by name, phone or ID..." 
                                class="w-full pl-12 pr-12 py-3 bg-surface rounded-custom border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium">
                            <div id="search-spinner" class="absolute right-4 top-1/2 -translate-y-1/2 hidden">
                                <div class="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-4 w-full md:w-auto">
                            <select class="flex-1 md:w-48 px-4 py-3 bg-surface rounded-custom border border-transparent focus:border-blue-500 outline-none font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                                <option>All Genders</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                            <button type="button" class="px-8 py-3 bg-ink-900 text-white font-bold rounded-custom hover:bg-black transition-all">
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Data Table -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-surface-dim">
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Patient ID</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Full Name</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Gender</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Registered</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="patient-table-body" class="divide-y divide-surface-dim">
                                <!-- Sample Row 1 -->
                                <tr class="hover:bg-slate-50/50 transition-colors group">
                                    <td class="px-6 py-5">
                                        <span class="font-mono text-sm text-slate-500">P-00124</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <div class="avatar-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm" data-name="John Kamau">JK</div>
                                            <span class="text-sm font-bold text-ink-900">John Kamau</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">Male</td>
                                    <td class="px-6 py-5 text-sm font-mono text-slate-600">0712 345 678</td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">15/03/2026</td>
                                    <td class="px-6 py-5">
                                        <div class="flex items-center justify-end gap-2 text-right">
                                            <a href="view.php?id=124" title="View" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all">
                                                <i class="bi bi-eye"></i>
                                            </a>
                                            <a href="edit.php?id=124" title="Edit" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-amber-600 hover:border-amber-600 transition-all">
                                                <i class="bi bi-pencil"></i>
                                            </a>
                                            <button onclick="deletePatient(124, this)" title="Delete" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-red-600 hover:border-red-600 transition-all">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Sample Row 2 -->
                                <tr class="hover:bg-slate-50/50 transition-colors group">
                                    <td class="px-6 py-5 font-mono text-sm text-slate-500">P-00123</td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900">
                                        <div class="flex items-center gap-3">
                                            <div class="avatar-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" data-name="Grace Wanjiku">GW</div>
                                            <span>Grace Wanjiku</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">Female</td>
                                    <td class="px-6 py-5 text-sm font-mono text-slate-600">0723 456 789</td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">14/03/2026</td>
                                    <td class="px-6 py-5 flex items-center justify-end gap-2">
                                        <a href="view.php?id=123" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all"><i class="bi bi-eye"></i></a>
                                        <a href="edit.php?id=123" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-amber-600 hover:border-amber-600 transition-all"><i class="bi bi-pencil"></i></a>
                                        <button onclick="deletePatient(123, this)" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"><i class="bi bi-trash"></i></button>
                                    </td>
                                </tr>
                                <!-- More hardcoded samples... -->
                                <tr class="hover:bg-slate-50/50 transition-colors group">
                                    <td class="px-6 py-5 font-mono text-sm text-slate-500">P-00122</td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900">
                                        <div class="flex items-center gap-3">
                                            <div class="avatar-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" data-name="Brian Ochieng">BO</div>
                                            <span>Brian Ochieng</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">Male</td>
                                    <td class="px-6 py-5 text-sm font-mono text-slate-600">0734 567 890</td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">13/03/2026</td>
                                    <td class="px-6 py-5 text-right flex items-center justify-end gap-2">
                                        <a href="view.php?id=122" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all"><i class="bi bi-eye"></i></a>
                                        <a href="edit.php?id=122" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-amber-600 hover:border-amber-600 transition-all"><i class="bi bi-pencil"></i></a>
                                        <button onclick="deletePatient(122, this)" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"><i class="bi bi-trash"></i></button>
                                    </td>
                                </tr>
                                <tr class="hover:bg-slate-50/50 transition-colors group">
                                    <td class="px-6 py-5 font-mono text-sm text-slate-500">P-00121</td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900">
                                        <div class="flex items-center gap-3">
                                            <div class="avatar-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" data-name="Auma Otieno">AO</div>
                                            <span>Auma Otieno</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">Female</td>
                                    <td class="px-6 py-5 text-sm font-mono text-slate-600">0745 678 901</td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">12/03/2026</td>
                                    <td class="px-6 py-5 text-right flex items-center justify-end gap-2">
                                        <a href="view.php?id=121" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all"><i class="bi bi-eye"></i></a>
                                        <a href="edit.php?id=121" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-amber-600 hover:border-amber-600 transition-all"><i class="bi bi-pencil"></i></a>
                                        <button onclick="deletePatient(121, this)" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"><i class="bi bi-trash"></i></button>
                                    </td>
                                </tr>
                                <tr class="hover:bg-slate-50/50 transition-colors group">
                                    <td class="px-6 py-5 font-mono text-sm text-slate-500">P-00120</td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900">
                                        <div class="flex items-center gap-3">
                                            <div class="avatar-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" data-name="David Mutua">DM</div>
                                            <span>David Mutua</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">Male</td>
                                    <td class="px-6 py-5 text-sm font-mono text-slate-600">0756 789 012</td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">11/03/2026</td>
                                    <td class="px-6 py-5 text-right flex items-center justify-end gap-2">
                                        <a href="view.php?id=120" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all"><i class="bi bi-eye"></i></a>
                                        <a href="edit.php?id=120" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-amber-600 hover:border-amber-600 transition-all"><i class="bi bi-pencil"></i></a>
                                        <button onclick="deletePatient(120, this)" class="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-dim text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"><i class="bi bi-trash"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="px-6 py-4 bg-slate-50 border-t border-surface-dim flex items-center justify-between">
                        <p class="text-xs text-slate-500 font-medium">Showing 1 to 5 of 1,248 patients</p>
                        <div class="flex items-center gap-1">
                            <button class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-ink-900 transition-all">Previous</button>
                            <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-[10px] font-bold">1</button>
                            <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-[10px] font-bold">2</button>
                            <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-[10px] font-bold">3</button>
                            <button class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-ink-900 transition-all">Next</button>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('patient-search');
    const spinner = document.getElementById('search-spinner');
    const tableBody = document.getElementById('patient-table-body');

    // Debounce function
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    // Search logic
    const handleSearch = debounce(() => {
        const query = searchInput.value.trim();
        if (query.length < 1) return;
        
        spinner.classList.remove('hidden');
        
        // Mocking fetch 
        // URL: /* ENDPOINT: see contracts/backend-s01.md */
        setTimeout(() => {
            spinner.classList.add('hidden');
            // Mock result replacement
            console.log("Searching for:", query);
        }, 1000);
    });

    searchInput.addEventListener('keyup', handleSearch);

    // Avatar Color Logic
    const colors = [
        'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 
        'bg-pink-500', 'bg-rose-500', 'bg-amber-500', 
        'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500'
    ];

    document.querySelectorAll('.avatar-circle').forEach(avatar => {
        const name = avatar.getAttribute('data-name');
        const firstLetter = name.charAt(0).toUpperCase();
        const colorIndex = firstLetter.charCodeAt(0) % colors.length;
        avatar.classList.add(colors[colorIndex]);
    });

    // Delete Logic
    window.deletePatient = (id, btn) => {
        if (confirm(`Are you sure you want to delete patient P-00${id}?`)) {
            const row = btn.closest('tr');
            row.style.opacity = '0.5';
            row.style.pointerEvents = 'none';
            
            // Mocking POST
            // URL: /* ENDPOINT: see contracts/backend-s01.md */
            setTimeout(() => {
                row.classList.add('transition-all', 'duration-500', 'transform', 'scale-95', 'opacity-0');
                setTimeout(() => row.remove(), 500);
            }, 800);
        }
    };
});
</script>

</body>
</html>
