<?php
require_once 'C:/xampp/htdocs/hms/config/db.php';
require_once 'C:/xampp/htdocs/hms/config/auth.php';
require_once 'C:/xampp/htdocs/hms/config/helpers.php';

requireLogin();
requireRole(['admin']);

$errors = [];

$user_id = intval($_POST['user_id'] ?? 0);
$full_name = trim($_POST['full_name'] ?? '');
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';
$change_password = isset($_POST['change_password']) && $_POST['change_password'] == '1';
$role = trim($_POST['role'] ?? '');
$department = trim($_POST['department'] ?? '');

$allowed_roles = ['admin', 'doctor', 'lab', 'pharmacy', 'receptionist'];

if (!$user_id) {
    header('Location: /hms/hms/modules/admin/users.php');
    exit;
}

$check = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
$check->execute([$user_id]);
$existing_user = $check->fetch();

if (!$existing_user) {
    header('Location: /hms/hms/modules/admin/users.php');
    exit;
}

if ($user_id == $_SESSION['user_id'] && $role !== 'admin') {
    $errors['role'] = 'You cannot change your own admin role.';
}

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
    $check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND user_id != ?");
    $check->execute([$username, $user_id]);
    if ($check->fetchColumn() > 0) {
        $errors['username'] = 'This username is already taken.';
    }
}

if ($change_password) {
    if (empty($password)) {
        $errors['password'] = 'Password is required when changing password.';
    } elseif (strlen($password) < 8) {
        $errors['password'] = 'Password must be at least 8 characters.';
    }
}

if (!in_array($role, $allowed_roles)) {
    $errors['role'] = 'Please select a valid role.';
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $_POST;
    header('Location: /hms/hms/modules/admin/user_form.php?id=' . $user_id);
    exit;
}

if ($change_password && !empty($password)) {
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("
        UPDATE users 
        SET full_name = ?, username = ?, password_hash = ?, role = ?, department = ?
        WHERE user_id = ?
    ");
    $stmt->execute([
        $full_name,
        $username,
        $password_hash,
        $role,
        $department ?: null,
        $user_id,
    ]);
} else {
    $stmt = $pdo->prepare("
        UPDATE users 
        SET full_name = ?, username = ?, role = ?, department = ?
        WHERE user_id = ?
    ");
    $stmt->execute([
        $full_name,
        $username,
        $role,
        $department ?: null,
        $user_id,
    ]);
}

$_SESSION['flash_success'] = 'User account updated successfully.';
header('Location: /hms/hms/modules/admin/users.php?success=updated');
exit;