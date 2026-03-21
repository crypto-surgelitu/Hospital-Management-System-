# Backend Contract - Sprint 06 (Admin Module)

## Form Actions

### Create User (`user_form.php` for create)
- **Form ID:** `#create-user-form`
- **Action:** `modules/admin/actions/create_user.php`
- **Method:** `POST`
- **Roles:** admin only

### Update User (`user_form.php` for edit)
- **Form ID:** `#edit-user-form`
- **Action:** `modules/admin/actions/update_user.php`
- **Method:** `POST`
- **Roles:** admin only

## AJAX Endpoints

### Toggle User Status
- **URL:** `modules/admin/api/toggle_active.php`
- **Method:** POST
- **Body:** `{ "user_id": X, "is_active": 0|1 }`
- **Response:** `{ "success": true, "is_active": 0|1 }`
- **Restrictions:** Cannot deactivate own account

## Data Layer Variables

### users.php
- `$users` - Array of all users ordered by role, then full_name
- `$flash_success` - Success message if set

### user_form.php
- `$is_edit` - Boolean, true if editing
- `$user` - User record when editing (null for create)
- `$errors` - Validation errors array
- `$old` - Previously submitted form values

### reports.php
- `$stats` - Array with patients, appointments, lab_tests, revenue counts
- `$daily` - Daily patient registrations
- `$by_doctor` - Appointments grouped by doctor
- `$lab_volume` - Lab tests grouped by type
- `$revenue` - Revenue grouped by payment status
- `$date_from` - Start date (Y-m-d format)
- `$date_to` - End date (Y-m-d format)

## Form Inputs

### user_form.php (create/edit)
- `user_id` (hidden, edit only)
- `full_name` (text, required)
- `username` (text, required)
- `password` (password, required on create; optional on edit if change_password not checked)
- `role` (hidden, required)
- `department` (text, optional)
- `change_password` (hidden, value="1" only if checkbox checked in edit mode)

## Validation Rules

### create_user.php
- **full_name:** Required, max 150 chars
- **username:** Required, max 80 chars, alphanumeric + dots + underscores only, must be unique
- **password:** Required, min 8 characters
- **role:** Must be admin, doctor, lab, pharmacy, or receptionist

### update_user.php
- All same validations as create, plus:
- Username unique check excludes current user
- Cannot change own admin role
- Password only required if change_password is set

## Security

- All admin pages require `$_SESSION['role'] === 'admin'`
- Cannot deactivate own account
- Cannot change own role to non-admin

## Reports Date Handling

- Input format from Flatpickr: `d/m/Y`
- Internal PHP conversion: `Y-m-d`
- Default: First of current month to today

## Form Action Logic

The same `user_form.php` file handles both add and edit:
- Add mode: No `?id=` in URL
- Edit mode: `?id={user_id}` in URL

The form action is dynamically set based on mode:
- Add: `modules/admin/actions/create_user.php`
- Edit: `modules/admin/actions/update_user.php`