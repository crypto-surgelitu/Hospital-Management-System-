<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();

$drug_id = intval($_GET['drug_id'] ?? 0);

if (!$drug_id) {
    jsonResponse(['error' => 'Invalid drug ID'], 400);
}

$stmt = $pdo->prepare("
    SELECT drug_name, quantity_in_stock, unit, reorder_level 
    FROM drugs 
    WHERE drug_id = ? AND is_active = 1
");
$stmt->execute([$drug_id]);
$drug = $stmt->fetch();

if (!$drug) {
    jsonResponse(['error' => 'Drug not found'], 404);
}

jsonResponse($drug);