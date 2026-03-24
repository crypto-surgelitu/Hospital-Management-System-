<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['lab', 'admin']);

$test_id = intval($_POST['test_id'] ?? 0);

if (!$test_id) {
    jsonResponse(['success' => false, 'message' => 'Invalid test ID'], 400);
}

$stmt = $pdo->prepare("UPDATE lab_tests SET status = 'Processing' WHERE test_id = ? AND status = 'Pending'");
$stmt->execute([$test_id]);

jsonResponse(['success' => true]);