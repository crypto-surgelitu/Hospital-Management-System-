<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['doctor', 'admin']);

$errors = [];

$patient_id = intval($_POST['patient_id'] ?? 0);
$test_type = trim($_POST['test_type'] ?? '');
$notes = trim($_POST['notes'] ?? '');

if (!$patient_id) {
    $errors['patient'] = 'Please select a patient.';
} else {
    $check = $pdo->prepare("SELECT COUNT(*) FROM patients WHERE patient_id = ? AND is_active = 1");
    $check->execute([$patient_id]);
    if (!$check->fetchColumn()) {
        $errors['patient'] = 'Patient not found.';
    }
}

if (empty($test_type)) {
    $errors['test_type'] = 'Please select a test type.';
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $_POST;
    header('Location: /hms/modules/laboratory/request.php');
    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO lab_tests (patient_id, requested_by, test_type, notes, status, date_requested)
    VALUES (?, ?, ?, ?, 'Pending', CURDATE())
");
$stmt->execute([
    $patient_id,
    $_SESSION['user_id'],
    $test_type,
    $notes ?: null,
]);

$_SESSION['flash_success'] = 'Lab test requested successfully.';
header('Location: /hms/modules/laboratory/queue.php?success=requested');
exit;