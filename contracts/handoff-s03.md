# Sprint 03 Handoff - Laboratory Module

This document outlines the technical requirements and integration points for the Laboratory module built in Sprint 03.

## Forms & Persistence

### 1. Request Lab Test (`#request-form`)
- **File:** `modules/laboratory/request.php`
- **Method:** `POST`
- **Inputs:**
  - `patient_id` (hidden, required) - Set via typeahead.
  - `test_type` (select, required) - Catalog of 12 common tests.
  - `notes` (textarea, optional)
  - `requested_by` (hidden, required) - Session `user_id`.

### 2. Enter Test Results (`#result-form`)
- **File:** `modules/laboratory/result.php`
- **Method:** `POST`
- **Inputs:**
  - `test_id` (hidden, required)
  - `status` (hidden, required) - Values: `Pending`, `Processing`, `Completed`.
  - `result` (textarea) - Required if status is `Completed`.
  - `technician_id` (hidden, required) - Session `user_id`.

---

## AJAX Endpoints (Mocked in JS)

### 1. Process Test (Workflow)
- **File:** `modules/laboratory/queue.php`
- **Trigger:** "Process Test" button click.
- **Method:** `POST`
- **Body:** `{test_id: X}`
- **URL:** /* ENDPOINT: see contracts/backend-s03.md */

### 2. Patient Typeahead
- Reused from Sprint 01: `modules/patients/api/search.php`.

---

## UI Logic
- **Urgency Borders (Queue):** 
  - `< 1 hour`: Green border.
  - `1-4 hours`: Amber border.
  - `> 4 hours`: Red border + pulse animation (`pulse-urgent` class).
- **Time Elapsed:** Calculated via JS from `data-requested-at` attribute vs local system time.
- **Completed Expansion:** The "Completed Today" section in `queue.php` uses a standard slide toggle.

## Role Constraints
- **Queue & result.php:** Accessible only to roles: `lab`, `admin`.
- **request.php:** Accessible only to roles: `doctor`, `admin`.
