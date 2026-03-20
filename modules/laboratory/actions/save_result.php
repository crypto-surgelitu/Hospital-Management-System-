<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();
requireRole(['lab', 'admin']);

$test_id = intval($_POST['test_id'] ?? 0);
$status = trim($_POST['status'] ?? '');
$result = trim($_POST['result'] ?? '');

$allowed_statuses = ['Pending', 'Processing', 'Completed'];

if (!$test_id || !in_array($status, $allowed_statuses)) {
    $_SESSION['flash_error'] = 'Invalid request.';
    header('Location: /modules/laboratory/queue.php');
    exit;
}

if ($status === 'Completed' && empty($result)) {
    $_SESSION['flash_error'] = 'Result text is required to mark as Completed.';
    header('Location: /modules/laboratory/result.php?id=' . $test_id);
    exit;
}

$date_processed = ($status === 'Completed') ? date('Y-m-d') : null;

$stmt = $pdo->prepare("
    UPDATE lab_tests 
    SET result = ?, status = ?, technician_id = ?, date_processed = ?
    WHERE test_id = ?
");
$stmt->execute([
    $result ?: null,
    $status,
    $_SESSION['user_id'],
    $date_processed,
    $test_id,
]);

$_SESSION['flash_success'] = 'Test result saved successfully.';
header('Location: /modules/laboratory/queue.php?success=saved');
exit;