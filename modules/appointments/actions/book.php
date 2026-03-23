<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();
requireRole(['admin', 'receptionist', 'doctor']);

$errors = [];

$patient_id = intval($_POST['patient_id'] ?? 0);
$doctor_id = intval($_POST['doctor_id'] ?? 0);
$date_raw = trim($_POST['appointment_date'] ?? '');
$time = trim($_POST['appointment_time'] ?? '');
$reason = trim($_POST['reason'] ?? '');

if (!$patient_id) {
    $errors['patient'] = 'Please select a patient.';
} else {
    $check = $pdo->prepare("SELECT COUNT(*) FROM patients WHERE patient_id = ? AND is_active = 1");
    $check->execute([$patient_id]);
    if (!$check->fetchColumn()) {
        $errors['patient'] = 'Patient not found.';
    }
}

if (!$doctor_id) {
    $errors['doctor'] = 'Please select a doctor.';
} else {
    $check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE user_id = ? AND role = 'doctor' AND is_active = 1");
    $check->execute([$doctor_id]);
    if (!$check->fetchColumn()) {
        $errors['doctor'] = 'Invalid doctor selected.';
    }
}

$date_obj = DateTime::createFromFormat('d/m/Y', $date_raw);
if (!$date_obj || $date_obj < new DateTime('today')) {
    $errors['date'] = 'Please select a valid future date.';
} else {
    $date = $date_obj->format('Y-m-d');
}

if (!preg_match('/^\d{2}:\d{2}$/', $time)) {
    $errors['time'] = 'Please select an available time slot.';
}

if (empty($errors)) {
    $check = $pdo->prepare("
        SELECT COUNT(*) FROM appointments 
        WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'
    ");
    $check->execute([$doctor_id, $date, $time]);
    if ($check->fetchColumn() > 0) {
        $errors['time'] = 'That time slot is no longer available. Please choose another.';
    }
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $_POST;
    header('Location: /hms/modules/appointments/book.php');
    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason)
    VALUES (?, ?, ?, ?, ?)
");
$stmt->execute([$patient_id, $doctor_id, $date, $time, $reason ?: null]);

$_SESSION['flash_success'] = 'Appointment booked successfully.';
header('Location: /hms/modules/appointments/index.php');
exit;