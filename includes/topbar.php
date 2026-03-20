<!-- Topbar -->
<header class="h-[60px] bg-white border-b border-surface-dim sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
    <!-- Left: Mobile Toggle & Title -->
    <div class="flex items-center gap-4">
        <button onclick="toggleSidebar()" class="lg:hidden p-2 text-ink-900 hover:bg-surface rounded-custom transition-all">
            <i class="bi bi-list text-2xl"></i>
        </button>
        <h1 id="page-title" class="font-display font-bold text-lg lg:text-xl text-ink-900 tracking-tight">Dashboard</h1>
    </div>

    <!-- Right: Notifications & User -->
    <div class="flex items-center gap-2 lg:gap-4">
        <!-- Notification Bell -->
        <button class="relative p-2 text-slate-500 hover:text-primary transition-all rounded-custom hover:bg-surface group">
            <i class="bi bi-bell text-xl"></i>
            <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        <!-- Vertical Divider -->
        <div class="h-6 w-px bg-surface-dim mx-1"></div>

        <!-- User Chip -->
        <div class="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-surface-dim hover:border-primary transition-all cursor-pointer group">
            <div class="hidden sm:block text-right">
                <p class="text-[11px] font-bold text-ink-900 leading-tight"><?php echo $_SESSION['full_name'] ?? 'HMS Staff'; ?></p>
                <p class="text-[9px] font-medium text-slate-500 uppercase leading-none tracking-wider"><?php echo $_SESSION['role'] ?? 'Staff'; ?></p>
            </div>
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                <?php 
                    $name_parts = explode(' ', $_SESSION['full_name'] ?? 'HMS User');
                    echo strtoupper(substr($name_parts[0], 0, 1));
                ?>
            </div>
            <i class="bi bi-chevron-down text-[10px] text-slate-400 mr-1 group-hover:text-primary transition-colors"></i>
        </div>
    </div>
</header>
