<?php
$pageTitle = 'Doctor Dashboard';
require_once '../includes/header.php';
require_once '../includes/sidebar.php';
require_once '../includes/topbar.php';
?>
<main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface">
    <h1 class="text-2xl font-bold text-ink-900">Doctor Dashboard</h1>
    <p class="mt-2 text-slate-600">Welcome back, Dr. <?= htmlspecialchars($_SESSION['full_name']) ?></p>
</main>
</body></html>