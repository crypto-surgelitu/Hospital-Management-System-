<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();
requireRole(['pharmacy', 'admin']);

$errors = [];

$drug_id = intval($_POST['drug_id'] ?? 0);
$drug_name = trim($_POST['drug_name'] ?? '');
$generic_name = trim($_POST['generic_name'] ?? '');
$category = trim($_POST['category'] ?? '');
$quantity_in_stock = intval($_POST['quantity_in_stock'] ?? 0);
$unit = trim($_POST['unit'] ?? '');
$expiry_date = trim($_POST['expiry_date'] ?? '');
$reorder_level = intval($_POST['reorder_level'] ?? 0);
$unit_price = floatval($_POST['unit_price'] ?? 0);

if (!$drug_id) {
    header('Location: /hms/modules/pharmacy/inventory.php');
    exit;
}

$check = $pdo->prepare("SELECT drug_id FROM drugs WHERE drug_id = ? AND is_active = 1");
$check->execute([$drug_id]);
if (!$check->fetch()) {
    header('Location: /hms/modules/pharmacy/inventory.php');
    exit;
}

if (empty($drug_name)) {
    $errors['drug_name'] = 'Drug name is required.';
} elseif (strlen($drug_name) > 150) {
    $errors['drug_name'] = 'Drug name must be under 150 characters.';
}

if ($quantity_in_stock < 0) {
    $errors['quantity_in_stock'] = 'Quantity cannot be negative.';
}

if ($unit_price < 0) {
    $errors['unit_price'] = 'Price cannot be negative.';
}

if ($reorder_level < 0) {
    $errors['reorder_level'] = 'Reorder level cannot be negative.';
}

if (!empty($expiry_date)) {
    $expiry_obj = DateTime::createFromFormat('Y-m-d', $expiry_date);
    if (!$expiry_obj || $expiry_obj <= new DateTime()) {
        $errors['expiry_date'] = 'Expiry date must be a future date.';
    }
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $_POST;
    header('Location: /hms/modules/pharmacy/drug_form.php?id=' . $drug_id);
    exit;
}

$stmt = $pdo->prepare("
    UPDATE drugs 
    SET drug_name = ?, generic_name = ?, category = ?, quantity_in_stock = ?, unit = ?, 
        expiry_date = ?, reorder_level = ?, unit_price = ?
    WHERE drug_id = ?
");
$stmt->execute([
    $drug_name,
    $generic_name ?: null,
    $category ?: null,
    $quantity_in_stock,
    $unit ?: null,
    $expiry_date ?: null,
    $reorder_level,
    $unit_price,
    $drug_id,
]);

$_SESSION['flash_success'] = 'Drug updated successfully.';
header('Location: /hms/modules/pharmacy/inventory.php?success=updated');
exit;