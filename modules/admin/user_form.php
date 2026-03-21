<?php
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';

requireLogin();
requireRole(['admin']);

$is_edit = isset($_GET['id']);
$page_title = $is_edit ? "Edit User" : "Create User";
$user = null;

if ($is_edit) {
    $id = intval($_GET['id']);
    $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();
}

$errors = $_SESSION['errors'] ?? [];
unset($_SESSION['errors']);

$old = $_SESSION['old'] ?? [];
unset($_SESSION['old']);

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
        <script>document.getElementById('page-title').textContent = '<?php echo $page_title; ?>';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-2xl mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-8 text-sm font-medium">
                    <a href="users.php" class="text-slate-400 hover:text-red-500 transition-colors">Users</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900"><?php echo $page_title; ?></span>
                </nav>

                <!-- Form Card -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="p-8 lg:p-12">
                        <div class="flex items-center gap-4 mb-10">
                            <div class="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                                <i class="bi bi-person-badge text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="font-display font-bold text-xl text-ink-900"><?php echo $page_title; ?></h3>
                                <p class="text-xs text-slate-400 font-medium">Configure staff credentials and access permissions</p>
                            </div>
                        </div>

<!-- ACTION: see contracts/backend-s06.md -->
<form id="<?= $is_edit ? 'edit' : 'create' ?>-user-form" method="POST" action="<?= $is_edit ? 'modules/admin/actions/update_user.php' : 'modules/admin/actions/create_user.php' ?>" class="space-y-8">
                            
