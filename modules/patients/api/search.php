<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();

$q = '%' . trim($_GET['q'] ?? '') . '%';

$stmt = $pdo->prepare("
    SELECT patient_id, full_name, gender, phone, created_at 
    FROM patients 
    WHERE is_active = 1 AND (full_name LIKE ? OR phone LIKE ? OR national_id LIKE ?) 
    ORDER BY full_name ASC 
    LIMIT 20
");
$stmt->execute([$q, $q, $q]);
$patients = $stmt->fetchAll();

foreach ($patients as &$p) {
    $p['patient_id_formatted'] = formatPatientID($p['patient_id']);
    $p['created_at_formatted'] = formatDate($p['created_at']);
}

jsonResponse($patients);