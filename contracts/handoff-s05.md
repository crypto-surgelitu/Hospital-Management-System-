# Sprint 05 Handoff - Billing Module

This document outlines the technical requirements and integration points for the Billing module built in Sprint 05.

## Forms & Persistence

### 1. Create Bill (`#create-bill-form`)
- **File:** `modules/billing/create.php`
- **Method:** `POST`
- **Inputs:**
  - `patient_id` (hidden, required) - Set via typeahead.
  - `generated_by` (hidden, required) - PHP sets from `$_SESSION['user_id']`.
  - `items[N][description]` (text, required) - Array of service names.
  - `items[N][quantity]` (number, required) - Array of quantities.
  - `items[N][unit_price]` (number, required) - Array of prices (2 decimals).

### 2. Record Payment (`#payment-form`)
- **File:** `modules/billing/view.php` (Custom Modal)
- **Method:** `POST` (AJAX recommended)
- **Inputs:**
  - `bill_id` (hidden, required).
  - `amount_paid` (number, required) - Amount being recorded.
  - `payment_method` (hidden, required) - Values: `Cash`, `M-Pesa`, `Insurance`, `Other`.

---

## AJAX Endpoints (Mocked in JS)

### 1. Load Patient Services
- **URL:** `/* ENDPOINT: see contracts/backend-s05.md */`
- **Method:** `GET`
- **Trigger:** Patient selection in typeahead.
- **Response Expects:** `[{description, quantity, unit_price}]`
- **Usage:** Populates the line items table in `create.php`.

### 2. Record Payment Update
- **URL:** `/* ENDPOINT: see contracts/backend-s05.md */`
- **Method:** `POST`
- **Trigger:** Confirm Payment in modal.
- **Response Expects:** `{success: bool, new_status: string, new_amount_paid: float}`
- **Usage:** Updates the status badge and total paid amount in `view.php` without reload.

### 3. Patient Typeahead
- **Source:** Reuse `modules/patients/api/search.php?q={term}`.

---

## UI Logic & State

### 1. Currency Formatting
- Use `Number(val).toLocaleString('en-KE', { minimumFractionDigits: 2 })` for all KES displays.
- Prefix all financial sums with `KES`.

### 2. Live Recalculation
- `create.php` includes a math engine that updates row subtotals and the grand total on every keystroke (`qty` or `price`) and on row removal.

### 3. Print Styles
- The `view.php` invoice includes `@media print` rules to hide navigation elements and expand the invoice card to full width for clean A4 printing.
