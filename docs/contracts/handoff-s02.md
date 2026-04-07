# Sprint 02 Handoff - Appointment Module

This document outlines the technical requirements and integration points for the Appointment module built in Sprint 02.

## Forms & Persistence

### 1. Book Appointment (`#book-form`)
- **File:** `modules/appointments/book.php`
- **Method:** `POST`
- **Inputs:**
  - `patient_id` (hidden, required) - Set via typeahead selection.
  - `doctor_id` (select, required)
  - `appointment_date` (text, required) - Format: `d/m/Y` (Flatpickr).
  - `appointment_time` (hidden, required) - Set via interactive slot picker.
  - `reason` (textarea, optional)

### 2. Consultation Notes
- **File:** `modules/appointments/view.php`
- **Method:** `POST` via AJAX
- **Inputs:**
  - `notes` (textarea)
  - `appointment_id` (contextual)

---

## AJAX Endpoints (Mocked in JS)

### 1. Patient Typeahead (Booking)
- **Trigger:** `#patient-search-input` keyup (300ms debounce)
- **Method:** `GET`
- **Params:** `q={search_term}`
- **URL:** /* ENDPOINT: see contracts/backend-s02.md */

### 2. Get Available Time Slots
- **Trigger:** Change in `doctor_id` OR `appointment_date`
- **Method:** `GET`
- **Params:** `doctor_id={id}&date={Y-m-d}`
- **URL:** /* ENDPOINT: see contracts/backend-s02.md */

### 3. Workflow Actions (Status Updates)
- **Files:** `index.php` and `view.php`
- **Methods:** `POST` (AJAX)
- **Actions:** Mark as `Completed`, Mark as `Cancelled`.

---

## UI Logic
- **Today Highlight:** Rows in `index.php` for the current date are highlighted with `border-l-4 border-amber-400`.
- **Role Constraints:** Consultation notes and action buttons in `view.php` are only rendered if `$_SESSION['role']` is `doctor` or `admin`.
- **Doctor Filtering:** Doctors viewing the index page should only see their own appointments (filter by `$_SESSION['user_id']`).

## URL Parameters
- `view.php?id={appointment_id}`: Used to load specific record details.
