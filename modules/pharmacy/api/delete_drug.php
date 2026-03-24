<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['admin']);

$drug_id = intval($_POST['drug_id'] ?? 0);

if (!$drug_id) {
    jsonResponse(['success' => false, 'message' => 'Invalid drug ID'], 400);
}

$stmt = $pdo->prepare("UPDATE drugs SET is_active = 0 WHERE drug_id = ?");
$stmt->execute([$drug_id]);

jsonResponse(['success' => true]);