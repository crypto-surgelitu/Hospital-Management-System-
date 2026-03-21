<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();
requireRole(['admin']);

$stmt = $pdo->prepare("SELECT * FROM users ORDER BY role ASC, full_name ASC");
$stmt->execute();
$users = $stmt->fetchAll();

$flash_success = $_SESSION['flash_success'] ?? null;
unset($_SESSION['flash_success']);

require_once '../../includes/header.php';
?>

<body data-role-required="admin">
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

        <script>document.getElementById('page-title').textContent = 'User Management';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-7xl mx-auto animate-fade-up">
                
                <!-- Page Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-sm">
                            <i class="bi bi-shield-lock-fill text-2xl"></i>
                        </div>
                        <div>
                            <h2 class="text-xl font-display font-extrabold text-ink-900 tracking-tight">User Management</h2>
                            <p class="text-xs text-slate-400 font-medium">Manage system access, roles, and account status</p>
                        </div>
                    </div>
                    <a href="user_form.php" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#EF4444] text-white font-display font-bold rounded-custom hover:bg-[#DC2626] transition-all shadow-lg shadow-red-100">
                        <i class="bi bi-person-plus-fill"></i>
                        Create User
                    </a>
                </div>

                <!-- User Table -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-surface-dim">
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Staff Member</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Username</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Department</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                    <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-dim">
                                <!-- Admin -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">AA</div>
                                            <span class="text-sm font-bold text-ink-900">Admin Account</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-xs font-mono text-slate-400">admin</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="bg-ink-800 text-white rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">Admin</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500">Administration</td>
                                    <td class="px-6 py-5">
                                        <button onclick="toggleUserStatus(1, this)" data-active="true" class="w-10 h-5 rounded-full p-1 transition-all bg-green-500 relative">
                                            <div class="w-3 h-3 bg-white rounded-full shadow-sm transform translate-x-5 transition-transform duration-200"></div>
                                        </button>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="user_form.php?id=1" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Edit</a>
                                    </td>
                                </tr>
                                <!-- Doctor -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">JO</div>
                                            <span class="text-sm font-bold text-ink-900">Dr. James Ochieng</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-xs font-mono text-slate-400">dr.ochieng</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="bg-blue-50 text-blue-600 border border-blue-200 rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">Doctor</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500">General Medicine</td>
                                    <td class="px-6 py-5">
                                        <button onclick="toggleUserStatus(2, this)" data-active="true" class="w-10 h-5 rounded-full p-1 transition-all bg-green-500 relative">
                                            <div class="w-3 h-3 bg-white rounded-full shadow-sm transform translate-x-5 transition-transform duration-200"></div>
                                        </button>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="user_form.php?id=2" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Edit</a>
                                    </td>
                                </tr>
                                <!-- Pharmacist -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">JM</div>
                                            <span class="text-sm font-bold text-ink-900">Jane Mwangi</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-xs font-mono text-slate-400">j.mwangi</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">Pharmacist</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500">Pharmacy</td>
                                    <td class="px-6 py-5">
                                        <button onclick="toggleUserStatus(3, this)" data-active="true" class="w-10 h-5 rounded-full p-1 transition-all bg-green-500 relative">
                                            <div class="w-3 h-3 bg-white rounded-full shadow-sm transform translate-x-5 transition-transform duration-200"></div>
                                        </button>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="user_form.php?id=3" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Edit</a>
                                    </td>
                                </tr>
                                <!-- Lab Tech -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-[10px] font-bold">BO</div>
                                            <span class="text-sm font-bold text-ink-900">Brian Otieno</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-xs font-mono text-slate-400">b.otieno</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="bg-cyan-50 text-cyan-600 border border-cyan-200 rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">Lab Tech</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500">Laboratory</td>
                                    <td class="px-6 py-5">
                                        <button onclick="toggleUserStatus(4, this)" data-active="false" class="w-10 h-5 rounded-full p-1 transition-all bg-slate-300 relative">
                                            <div class="w-3 h-3 bg-white rounded-full shadow-sm transform translate-x-0 transition-transform duration-200"></div>
                                        </button>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="user_form.php?id=4" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Edit</a>
                                    </td>
                                </tr>
                                <!-- Receptionist -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold">AW</div>
                                            <span class="text-sm font-bold text-ink-900">Ann Wambui</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-xs font-mono text-slate-400">a.wambui</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="bg-violet-50 text-violet-600 border border-violet-200 rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">Receptionist</span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500">Reception</td>
                                    <td class="px-6 py-5">
                                        <button onclick="toggleUserStatus(5, this)" data-active="true" class="w-10 h-5 rounded-full p-1 transition-all bg-green-500 relative">
                                            <div class="w-3 h-3 bg-white rounded-full shadow-sm transform translate-x-5 transition-transform duration-200"></div>
                                        </button>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="user_form.php?id=5" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Edit</a>
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
function toggleUserStatus(userId, btn) {
    const isActive = btn.getAttribute('data-active') === 'true';
    const newState = !isActive;
    
    // UI Update (Optimistic)
    const knob = btn.querySelector('div');
    if (newState) {
        btn.className = 'w-10 h-5 rounded-full p-1 transition-all bg-green-500 relative';
        knob.style.transform = 'translateX(1.25rem)';
    } else {
        btn.className = 'w-10 h-5 rounded-full p-1 transition-all bg-slate-300 relative';
        knob.style.transform = 'translateX(0)';
    }
    btn.setAttribute('data-active', newState);

    fetch('api/toggle_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: newState })
    });

}
</script>

</body>
</html>
