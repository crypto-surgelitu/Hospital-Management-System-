<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();

$patient_id = intval($_GET['patient_id'] ?? 0);

if (!$patient_id) {
    jsonResponse(['error' => 'Patient ID required'], 400);
}

$services = [];

$services[] = [
    'description' => 'Consultation Fee',
    'unit_price' => 500.00,
    'quantity' => 1,
];

$stmt = $pdo->prepare("
    SELECT CONCAT('Lab Test: ', test_type) as description, 800.00 as unit_price, 1 as quantity
    FROM lab_tests
    WHERE patient_id = ? AND status = 'Completed'
");
$stmt->execute([$patient_id]);
$lab_services = $stmt->fetchAll();

foreach ($lab_services as $lab) {
    $services[] = $lab;
}

$stmt = $pdo->prepare("
    SELECT CONCAT('Drug: ', d.drug_name, ' (', dis.quantity_issued, ' ', COALESCE(d.unit, 'units'), ')') as description,
           (d.unit_price * dis.quantity_issued) as unit_price, 1 as quantity
    FROM dispensing dis
    JOIN drugs d ON dis.drug_id = d.drug_id
    WHERE dis.patient_id = ?
");
$stmt->execute([$patient_id]);
$drug_services = $stmt->fetchAll();

foreach ($drug_services as $drug) {
    $services[] = $drug;
}

jsonResponse($services);