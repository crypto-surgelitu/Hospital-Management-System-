<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function requireLogin() {
    if (!isset($_SESSION['user_id'])) {
        header('Location: /login.php');
        exit;
    }
}

function requireRole(array $roles) {
    requireLogin();
    if (!in_array($_SESSION['role'], $roles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }
}

function isRole(string $role): bool {
    return isset($_SESSION['role']) && $_SESSION['role'] === $role;
}

function currentUser(): array {
    return [
        'id' => $_SESSION['user_id'] ?? null,
        'role' => $_SESSION['role'] ?? null,
        'full_name' => $_SESSION['full_name'] ?? null,
    ];
}