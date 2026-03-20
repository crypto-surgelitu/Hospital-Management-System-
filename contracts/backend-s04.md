# Backend Contract - Sprint 04 (Pharmacy Module)

## Form Actions

### Dispense Drug (`dispense.php`)
- **Form ID:** `#dispense-form`
- **Action:** `modules/pharmacy/actions/dispense.php`
- **Method:** `POST`
- **Roles:** pharmacy, admin

### Add Drug (`drug_form.php` for add)
- **Form ID:** `#drug-form-add`
- **Action:** `modules/pharmacy/actions/add_drug.php`
- **Method:** `POST`
- **Roles:** pharmacy, admin

### Edit Drug (`drug_form.php` for edit)
- **Form ID:** `#drug-form-edit`
- **Action:** `modules/pharmacy/actions/update_drug.php`
- **Method:** `POST`
- **Roles:** pharmacy, admin

## AJAX Endpoints

### Drug Stock Info
- **URL:** `modules/pharmacy/api/stock.php?drug_id={id}`
- **Method:** GET
- **Response:**
```json
{
  "drug_name": "Amoxicillin",
  "quantity_in_stock": 45,
  "unit": "Tablets",
  "reorder_level": 50
}
```

### Delete Drug
- **URL:** `modules/pharmacy/api/delete_drug.php`
- **Method:** POST
- **Body:** `{ "drug_id": X }`
- **Response:** `{ "success": true }`
- **Roles:** admin only

### Patient Search (Reuse from S01)
- **URL:** `modules/patients/api/search.php?q={term}`

## Data Layer Variables

### inventory.php
- `$drugs` - Array of all active drugs
- `$flash_success` - Success message if set

### history.php
- `$dispensing` - Array of dispensing records with patient_name, drug_name, pharmacist_name
- `$flash_success` - Success message if set

### dispense.php
- `$drugs` - Array of drugs with stock > 0 (for dropdown)
- `$errors` - Validation errors array
- `$old` - Previously submitted form values

### drug_form.php
- `$is_edit` - Boolean, true if editing
- `$drug` - Drug record when editing (null for add)
- `$errors` - Validation errors array
- `$old` - Previously submitted form values

## Form Inputs

### dispense.php
- `patient_id` (hidden) - Selected via typeahead
- `drug_id` (select) - Drug dropdown
- `quantity_issued` (number) - Min 1, max limited by stock
- `dosage_instructions` (textarea, optional)
- `pharmacist_id` (hidden) - Session user_id

### drug_form.php (add/edit)
- `drug_id` (hidden, edit only)
- `drug_name` (text, required)
- `generic_name` (text, optional)
- `category` (select, optional)
- `unit` (select, optional)
- `quantity_in_stock` (number, required)
- `expiry_date` (text, Y-m-d format, optional)
- `reorder_level` (number, required)
- `unit_price` (number, 2 decimal places, required)

## Validation Rules

### dispense.php
- **patient_id:** Must exist and be active
- **drug_id:** Must exist and be active
- **quantity_issued:** Must be >= 1 and <= available stock
- **Transaction:** Stock decrement and dispensing insert must be atomic

### add_drug.php / update_drug.php
- **drug_name:** Required, max 150 chars
- **quantity_in_stock:** Must be >= 0
- **unit_price:** Must be >= 0
- **reorder_level:** Must be >= 0
- **expiry_date:** If provided, must be future date (Y-m-d)

## UI Logic Notes

### Stock Indicators
- Bar fill: `qty / (reorder_level * 5)`
- Colors: Green (>60%), Amber (20-60%), Red (<20%)
- Row alerts: `bg-red-50` when `qty < reorder_level`

### Expiration Alerts
- Red text: Within 30 days
- Amber text: Within 60 days

### PHP Session Values

For hidden inputs, use:
```php
<input type="hidden" name="pharmacist_id" value="<?php echo $_SESSION['user_id']; ?>">
```

## Drug Form Mode Detection

The same `drug_form.php` file handles both add and edit:
- Add mode: No `?id=` in URL
- Edit mode: `?id={drug_id}` in URL

The form action is dynamically set based on mode.