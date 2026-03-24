<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['admin', 'receptionist']);

$bill_id = intval($_POST['bill_id'] ?? 0);
$amount_paid = floatval($_POST['amount_paid'] ?? 0);
$payment_method = trim($_POST['payment_method'] ?? '');

$allowed_methods = ['Cash', 'M-Pesa', 'Insurance', 'Other'];

if (!$bill_id) {
    jsonResponse(['success' => false, 'message' => 'Invalid bill ID'], 400);
}

if ($amount_paid <= 0) {
    jsonResponse(['success' => false, 'message' => 'Payment amount must be greater than 0'], 400);
}

if (!in_array($payment_method, $allowed_methods)) {
    jsonResponse(['success' => false, 'message' => 'Invalid payment method'], 400);
}

$stmt = $pdo->prepare("SELECT total_amount, amount_paid FROM bills WHERE bill_id = ?");
$stmt->execute([$bill_id]);
$bill = $stmt->fetch();

if (!$bill) {
    jsonResponse(['success' => false, 'message' => 'Bill not found'], 404);
}

$total_amount = floatval($bill['total_amount']);
$already_paid = floatval($bill['amount_paid']);

if ($already_paid + $amount_paid > $total_amount) {
    jsonResponse(['success' => false, 'message' => 'Payment exceeds total bill amount.'], 422);
}

$new_paid = $already_paid + $amount_paid;

if ($new_paid >= $total_amount) {
    $status = 'Paid';
} elseif ($new_paid > 0) {
    $status = 'Partial';
} else {
    $status = 'Unpaid';
}

$stmt = $pdo->prepare("UPDATE bills SET amount_paid = ?, payment_status = ?, payment_method = ? WHERE bill_id = ?");
$stmt->execute([$new_paid, $status, $payment_method, $bill_id]);

jsonResponse([
    'success' => true,
    'new_status' => $status,
    'new_amount_paid' => $new_paid,
    'total_amount' => $total_amount,
]);