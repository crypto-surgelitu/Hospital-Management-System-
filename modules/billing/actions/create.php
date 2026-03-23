<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();
requireRole(['admin', 'receptionist']);

$errors = [];

$patient_id = intval($_POST['patient_id'] ?? 0);
$items = $_POST['items'] ?? [];

if (!$patient_id) {
    $errors['patient'] = 'Please select a patient.';
} else {
    $check = $pdo->prepare("SELECT COUNT(*) FROM patients WHERE patient_id = ? AND is_active = 1");
    $check->execute([$patient_id]);
    if (!$check->fetchColumn()) {
        $errors['patient'] = 'Patient not found.';
    }
}

if (empty($items)) {
    $errors['items'] = 'At least one item is required.';
} else {
    foreach ($items as $i => $item) {
        $desc = trim($item['description'] ?? '');
        $qty = intval($item['quantity'] ?? 0);
        $price = floatval($item['unit_price'] ?? 0);

        if (empty($desc)) {
            $errors["items[$i][description]"] = 'Description is required.';
        }
        if ($qty < 1) {
            $errors["items[$i][quantity]"] = 'Quantity must be at least 1.';
        }
        if ($price < 0) {
            $errors["items[$i][unit_price]"] = 'Price cannot be negative.';
        }
    }
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $_POST;
    header('Location: /hms/modules/billing/create.php');
    exit;
}

$total = 0;
foreach ($items as $item) {
    $subtotal = intval($item['quantity']) * floatval($item['unit_price']);
    $total += $subtotal;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO bills (patient_id, total_amount, bill_date, generated_by, payment_status)
        VALUES (?, ?, CURDATE(), ?, 'Unpaid')
    ");
    $stmt->execute([
        $patient_id,
        $total,
        $_SESSION['user_id'],
    ]);

    $bill_id = $pdo->lastInsertId();

    foreach ($items as $item) {
        $subtotal = intval($item['quantity']) * floatval($item['unit_price']);
        $stmt = $pdo->prepare("
            INSERT INTO bill_items (bill_id, description, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $bill_id,
            trim($item['description']),
            intval($item['quantity']),
            floatval($item['unit_price']),
            $subtotal,
        ]);
    }

    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    $_SESSION['flash_error'] = 'Failed to create invoice. Please try again.';
    $_SESSION['old'] = $_POST;
    header('Location: /hms/modules/billing/create.php');
    exit;
}

$_SESSION['flash_success'] = 'Invoice created successfully.';
header('Location: /hms/modules/billing/view.php?id=' . $bill_id);
exit;