<?php if($is_edit): ?>
<input type="hidden" name="user_id" value="<?= $user['user_id'] ?? '' ?>">
<?php endif; ?>

                            <!-- Full Name -->
                            <div class="space-y-2">
                                <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Full Name</label>
                                <input type="text" name="full_name" value="<?php echo $user['full_name'] ?? ''; ?>" required placeholder="e.g. Dr. Jane Doe"
                                    class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-red-500 focus:bg-white outline-none transition-all font-medium text-sm">
                            </div>

                            <!-- Username -->
                            <div class="space-y-2">
                                <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Username</label>
                                <input type="text" name="username" value="<?php echo $user['username'] ?? ''; ?>" required placeholder="j.doe"
                                    class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-red-500 focus:bg-white outline-none transition-all font-mono font-bold text-sm">
                            </div>

                            <!-- Role Selector -->
                            <div class="space-y-3">
                                <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Role Assignment</label>
                                <div class="flex flex-wrap gap-2" id="role-selector">
                                    <button type="button" onclick="setRole('admin', this)" class="px-4 py-2 bg-white border-2 border-slate-100 text-slate-500 rounded-pill text-[10px] font-bold uppercase tracking-wider transition-all hover:border-red-100 role-btn <?php echo ($user['role'] ?? '') === 'admin' ? 'active' : ''; ?>">Admin</button>
                                    <button type="button" onclick="setRole('doctor', this)" class="px-4 py-2 bg-white border-2 border-slate-100 text-slate-500 rounded-pill text-[10px] font-bold uppercase tracking-wider transition-all hover:border-red-100 role-btn <?php echo ($user['role'] ?? '') === 'doctor' ? 'active' : ''; ?>">Doctor</button>
                                    <button type="button" onclick="setRole('lab', this)" class="px-4 py-2 bg-white border-2 border-slate-100 text-slate-500 rounded-pill text-[10px] font-bold uppercase tracking-wider transition-all hover:border-red-100 role-btn <?php echo ($user['role'] ?? '') === 'lab' ? 'active' : ''; ?>">Lab Tech</button>
                                    <button type="button" onclick="setRole('pharmacy', this)" class="px-4 py-2 bg-white border-2 border-slate-100 text-slate-500 rounded-pill text-[10px] font-bold uppercase tracking-wider transition-all hover:border-red-100 role-btn <?php echo ($user['role'] ?? '') === 'pharmacy' ? 'active' : ''; ?>">Pharmacist</button>
                                    <button type="button" onclick="setRole('receptionist', this)" class="px-4 py-2 bg-white border-2 border-slate-100 text-slate-500 rounded-pill text-[10px] font-bold uppercase tracking-wider transition-all hover:border-red-100 role-btn <?php echo ($user['role'] ?? '') === 'receptionist' ? 'active' : ''; ?>">Receptionist</button>
                                </div>
                                <input type="hidden" name="role" id="role-input" value="<?php echo $user['role'] ?? ''; ?>" required>
                            </div>

                            <!-- Department -->
                            <div class="space-y-2">
                                <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Department</label>
                                <input type="text" name="department" value="<?php echo $user['department'] ?? ''; ?>" placeholder="e.g. General Medicine"
                                    class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-red-500 focus:bg-white outline-none transition-all font-medium text-sm">
                            </div>

                            <!-- Password Section -->
                            <div class="pt-6 border-t border-slate-100 space-y-6">
                                <?php if($is_edit): ?>
                                    <div class="flex items-center gap-3 mb-4">
                                        <input type="checkbox" id="change-password-toggle" onchange="togglePasswordFields(this)" class="w-4 h-4 rounded text-red-500 focus:ring-red-500">
                                        <label for="change-password-toggle" class="text-xs font-bold text-slate-500">Change password?</label>
                                        <input type="hidden" name="change_password" id="change-password-input" value="0">
                                    </div>
                                <?php endif; ?>

                                <div id="password-fields" class="<?php echo $is_edit ? 'hidden' : ''; ?> space-y-4">
                                    <div class="space-y-2">
                                        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Security Credentials</label>
                                        <div class="flex gap-2">
                                            <div class="relative flex-1">
                                                <input type="password" name="password" id="password-input" placeholder="Enter or generate password"
                                                    class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-red-500 focus:bg-white outline-none transition-all font-mono font-bold text-sm">
                                                <button type="button" onclick="togglePasswordVisibility()" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                    <i class="bi bi-eye" id="toggle-eye"></i>
                                                </button>
                                            </div>
                                            <button type="button" onclick="generatePassword()" class="px-4 py-3.5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
                                                <i class="bi bi-key-fill"></i>
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Form Actions -->
                            <div class="flex items-center justify-end gap-6 pt-10 border-t border-slate-100">
                                <a href="users.php" class="text-sm font-bold text-slate-400 hover:text-ink-900 transition-all">Cancel</a>
                                <button type="submit" class="px-10 py-4 bg-red-500 text-white font-display font-extrabold rounded-custom hover:bg-red-600 transition-all shadow-xl shadow-red-100 flex items-center gap-3">
                                    Save User Profile
                                    <i class="bi bi-check-lg"></i>
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

            </div>
        </main>
    </div>
</div>

<style>
.role-btn.active {
    background-color: #EF4444 !important;
    border-color: #EF4444 !important;
    color: white !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}
</style>

<script>
function setRole(role, btn) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('role-input').value = role;
}

function togglePasswordVisibility() {
    const input = document.getElementById('password-input');
    const eye = document.getElementById('toggle-eye');
    if (input.type === 'password') {
        input.type = 'text';
        eye.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        input.type = 'password';
        eye.classList.replace('bi-eye-slash', 'bi-eye');
    }
}

function generatePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 10; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const input = document.getElementById('password-input');
    input.type = 'text';
    input.value = pass;
    document.getElementById('toggle-eye').classList.replace('bi-eye', 'bi-eye-slash');
}

function togglePasswordFields(checkbox) {
    const fields = document.getElementById('password-fields');
    const inputS = document.getElementById('change-password-input');
    if (checkbox.checked) {
        fields.classList.remove('hidden');
        inputS.value = '1';
    } else {
        fields.classList.add('hidden');
        inputS.value = '0';
    }
}

// Initial active role styling if edit
document.addEventListener('DOMContentLoaded', () => {
    const activeBtn = document.querySelector('.role-btn.active');
    if(activeBtn) activeBtn.classList.add('active');
});
</script>

</body>
</html>
