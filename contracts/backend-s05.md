# Backend Contract - Sprint 05 (Billing Module)

## Form Actions

### Create Bill (`create.php`)
- **Form ID:** `#create-bill-form`
- **Action:** `modules/billing/actions/create.php`
- **Method:** `POST`
- **Roles:** admin, receptionist

### Record Payment (`view.php` modal)
- **Form ID:** `#payment-form`
- **Action:** `modules/billing/api/record_payment.php`
- **Method:** `POST` (AJAX)
- **Roles:** admin, receptionist

## AJAX Endpoints

### Record Payment
- **URL:** `modules/billing/api/record_payment.php`
- **Method:** POST
- **Body:** `{ "bill_id": X, "amount_paid": Y, "payment_method": "Cash|M-Pesa|Insurance|Other" }`
- **Response:**
```json
{
  "success": true,
  "new_status": "Paid|Partial|Unpaid",
  "new_amount_paid": 1500.00,
  "total_amount": 2000.00
}
```

### Load Patient Services
- **URL:** `modules/billing/api/patient_services.php?patient_id={id}`
- **Method:** GET
- **Response:** JSON array
```json
[
  { "description": "Consultation Fee", "unit_price": 500.00, "quantity": 1 },
  { "description": "Lab Test: Malaria RDT", "unit_price": 800.00, "quantity": 1 },
  { "description": "Drug: Panadol (10 Tablets)", "unit_price": 150.00, "quantity": 1 }
]
```

### Patient Search (Reuse from S01)
- **URL:** `modules/patients/api/search.php?q={term}`

## Data Layer Variables

### view.php
- `$bill` - Bill record with patient_name, generated_by_name
- `$items` - Array of bill items ordered by item_id
- `$flash_success` - Success message if set

### index.php
- `$bills` - Array of all bills with patient_name
- `$totals` - Array with outstanding, paid_today, total counts
- `$counts` - Array with counts per status: All, Unpaid, Partial, Paid
- `$unpaid_kes` - Total unpaid amount
- `$flash_success` - Success message if set

### create.php
- `$errors` - Validation errors array
- `$old` - Previously submitted form values

## Form Inputs

### create.php
- `patient_id` (hidden) - Selected via typeahead
- `generated_by` (hidden) - Session user_id
- `items[N][description]` (text) - Array of descriptions
- `items[N][quantity]` (number) - Array of quantities
- `items[N][unit_price]` (number) - Array of unit prices

### record_payment.php
- `bill_id` (hidden)
- `amount_paid` (number)
- `payment_method` (select)

## Validation Rules

### create.php
- **patient_id:** Must exist and be active
- **items:** At least one item required
- **item.description:** Required, not empty
- **item.quantity:** Must be >= 1
- **item.unit_price:** Must be >= 0
- **Transaction:** Bill and items inserts must be atomic

### record_payment.php
- **bill_id:** Must exist
- **amount_paid:** Must be > 0
- **payment_method:** Must be Cash, M-Pesa, Insurance, or Other
- **overpayment:** Cannot exceed remaining balance

## Display Formatting

Use these helper functions:
- `formatKES($bill['total_amount'])` - Format as KES X,XXX.XX
- `formatDate($bill['bill_date'])` - Format as DD/MM/YYYY
- `formatInvoiceID($bill['bill_id'])` - Format as INV-XXXXX

## UI Logic Notes

### Payment Modal
- Pre-fill remaining amount: `$bill['total_amount'] - $bill['amount_paid']`
- Hidden bill_id: `<?php echo $bill['bill_id']; ?>`

### PHP Session Values

For hidden inputs, use:
```php
<input type="hidden" name="generated_by" value="<?php echo $_SESSION['user_id']; ?>">
```

### Status Display
- Unpaid: Red badge
- Partial: Amber badge
- Paid: Green badge