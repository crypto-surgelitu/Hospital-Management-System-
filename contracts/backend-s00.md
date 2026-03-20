# Backend Contract - Sprint 00

## Login Integration

**File:** `login.php`
**Form ID:** `#login-form`
**Method:** `POST`
**Action:** `modules/auth/login.php`

### Inputs:
- `username` (text, required): Staff username
- `password` (password, required): Access key

### Redirects:
- **Success:** `dashboard.php` (role-based routing)
- **Failure:** Return to `login.php` with `$_SESSION['login_error']` set

### Error Display:
- Check `$_SESSION['login_error']` on page load
- If set: show error message below the form, then unset the session variable

---

## Session Variables

After authentication, the following session variables are populated:

- `$_SESSION['user_id']`: User's database ID
- `$_SESSION['role']`: User role (admin, doctor, lab, pharmacy, receptionist)
- `$_SESSION['full_name']`: User's display name

---

## Dashboard Routing

**File:** `dashboard.php`

Role-based routing to appropriate dashboard:
- `admin`, `receptionist` → `modules/dashboards/admin.php`
- `doctor` → `modules/dashboards/doctor.php`
- `lab` → `modules/dashboards/lab.php`
- `pharmacy` → `modules/dashboards/pharmacy.php`

---

## Sidebar Role Logic

Navigation groups should be wrapped with role checks:

```php
<?php if(in_array($_SESSION['role'], ['admin','receptionist'])): ?>
  <!-- Reception module nav -->
<?php endif; ?>

<?php if(in_array($_SESSION['role'], ['admin','doctor'])): ?>
  <!-- Clinical module nav -->
<?php endif; ?>

<?php if(in_array($_SESSION['role'], ['admin','lab'])): ?>
  <!-- Laboratory module nav -->
<?php endif; ?>

<?php if(in_array($_SESSION['role'], ['admin','pharmacy'])): ?>
  <!-- Pharmacy module nav -->
<?php endif; ?>
```

---

## Standard PHP Header

Every protected page must include:

```php
<?php 
require_once '../../config/db.php';
require_once '../../config/auth.php';
require_once '../../config/helpers.php';
requireLogin(); 
?>
```

---

## Logout Link

- **Href:** `modules/auth/logout.php`

---

## Database Schema

### Tables Created (8 total):
1. `patients` - Patient records
2. `users` - Staff/user accounts
3. `appointments` - Appointment scheduling
4. `lab_tests` - Laboratory test requests
5. `drugs` - Pharmacy inventory
6. `dispensing` - Prescription dispensing
7. `bills` - Billing records
8. `bill_items` - Individual bill line items

### Default Accounts (password: password):
- `admin` / password (role: admin)
- `dr.ochieng` / password (role: doctor)
- `m.wanjiku` / password (role: receptionist)
- `s.oduor` / password (role: lab)
- `g.akinyi` / password (role: pharmacy)

---

## Config Files

- `config/db.php` - Database connection (PDO)
- `config/auth.php` - Authentication helpers
- `config/helpers.php` - Utility functions