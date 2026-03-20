# Backend Contract - Sprint 02 (Appointments Module)

## Form Actions

### Book Appointment (`book.php`)
- **Form ID:** `#book-form`
- **Action:** `modules/appointments/actions/book.php`
- **Method:** `POST`
- **Roles:** admin, receptionist, doctor

## AJAX Endpoints

### Get Available Time Slots
- **Trigger:** Change in `doctor_id` OR `appointment_date`
- **URL:** `modules/appointments/api/slots.php?doctor_id={id}&date={Y-m-d}`
- **Method:** GET
- **Response:** JSON array
```json
[
  { "time": "08:00", "available": true },
  { "time": "08:30", "available": false },
  ...
]
```

### Update Appointment Status
- **Trigger:** Mark as Completed/Cancelled buttons
- **URL:** `modules/appointments/api/update_status.php`
- **Method:** POST
- **Body:** `{ "appointment_id": X, "status": "Completed|Cancelled|No-Show" }`
- **Response:** `{ "success": true, "new_status": "..." }`
- **Roles:** doctor, admin, receptionist

### Save Consultation Notes
- **Trigger:** Save notes button in view.php
- **URL:** `modules/appointments/api/save_notes.php`
- **Method:** POST
- **Body:** `{ "appointment_id": X, "notes": "..." }`
- **Response:** `{ "success": true }`
- **Roles:** doctor, admin

### Patient Search (Reuse from S01)
- **URL:** `modules/patients/api/search.php?q={term}`

## Data Layer Variables

### index.php
- `$appointments` - Array of appointment records with patient_name, doctor_name
- `$counts` - Array with counts per status: All, Scheduled, Completed, Cancelled, No-Show
- `$today` - Today's date in Y-m-d format (for highlighting)
- `$flash_success` - Success message if set

### book.php
- `$errors` - Validation errors array
- `$old` - Previously submitted form values
- `$doctors` - Array of active doctors for dropdown

### view.php
- `$appointment` - Single appointment record with patient and doctor details
- `$isClinical` - Boolean: true if role is doctor or admin

## Form Inputs (book.php)

- `patient_id` (hidden) - Selected via typeahead
- `doctor_id` (select) - Doctor dropdown
- `appointment_date` (text, d/m/Y format)
- `appointment_time` (hidden) - Selected via slot picker
- `reason` (textarea, optional)

## Validation Rules

- **patient_id:** Must exist and be active
- **doctor_id:** Must exist, have role='doctor', be active
- **appointment_date:** Must be future date (d/m/Y format)
- **appointment_time:** Must be valid HH:MM format
- **double-booking:** Checked - same doctor/date/time can't be booked twice

## UI Logic Notes

- **Today Highlight:** Add `border-l-4 border-amber-400` class to rows where `appointment_date == $today`
- **Role Constraints:** Only show consultation notes and action buttons if `$isClinical` is true
- **Doctor Filtering:** If `$_SESSION['role'] === 'doctor'`, only show their own appointments

## Date Format Note

The slots API expects `Y-m-d` format. Convert from Flatpickr's `d/m/Y` before making the fetch call.