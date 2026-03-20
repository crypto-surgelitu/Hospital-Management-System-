<?php 
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';
requireLogin();
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
        <script>document.getElementById('page-title').textContent = 'Dispensing History';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-7xl mx-auto animate-fade-up">
                
                <!-- Filter Bar -->
                <div class="bg-white rounded-card ghost-border shadow-sm p-4 mb-8">
                    <form action="#" method="GET" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        <!-- Patient Search -->
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <i class="bi bi-person-search"></i>
                            </span>
                            <input type="text" placeholder="Search patient name or ID..." 
                                class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-emerald-500 focus:bg-white outline-none text-sm transition-all font-medium">
                        </div>

                        <!-- Date Range -->
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <i class="bi bi-calendar-range"></i>
                            </span>
                            <input type="text" id="date-range-picker" placeholder="Select dates..." 
                                class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-emerald-500 focus:bg-white outline-none text-sm transition-all font-medium">
                        </div>

                        <!-- Sort Order -->
                        <div class="relative">
                            <select class="w-full px-4 py-2.5 bg-surface rounded-lg border border-transparent focus:border-emerald-500 focus:bg-white outline-none text-sm transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>

                        <!-- Search Button -->
                        <button type="submit" class="bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2">
                            <i class="bi bi-funnel"></i>
                            Filter Records
                        </button>

                    </form>
                </div>

                <!-- History Table -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-surface-dim">
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Dispense ID</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Patient</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Drug</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Qty</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Dispensed By</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Dosage</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-dim">
                                <!-- DS-001 -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <span class="text-[11px] font-mono text-slate-400">DS-001</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">John Kamau</span>
                                            <span class="text-[10px] font-mono text-slate-400">P-00124</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">Amoxicillin 500mg</td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900">10 <span class="text-[10px] font-normal text-slate-400">tabs</span></td>
                                    <td class="px-6 py-5 text-sm text-slate-500">Jane Mwangi</td>
                                    <td class="px-6 py-5 text-sm text-slate-500">19/03/2026</td>
                                    <td class="px-6 py-5 text-xs text-slate-400 font-medium max-w-[200px] truncate">1 tab 3x daily after meals</td>
                                    <td class="px-6 py-5 text-right">
                                        <button class="text-xs font-bold text-emerald-500 hover:text-emerald-700 transition-colors">Print Label</button>
                                    </td>
                                </tr>
                                <!-- DS-002 -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <span class="text-[11px] font-mono text-slate-400">DS-002</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-ink-900">Grace Wanjiku</span>
                                            <span class="text-[10px] font-mono text-slate-400">P-00123</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-sm font-medium text-slate-600">Paracetamol 500mg</td>
                                    <td class="px-6 py-5 text-sm font-bold text-ink-900">20 <span class="text-[10px] font-normal text-slate-400">tabs</span></td>
                                    <td class="px-6 py-5 text-sm text-slate-500">Jane Mwangi</td>
                                    <td class="px-6 py-5 text-sm text-slate-500">19/03/2026</td>
                                    <td class="px-6 py-5 text-xs text-slate-400 font-medium max-w-[200px] truncate">2 tabs PRN</td>
                                    <td class="px-6 py-5 text-right">
                                        <button class="text-xs font-bold text-emerald-500 hover:text-emerald-700 transition-colors">Print Label</button>
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

<!-- Flatpickr JS -->
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    flatpickr("#date-range-picker", {
        mode: "range",
        dateFormat: "d/m/Y",
        maxDate: "today"
    });
});
</script>

</body>
</html>
