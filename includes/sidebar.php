<!-- Sidebar -->
<aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-[260px] bg-ink-900 text-white transition-transform duration-300 transform -translate-x-full lg:translate-x-0 flex flex-col no-scrollbar overflow-y-auto">
    <!-- Header -->
    <div class="p-6 flex flex-col gap-4">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-ink-900 font-display font-bold text-xl">M</div>
            <div>
                <h2 class="font-display font-bold text-lg leading-none tracking-tight">HMS Meru</h2>
                <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Meru Level 5</span>
            </div>
        </div>
        
        <!-- Role Badge -->
        <div class="inline-flex self-start px-2 py-1 rounded-full bg-ink-800 border border-ink-700">
            <span class="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <span class="w-1 h-1 rounded-full bg-primary"></span>
                <?php echo $_SESSION['role'] ?? 'Hospital Staff'; ?>
            </span>
        </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-2 flex flex-col gap-6">
        <!-- Admin Group -->
        <div data-role="admin" class="nav-group">
            <h3 class="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">System Control</h3>
            <ul class="space-y-1">
                <li>
                    <a href="dashboard.php" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-custom transition-all duration-200 hover:bg-ink-800 text-slate-300 hover:text-white group">
                        <i class="bi bi-grid-1x2 text-lg"></i>
                        <span class="text-sm font-medium">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="users.php" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-custom transition-all duration-200 hover:bg-ink-800 text-slate-300 hover:text-white group">
                        <i class="bi bi-people text-lg"></i>
                        <span class="text-sm font-medium">User Management</span>
                    </a>
                </li>
            </ul>
        </div>

        <!-- Clinical Group -->
        <div data-role="doctor nurse" class="nav-group">
            <h3 class="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Clinical Focus</h3>
            <ul class="space-y-1">
                <li>
                    <a href="appointments.php" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-custom transition-all duration-200 hover:bg-ink-800 text-slate-300 hover:text-white group relative">
                        <i class="bi bi-calendar-event text-lg"></i>
                        <span class="text-sm font-medium">Appointments</span>
                        <span data-badge="appointments" class="absolute right-3 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-ink-900 text-[10px] font-bold rounded-full hidden"></span>
                    </a>
                </li>
                <li>
                    <a href="patients.php" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-custom transition-all duration-200 hover:bg-ink-800 text-slate-300 hover:text-white group">
                        <i class="bi bi-person-heart text-lg"></i>
                        <span class="text-sm font-medium">Patient Records</span>
                    </a>
                </li>
            </ul>
        </div>

        <!-- Services Group -->
        <div data-role="pharmacist lab receptionist" class="nav-group">
            <h3 class="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Hospital Services</h3>
            <ul class="space-y-1">
                <li>
                    <a href="lab.php" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-custom transition-all duration-200 hover:bg-ink-800 text-slate-300 hover:text-white group relative">
                        <i class="bi bi-flask text-lg"></i>
                        <span class="text-sm font-medium">Lab Tests</span>
                        <span data-badge="lab" class="absolute right-3 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-ink-900 text-[10px] font-bold rounded-full hidden"></span>
                    </a>
                </li>
                <li>
                    <a href="pharmacy.php" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-custom transition-all duration-200 hover:bg-ink-800 text-slate-300 hover:text-white group">
                        <i class="bi bi-capsule text-lg"></i>
                        <span class="text-sm font-medium">Pharmacy</span>
                    </a>
                </li>
            </ul>
        </div>
    </nav>

    <!-- Footer -->
    <div class="mt-auto p-4 border-t border-ink-800">
        <div class="flex items-center gap-3 px-2">
            <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white uppercase ring-2 ring-primary/20 ring-offset-2 ring-offset-ink-900">
                <?php 
                    $name_parts = explode(' ', $_SESSION['full_name'] ?? 'HMS User');
                    $initials = '';
                    foreach($name_parts as $part) $initials .= strtoupper($part[0]);
                    echo substr($initials, 0, 2);
                ?>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-bold truncate"><?php echo $_SESSION['full_name'] ?? 'HMS Staff Member'; ?></p>
                <p class="text-[10px] text-slate-500 font-medium uppercase truncate"><?php echo $_SESSION['role'] ?? 'Authenticated'; ?></p>
            </div>
            <a href="logout.php" title="Logout" class="text-slate-400 hover:text-white transition-colors">
                <i class="bi bi-box-arrow-right text-lg"></i>
            </a>
        </div>
    </div>
</aside>

<!-- Mobile Overlay -->
<div id="sidebar-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 hidden lg:hidden"></div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.php';
    
    // Toggle Mobile Sidebar
    window.toggleSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    };

    overlay.addEventListener('click', toggleSidebar);

    // Active Link Highlighting
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.remove('text-slate-300', 'hover:bg-ink-800');
            link.classList.add('bg-ink-800', 'text-white', 'border-l-4', 'border-primary', 'rounded-l-none');
            link.querySelector('i').classList.add('text-primary');
        }
    });

    // Badge Count Logic (Demo)
    window.updateBadge = (key, count) => {
        const badge = document.querySelector(`[data-badge="${key}"]`);
        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('hidden', count <= 0);
        }
    };
});
</script>
