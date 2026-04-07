# Backend Contract - Sprint 03 (Laboratory Module)

## Form Actions

### Request Lab Test (`request.php`)
- **Form ID:** `#request-form`
- **Action:** `modules/laboratory/actions/request.php`
- **Method:** `POST`
- **Roles:** doctor, admin

### Save Test Result (`result.php`)
- **Form ID:** `#result-form`
- **Action:** `modules/laboratory/actions/save_result.php`
- **Method:** `POST`
- **Roles:** lab, admin

## AJAX Endpoints

### Process Test (Mark as Processing)
- **URL:** `modules/laboratory/api/process.php`
- **Method:** POST
- **Body:** `{ "test_id": X }`
- **Response:** `{ "success": true }`
- **Roles:** lab, admin

### Patient Search (Reuse from S01)
- **URL:** `modules/patients/api/search.php?q={term}`

## Data Layer Variables

### queue.php
- `$queue` - Array of pending/processing tests with patient_name, doctor_name
- `$pending_count` - Count of pending tests
- `$processing_count` - Count of processing tests
- `$completed_today` - Count of completed tests today
- `$flash_success` - Success message if set
- `$flash_error` - Error message if set

### result.php
- `$test` - Single test record with patient_name, doctor_name
- `$flash_error` - Error message if set

### request.php
- `$errors` - Validation errors array
- `$old` - Previously submitted form values

### history.php
- `$tests` - Array of test records with filters applied
- `$patient_id`, `$status`, `$date_from`, `$date_to` - Filter values

## Form Inputs

### request.php
- `patient_id` (hidden) - Selected via typeahead
- `test_type` (select) - Test type from dropdown
- `notes` (textarea, optional)
- `requested_by` (hidden) - Session user_id

### result.php
- `test_id` (hidden)
- `status` (hidden) - Pending/Processing/Completed
- `result` (textarea) - Required if status is Completed
- `technician_id` (hidden) - Session user_id

## Validation Rules

### request.php
- **patient_id:** Must exist and be active
- **test_type:** Must not be empty

### save_result.php
- **status:** Must be Pending, Processing, or Completed
- **result:** Required if status is Completed

## UI Logic Notes

### Queue Urgency Borders (JS handles this)
- `< 1 hour`: Green border
- `1-4 hours`: Amber border
- `> 4 hours`: Red border + pulse-urgent class

### Time Calculation
- Use `data-requested-at` attribute with ISO datetime (date_requested + created_at)

## PHP Session Values

For hidden inputs, use:
```php
<input type="hidden" name="requested_by" value="<?php echo $_SESSION['user_id']; ?>">
<input type="hidden" name="technician_id" value="<?php echo $_SESSION['user_id']; ?>">
```

## Test Types (Dropdown Options)

1. Full Blood Count (FBC)
2. Malaria RDT
3. HIV Test
4. Urinalysis
5. Blood Glucose (Fasting)
6. Liver Function Tests (LFT)
7. Renal Function Tests (RFT)
8. Widal Test
9. Sputum AFB
10. Pregnancy Test (UPT)
11. Stool Analysis
12. CD4 Count