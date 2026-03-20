<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();
requireRole(['doctor', 'admin']);

$appointment_id = intval($_POST['appointment_id'] ?? 0);
$notes = trim($_POST['notes'] ?? '');

if (!$appointment_id) {
    jsonResponse(['success' => false, 'message' => 'Invalid appointment'], 400);
}

$stmt = $pdo->prepare("UPDATE appointments SET notes = ? WHERE appointment_id = ?");
$stmt->execute([$notes, $appointment_id]);

jsonResponse(['success' => true]);