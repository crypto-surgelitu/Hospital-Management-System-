<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();
requireRole(['pharmacy', 'admin']);

$errors = [];

$patient_id = intval($_POST['patient_id'] ?? 0);
$drug_id = intval($_POST['drug_id'] ?? 0);
$quantity_issued = intval($_POST['quantity_issued'] ?? 0);
$dosage_instructions = trim($_POST['dosage_instructions'] ?? '');

if (!$patient_id) {
    $errors['patient'] = 'Please select a patient.';
} else {
    $check = $pdo->prepare("SELECT COUNT(*) FROM patients WHERE patient_id = ? AND is_active = 1");
    $check->execute([$patient_id]);
    if (!$check->fetchColumn()) {
        $errors['patient'] = 'Patient not found.';
    }
}

if (!$drug_id) {
    $errors['drug'] = 'Please select a drug.';
} else {
    $check = $pdo->prepare("SELECT COUNT(*) FROM drugs WHERE drug_id = ? AND is_active = 1");
    $check->execute([$drug_id]);
    if (!$check->fetchColumn()) {
        $errors['drug'] = 'Drug not found.';
    }
}

if ($quantity_issued < 1) {
    $errors['quantity'] = 'Quantity must be at least 1.';
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $_POST;
    header('Location: /modules/pharmacy/dispense.php');
    exit;
}

$stmt = $pdo->prepare("SELECT quantity_in_stock, unit FROM drugs WHERE drug_id = ? AND is_active = 1");
$stmt->execute([$drug_id]);
$drug = $stmt->fetch();

if ($quantity_issued > $drug['quantity_in_stock']) {
    $_SESSION['errors'] = ['quantity' => "Insufficient stock. Available: {$drug['quantity_in_stock']} {$drug['unit']}"];
    $_SESSION['old'] = $_POST;
    header('Location: /modules/pharmacy/dispense.php');
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO dispensing (drug_id, patient_id, pharmacist_id, quantity_issued, dosage_instructions, dispense_date)
        VALUES (?, ?, ?, ?, ?, CURDATE())
    ");
    $stmt->execute([
        $drug_id,
        $patient_id,
        $_SESSION['user_id'],
        $quantity_issued,
        $dosage_instructions ?: null,
    ]);

    $stmt = $pdo->prepare("UPDATE drugs SET quantity_in_stock = quantity_in_stock - ? WHERE drug_id = ?");
    $stmt->execute([$quantity_issued, $drug_id]);

    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    $_SESSION['errors'] = ['general' => 'Failed to dispense. Please try again.'];
    $_SESSION['old'] = $_POST;
    header('Location: /modules/pharmacy/dispense.php');
    exit;
}

$_SESSION['flash_success'] = 'Drug dispensed successfully.';
header('Location: /modules/pharmacy/history.php?success=dispensed');
exit;