<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();
requireRole(['admin']);

$patient_id = intval($_POST['patient_id'] ?? 0);

if (!$patient_id) {
    jsonResponse(['success' => false, 'message' => 'Invalid patient ID'], 400);
}

$stmt = $pdo->prepare("UPDATE patients SET is_active = 0 WHERE patient_id = ?");
$stmt->execute([$patient_id]);

jsonResponse(['success' => true]);