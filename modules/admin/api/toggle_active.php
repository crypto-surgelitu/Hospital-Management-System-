<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['admin']);

$user_id = intval($_POST['user_id'] ?? 0);
$is_active = intval($_POST['is_active'] ?? 0);

if (!$user_id) {
    jsonResponse(['success' => false, 'message' => 'Invalid user ID'], 400);
}

if ($user_id == $_SESSION['user_id']) {
    jsonResponse(['success' => false, 'message' => 'You cannot deactivate your own account.'], 403);
}

$stmt = $pdo->prepare("UPDATE users SET is_active = ? WHERE user_id = ?");
$stmt->execute([$is_active, $user_id]);

jsonResponse(['success' => true, 'is_active' => $is_active]);