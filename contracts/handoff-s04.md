# Sprint 04 Handoff - Pharmacy Module

This document outlines the technical requirements and integration points for the Pharmacy module built in Sprint 04.

## Forms & Persistence

### 1. Dispense Drug (`#dispense-form`)
- **File:** `modules/pharmacy/dispense.php`
- **Method:** `POST`
- **Inputs:**
  - `patient_id` (hidden, required) - Set via typeahead.
  - `drug_id` (select, required) - Catalog showing name + current stock.
  - `quantity_issued` (number, required) - Min: 1. Max: restricted by current stock in JS.
  - `dosage_instructions` (textarea)
  - `pharmacist_id` (hidden, required) - Session `user_id`.

### 2. Add/Edit Drug (`#drug-form-add`, `#drug-form-edit`)
- **File:** `modules/pharmacy/drug_form.php`
- **Method:** `POST`
- **Inputs:**
  - `drug_id` (hidden, edit only)
  - `drug_name`, `generic_name`, `category` (select), `unit` (select).
  - `quantity_in_stock`, `reorder_level` (number).
  - `expiry_date` (text, Y-m-d format).
  - `unit_price` (number, 2 decimal places).

---

## AJAX Endpoints (Mocked in JS)

### 1. Drug Stock Info
- **URL:** `modules/pharmacy/api/stock.php?drug_id={id}`
- **Method:** `GET`
- **Response Expects:** `{drug_name, quantity_in_stock, unit, reorder_level}`

### 2. Delete Drug
- **URL:** `modules/pharmacy/api/delete_drug.php`
- **Method:** `POST`
- **Body:** `{drug_id: X}`
- **Response Expects:** `{success: bool}`

---

## UI Logic & Visualizations

### 1. Stock Indicators (Inventory)
- **Bar Fill:** `qty / (reorder_level * 5)`.
- **Colors:** Green (>60%), Amber (20-60%), Red (<20%).
- **Row Alerts:** Rows with `qty < reorder_level` gain `bg-red-50` class.

### 2. Expiration Alerts
- **Red Text:** If `expiry_date` is within 30 days of today.
- **Amber Text:** If `expiry_date` is within 60 days of today.

### 3. Live Dispensing Preview
- The stock widget in `dispense.php` simulates the impact of issuing drugs on the remaining inventory bar.
- Prevents submission if `quantity_issued > quantity_in_stock`.
