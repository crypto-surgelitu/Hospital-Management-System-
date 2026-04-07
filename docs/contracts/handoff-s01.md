# Sprint 01 Handoff - Patient Module

This document outlines the technical requirements and integration points for the Patient module built in Sprint 01.

## Forms & Persistence

### 1. Patient Registration (`#register-form`)
- **File:** `modules/patients/register.php`
- **Method:** `POST`
- **Inputs:**
  - `full_name` (text, required)
  - `gender` (hidden, required) - Populated via interactive buttons (Values: `Male`, `Female`, `Other`)
  - `date_of_birth` (text, required) - Format: `d/m/Y` (Flatpickr)
  - `phone` (text, optional)
  - `email` (email, optional)
  - `address` (textarea, optional)
  - `national_id` (text, optional)

### 2. Patient Profile Edit (`#edit-form`)
- **File:** `modules/patients/edit.php`
- **Method:** `POST`
- **Inputs:** Same as registration, plus:
  - `patient_id` (hidden, required)

---

## AJAX Endpoints (Mocked in JS)

### 1. Patient Search
- **Trigger:** `#patient-search` keyup (300ms debounce)
- **Method:** `GET`
- **Params:** `q={search_term}`
- **Response Format:** JSON array
  ```json
  [
    {
      "patient_id": "P-00124",
      "full_name": "John Kamau",
      "gender": "Male",
      "phone": "0712 345 678",
      "registered": "15/03/2026"
    }
  ]
  ```

### 2. Delete Patient
- **Trigger:** Delete icon button
- **Method:** `POST`
- **Body:** `{ patient_id: X }`
- **Expected:** `{ success: true }`

---

## URL Parameters
- `view.php?id={patient_id}`: Used to load profile summary and tabs.
- `edit.php?id={patient_id}`: Used to pre-populate edit form.

## UI Logic & States
- **Tab Switching:** `view.php` uses client-side JS to toggle panels (`Overview`, `Appointments`, `Lab`, etc.).
- **Initials Avatar:** `generateAvatar()` in `index.php` creates colored circles based on the first letter of the name.
- **Empty States:** Tab panels in `view.php` contain dedicated empty state illustrations for unpopulated records.
