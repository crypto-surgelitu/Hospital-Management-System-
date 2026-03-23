<?php

function formatKES(float $amount): string {
    return 'KES ' . number_format($amount, 2);
}

function formatDate(string $date): string {
    if (!$date) return '—';
    return date('d/m/Y', strtotime($date));
}

function formatDateTime(string $datetime): string {
    if (!$datetime) return '—';
    return date('d/m/Y H:i', strtotime($datetime));
}

function formatPatientID(int $id): string {
    return 'P-' . str_pad($id, 5, '0', STR_PAD_LEFT);
}

function formatInvoiceID(int $id): string {
    return 'INV-' . str_pad($id, 5, '0', STR_PAD_LEFT);
}

function sanitize(string $input): string {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function timeAgo(string $datetime): string {
    $diff = time() - strtotime($datetime);
    if ($diff < 3600) return round($diff / 60) . 'm ago';
    if ($diff < 86400) return round($diff / 3600) . 'h ago';
    return round($diff / 86400) . 'd ago';
}

function flashError(string $msg): void {
    $_SESSION['flash_error'] = $msg;
}

function flashSuccess(string $msg): void {
    $_SESSION['flash_success'] = $msg;
}

function getInitials(string $name): string {
    $words = explode(' ', trim($name));
    $initials = '';
    foreach ($words as $w) {
        if (!empty($w)) {
            $initials .= strtoupper(substr($w, 0, 1));
        }
    }
    return substr($initials, 0, 2);
}