<?php
require_once 'C:/xampp/htdocs/hms/config/auth.php';

session_destroy();
header('Location: /hms/hms/login.php');
exit;