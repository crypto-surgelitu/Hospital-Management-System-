<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['admin']);

$errors = [];

$full_name = trim($_POST['full_name'] ?? '');
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';
$role = trim($_POST['role'] ?? '');
$department = trim($_POST['department'] ?? '');

$allowed_roles = ['admin', 'doctor', 'lab', 'pharmacy', 'receptionist'];

if (empty($full_name)) {
    $errors['full_name'] = 'Full name is required.';
} elseif (strlen($full_name) > 150) {
    $errors['full_name'] = 'Full name must be under 150 characters.';
}

if (empty($username)) {
    $errors['username'] = 'Username is required.';
} elseif (strlen($username) > 80) {
    $errors['username'] = 'Username must be under 80 characters.';
} elseif (!preg_match('/^[a-zA-Z0-9._]+$/', $username)) {
    $errors['username'] = 'Username can only contain letters, numbers, dots, and underscores.';
} else {
    $check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $check->execute([$username]);
    if ($check->fetchColumn() > 0) {
        $errors['username'] = 'This username is already taken.';
    }
}

if (empty($password)) {
    $errors['password'] = 'Password is required.';
} elseif (strlen($password) < 8) {
    $errors['password'] = 'Password must be at least 8 characters.';
}

if (!in_array($role, $allowed_roles)) {
    $errors['role'] = 'Please select a valid role.';
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $_POST;
    header('Location: /hms/modules/admin/user_form.php');
    exit;
}

$password_hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare("
    INSERT INTO users (full_name, username, password_hash, role, department)
    VALUES (?, ?, ?, ?, ?)
");
$stmt->execute([
    $full_name,
    $username,
    $password_hash,
    $role,
    $department ?: null,
]);

$_SESSION['flash_success'] = 'User account created successfully.';
header('Location: /hms/modules/admin/users.php');
exit;