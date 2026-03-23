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
                                <?php if (empty($users)): ?>
                                <tr><td colspan="6" class="px-6 py-12 text-center text-slate-400">No users found</td></tr>
                                <?php else: foreach ($users as $u): 
                                    $role_color = match($u['role']) {
                                        'admin' => 'red',
                                        'doctor' => 'blue',
                                        'pharmacist' => 'emerald',
                                        'lab_tech' => 'violet',
                                        'receptionist' => 'amber',
                                        default => 'slate'
                                    };
                                    $active = $u['is_active'];
                                ?>
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-<?= $role_color ?>-100 text-<?= $role_color ?>-600 flex items-center justify-center text-[10px] font-bold"><?= getInitials($u['full_name']) ?></div>
                                            <span class="text-sm font-bold text-ink-900"><?= htmlspecialchars($u['full_name']) ?></span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="text-xs font-mono text-slate-400"><?= htmlspecialchars($u['username']) ?></span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <span class="bg-<?= $role_color ?>-50 text-<?= $role_color ?>-600 border border-<?= $role_color ?>-200 rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"><?= ucfirst(str_replace('_', ' ', $u['role'])) ?></span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-500"><?= htmlspecialchars($u['department'] ?? 'General') ?></td>
                                    <td class="px-6 py-5">
                                        <button onclick="toggleUserStatus(<?= $u['user_id'] ?>, this)" data-active="<?= $active ? 'true' : 'false' ?>" class="w-10 h-5 rounded-full p-1 transition-all <?= $active ? 'bg-green-500' : 'bg-slate-200' ?> relative">
                                            <div class="w-3 h-3 bg-white rounded-full shadow-sm transform <?= $active ? 'translate-x-5' : 'translate-x-0' ?> transition-transform duration-200"></div>
                                        </button>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <a href="user_form.php?id=<?= $u['user_id'] ?>" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Edit</a>
                                    </td>
                                </tr>
                                <?php endforeach; endif; ?>
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
