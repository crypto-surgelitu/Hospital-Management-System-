# Sprint 06 Handoff - Admin Module

This document outlines the technical requirements and integration points for the Admin module built in Sprint 06.

## Forms & Persistence

### 1. Create/Edit User (`#create-user-form`, `#edit-user-form`)
- **File:** `modules/admin/user_form.php`
- **Method:** `POST`
- **Inputs:**
  - `user_id` (hidden, required for Edit).
  - `full_name` (text, required).
  - `username` (text, required, font-mono).
  - `role` (hidden, required) - Values: `admin`, `doctor`, `lab`, `pharmacy`, `receptionist`.
  - `department` (text, optional).
  - `change_password` (hidden, value="1") - Only sent if "Change password?" is checked in Edit mode.
  - `password` (password, required on Create or if `change_password=1`).

---

## AJAX Endpoints (Mocked in JS)

### 1. Toggle User Status
- **URL:** `/* ENDPOINT: see contracts/backend-s06.md */`
- **Method:** `POST`
- **Trigger:** Toggle switch change in `users.php`.
- **Payload:** `{user_id: X, is_active: 0|1}`
- **Response Expects:** `{success: bool}`
- **Usage:** Updates account status visually and shows a toast notification on success.

---

## URL Parameters & Routing

### 1. User Form Context
- `user_form.php?id={user_id}`: Used to load existing user data for editing. Empty `id` implies creation.

### 2. Report Filtering
- `reports.php?date_from={d/m/Y}&date_to={d/m/Y}`: Standard GET parameters used by the reporting engine to filter datasets.

---

## Security & State

### 1. Role Enforcement
- All pages in `modules/admin/` require `$_SESSION['role'] === 'admin'`.
- The UI includes `data-role-required="admin"` on the body for frontend verification.

### 2. Password Generation
- `modules/admin/user_form.php` includes a JS-based generator creating 10-character alphanumeric strings with symbols for secure staff onboarding.
