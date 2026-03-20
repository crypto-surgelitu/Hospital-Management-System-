<?php 
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';
requireLogin();
require_once '../../includes/header.php'; 

// Mocking Edit Mode for demonstration
$is_edit = isset($_GET['id']);
$page_title = $is_edit ? "Edit Drug" : "Add New Drug";
$drug = $is_edit ? [
    'drug_name' => 'Amoxicillin 500mg',
    'generic_name' => 'Amoxicillin Trihydrate',
    'category' => 'Antibiotic',
    'unit' => 'Tablets',
    'quantity_in_stock' => 45,
    'reorder_level' => 50,
    'expiry_date' => '2026-06-15',
    'unit_price' => 15.00
] : null;
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
        <script>document.getElementById('page-title').textContent = '<?php echo $page_title; ?>';</script>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface no-scrollbar">
            <div class="max-w-3xl mx-auto animate-fade-up">
                
                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 mb-8 text-sm font-medium">
                    <a href="inventory.php" class="text-slate-400 hover:text-emerald-600 transition-colors">Pharmacy Inventory</a>
                    <i class="bi bi-chevron-right text-[10px] text-slate-300"></i>
                    <span class="text-ink-900"><?php echo $page_title; ?></span>
                </nav>

                <!-- Form Card -->
                <div class="bg-white rounded-card ghost-border shadow-card overflow-hidden">
                    <div class="p-8 lg:p-12">
                        <div class="flex items-center gap-4 mb-10">
                            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <i class="bi bi-capsule text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="font-display font-bold text-xl text-ink-900"><?php echo $page_title; ?></h3>
                                <p class="text-xs text-slate-400 font-medium">Capture detailed pharmaceutical product specifications</p>
                            </div>
                        </div>

                        <!-- ACTION: see contracts/backend-s04.md -->
                        <form id="drug-form-<?php echo $is_edit ? 'edit' : 'add'; ?>" method="POST" action="#" class="space-y-8">
                            
                            <?php if($is_edit): ?>
                                <input type="hidden" name="drug_id" value="<?php echo $_GET['id']; ?>">
                            <?php endif; ?>

                            <!-- Row 1: Names -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Brand/Drug Name</label>
                                    <input type="text" name="drug_name" value="<?php echo $drug['drug_name'] ?? ''; ?>" required placeholder="e.g. Amoxicillin 500mg"
                                        class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-sm">
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Generic Name</label>
                                    <input type="text" name="generic_name" value="<?php echo $drug['generic_name'] ?? ''; ?>" placeholder="e.g. Amoxicillin Trihydrate"
                                        class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-sm">
                                </div>
                            </div>

                            <!-- Row 2: Categorization -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Category</label>
                                    <select name="category" required class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                                        <option value="">Select Category...</option>
                                        <?php 
                                        $categories = ['Antibiotic', 'Analgesic', 'Antimalaria', 'Antifungal', 'Other'];
                                        foreach($categories as $cat):
                                            $selected = ($drug['category'] ?? '') === $cat ? 'selected' : '';
                                            echo "<option value=\"$cat\" $selected>$cat</option>";
                                        endforeach;
                                        ?>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Dispensing Unit</label>
                                    <select name="unit" required class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat">
                                        <option value="">Select Unit...</option>
                                        <?php 
                                        $units = ['Tablets', 'Capsules', 'Vials', 'Bottles', 'Sachets', 'Other'];
                                        foreach($units as $unit):
                                            $selected = ($drug['unit'] ?? '') === $unit ? 'selected' : '';
                                            echo "<option value=\"$unit\" $selected>$unit</option>";
                                        endforeach;
                                        ?>
                                    </select>
                                </div>
                            </div>

                            <!-- Row 3: Inventory Levels -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Quantity in Stock</label>
                                    <input type="number" name="quantity_in_stock" value="<?php echo $drug['quantity_in_stock'] ?? ''; ?>" min="0" required
                                        class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-sm">
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Reorder Level (Alert Threshold)</label>
                                    <input type="number" name="reorder_level" value="<?php echo $drug['reorder_level'] ?? ''; ?>" min="0" required
                                        class="w-full px-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-sm">
                                </div>
                            </div>

                            <!-- Row 4: Dates & Pricing -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Expiry Date</label>
                                    <div class="relative">
                                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <i class="bi bi-calendar-check"></i>
                                        </span>
                                        <input type="text" name="expiry_date" id="expiry-picker" value="<?php echo $drug['expiry_date'] ?? ''; ?>" required
                                            class="w-full pl-10 pr-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-sm">
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Unit Price (KES)</label>
                                    <div class="relative">
                                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">KES</span>
                                        <input type="number" name="unit_price" value="<?php echo $drug['unit_price'] ?? ''; ?>" step="0.01" min="0" required
                                            class="w-full pl-12 pr-4 py-3.5 bg-surface rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-sm">
                                    </div>
                                </div>
                            </div>

                            <!-- Buttons -->
                            <div class="flex items-center justify-end gap-6 pt-10 border-t border-surface-dim">
                                <a href="inventory.php" class="text-sm font-bold text-slate-400 hover:text-ink-900 transition-all">Cancel</a>
                                <button type="submit" class="px-10 py-4 bg-emerald-500 text-white font-display font-extrabold rounded-custom hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 flex items-center gap-3">
                                    Save Drug Record
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

<!-- Flatpickr JS -->
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    flatpickr("#expiry-picker", {
        dateFormat: "Y-m-d",
        minDate: "today"
    });
});
</script>

</body>
</html>
