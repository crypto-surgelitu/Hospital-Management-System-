<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();

$doctor_id = intval($_GET['doctor_id'] ?? 0);
$date_raw = trim($_GET['date'] ?? '');

if (!$doctor_id || !$date_raw) {
    jsonResponse(['error' => 'Missing parameters'], 400);
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_raw)) {
    jsonResponse(['error' => 'Invalid date format'], 400);
}

$all_slots = [];
$start = new DateTime('08:00');
$end = new DateTime('17:00');
while ($start <= $end) {
    $all_slots[] = $start->format('H:i');
    $start->modify('+30 minutes');
}

$stmt = $pdo->prepare("
    SELECT TIME_FORMAT(appointment_time, '%H:%i') as t 
    FROM appointments 
    WHERE doctor_id = ? AND appointment_date = ? AND status != 'Cancelled'
");
$stmt->execute([$doctor_id, $date_raw]);
$booked = array_column($stmt->fetchAll(), 't');

$slots = array_map(fn($t) => [
    'time' => $t,
    'available' => !in_array($t, $booked),
], $all_slots);

jsonResponse($slots);