<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();

$appointment_id = intval($_POST['appointment_id'] ?? 0);
$new_status = trim($_POST['status'] ?? '');
$allowed = ['Scheduled', 'Completed', 'Cancelled', 'No-Show'];

if (!$appointment_id || !in_array($new_status, $allowed)) {
    jsonResponse(['success' => false, 'message' => 'Invalid request'], 400);
}

requireRole(['doctor', 'admin', 'receptionist']);

$stmt = $pdo->prepare("UPDATE appointments SET status = ? WHERE appointment_id = ?");
$stmt->execute([$new_status, $appointment_id]);

jsonResponse(['success' => true, 'new_status' => $new_status]);