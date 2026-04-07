# Backend Contract - Sprint 01 (Patient Module)

## Form Actions

### Registration Form (`register.php`)
- **Form ID:** `#register-form`
- **Action:** `modules/patients/actions/register.php`
- **Method:** `POST`
- **Roles:** admin, receptionist

### Edit Form (`edit.php`)
- **Form ID:** `#edit-form`
- **Action:** `modules/patients/actions/update.php`
- **Method:** `POST`
- **Roles:** admin, receptionist

## AJAX Endpoints

### Patient Search
- **Trigger:** `#patient-search` keyup (300ms debounce)
- **URL:** `modules/patients/api/search.php?q={search_term}`
- **Method:** GET
- **Response:** JSON array
```json
[
  {
    "patient_id": 124,
    "patient_id_formatted": "P-00124",
    "full_name": "John Kamau",
    "gender": "Male",
    "phone": "0712345678",
    "created_at_formatted": "15/03/2026"
  }
]
```

### Delete Patient
- **Trigger:** Delete icon button
- **URL:** `modules/patients/api/delete.php`
- **Method:** POST
- **Body:** `{ "patient_id": X }`
- **Response:** `{ "success": true }`
- **Roles:** admin only

## URL Parameters

- `view.php?id={patient_id}` - Load patient profile and tabs
- `edit.php?id={patient_id}` - Pre-populate edit form

## Data Layer Variables

### index.php
- `$patients` - Array of all active patients
- `$patient_count` - Total count
- `$flash_success` - Success message if set

### view.php
- `$patient` - Patient record array
- `$appointments` - Patient's appointment history
- `$lab_tests` - Patient's lab test results
- `$dispensing` - Patient's prescription history
- `$bills` - Patient's billing records
- `$flash_success` - Success message (e.g., on update)

### register.php / edit.php
- `$errors` - Validation errors array
- `$old` - Previously submitted form values (for re-population on error)
- `$patient` - (edit.php only) Patient record to edit

## Error Display

The frontend must implement:

1. **Error display on load:**
```php
if (isset($_SESSION['errors'])) {
    // Show errors, then:
    unset($_SESSION['errors']);
}
```

2. **Form re-population:**
```php
if (isset($_SESSION['old'])) {
    // Pre-fill form inputs, then:
    unset($_SESSION['old']);
}
```

3. **Success toast:**
```php
if (isset($_SESSION['flash_success'])) {
    // Show success message, then:
    unset($_SESSION['flash_success']);
}
```

## Validation Rules

- **full_name:** Required, max 150 chars
- **gender:** Required, must be Male/Female/Other
- **date_of_birth:** Required, must be past date (d/m/Y format)
- **phone:** Optional, Kenyan format (07XX or +2547XX)
- **email:** Optional, valid email format
- **national_id:** Optional, 6-8 chars, must be unique

## Success Redirects

- Register: `modules/patients/index.php` with flash_success
- Update: `modules/patients/view.php?id={id}&success=updated`
- Delete: AJAX response `{success: true}`