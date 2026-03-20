<?php
require_once '../../../config/db.php';
require_once '../../../config/auth.php';
require_once '../../../config/helpers.php';

requireLogin();
requireRole(['admin', 'receptionist']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /modules/patients/index.php');
    exit;
}

$errors = [];

$full_name = trim($_POST['full_name'] ?? '');
$gender = trim($_POST['gender'] ?? '');
$dob = trim($_POST['date_of_birth'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$address = trim($_POST['address'] ?? '');
$national_id = trim($_POST['national_id'] ?? '');

if (empty($full_name)) {
    $errors['full_name'] = 'Full name is required.';
} elseif (strlen($full_name) > 150) {
    $errors['full_name'] = 'Name must be under 150 characters.';
}

if (!in_array($gender, ['Male', 'Female', 'Other'])) {
    $errors['gender'] = 'Please select a gender.';
}

if (empty($dob)) {
    $errors['date_of_birth'] = 'Date of birth is required.';
} else {
    $dobParsed = DateTime::createFromFormat('d/m/Y', $dob);
    if (!$dobParsed || $dobParsed > new DateTime()) {
        $errors['date_of_birth'] = 'Please enter a valid past date.';
    } else {
        $dob = $dobParsed->format('Y-m-d');
    }
}

if (!empty($phone)) {
    $cleaned = preg_replace('/\s+/', '', $phone);
    if (!preg_match('/^(\+2547|07)\d{8}$/', $cleaned)) {
        $errors['phone'] = 'Enter a valid Kenyan phone number (07XX or +2547XX).';
    }
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Enter a valid email address.';
}

if (!empty($national_id)) {
    if (strlen($national_id) < 6 || strlen($national_id) > 8) {
        $errors['national_id'] = 'National ID must be 6-8 characters.';
    } else {
        $check = $pdo->prepare("SELECT COUNT(*) FROM patients WHERE national_id = ?");
        $check->execute([$national_id]);
        if ($check->fetchColumn() > 0) {
            $errors['national_id'] = 'This National ID is already registered.';
        }
    }
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $_POST;
    header('Location: /modules/patients/register.php');
    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO patients (full_name, gender, date_of_birth, phone, email, address, national_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([
    $full_name,
    $gender,
    $dob,
    $phone ?: null,
    $email ?: null,
    $address ?: null,
    $national_id ?: null,
]);

$_SESSION['flash_success'] = 'Patient registered successfully.';
header('Location: /modules/patients/index.php');
exit;