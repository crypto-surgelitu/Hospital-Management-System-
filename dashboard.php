<?php
require_once 'config/db.php';
require_once 'config/auth.php';
require_once 'config/helpers.php';

requireLogin();

switch ($_SESSION['role']) {
    case 'admin':
    case 'receptionist':
        include 'modules/dashboards/admin.php';
        break;
    case 'doctor':
        include 'modules/dashboards/doctor.php';
        break;
    case 'lab':
        include 'modules/dashboards/lab.php';
        break;
    case 'pharmacy':
        include 'modules/dashboards/pharmacy.php';
        break;
    default:
        session_destroy();
        header('Location: /login.php');
        exit;
}