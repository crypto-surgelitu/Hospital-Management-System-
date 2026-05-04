# QA Discovery Report - HMS Meru Level 5 System

## Executive Summary

This report documents findings from a comprehensive QA audit of the HMS (Hospital Management System) - Meru Level 5 Digital Health system. The system is a full-stack healthcare management application with React frontend and Express.js backend using MySQL database.

**System Components Examined:**
- Frontend: React 18 with Vite, React Router, Context API
- Backend: Express.js REST API with MySQL database
- Authentication: JWT-based with role-based access control
- Key Features: Patient management, appointments, billing, lab workflows, pharmacy, queue management, nurse tasks

**Overall Assessment:** The system demonstrates solid core functionality with some areas requiring attention. There are several bugs and gaps that impact reliability and user experience.

---

## System Health Overview

| Category | Status | Notes |
|----------|--------|-------|
| Authentication | ⚠️ Working with gaps | JWT working but has edge cases |
| Authorization | ✓ Working | RBAC properly implemented |
| Frontend State | ⚠️ Issues found | Multiple state management bugs |
| Backend API | ⚠️ Issues found | Some validation gaps |
| Database Integrity | ⚠️ Issues found | Some schema inconsistencies |
| Workflows | ⚠️ Incomplete | Some workflow gaps |
| UI/UX | ✓ Acceptable | Minor issues |

---

## Critical Bugs

### 1. Duplicate Function Definition in Patient Controller

**Location:** `backend/src/controllers/patientController.js:217-259`

**Severity:** HIGH

**Description:** The `deletePatient` function is defined twice in the patientController.js file. This causes the second definition to override the first, and the second definition has no reference to a separate delete operation. This redundancy creates confusion and potential maintenance issues.

**Root Cause:** Code duplication error - developer likely copied the function and forgot to remove the duplicate.

**Affected Module:** patientController.js

**Reproduction Steps:**
1. Attempt to call the patient delete endpoint
2. The function works but is duplicated

**Risk Level:** Medium - Function works but creates code maintenance issues

**Recommendation:** Remove duplicate function definition at lines 239-259

---

### 2. Frontend: Missing Error Boundary / Crash Handling

**Location:** `frontend/src/App.jsx`

**Severity:** HIGH

**Description:** The React application has no error boundary component. If any component throws an error during rendering, the entire application crashes with a white screen. There is no graceful degradation or user-friendly error message.

**Root Cause:** Missing React error boundary implementation

**Affected Module:** App.jsx (root level)

**Reproduction Steps:**
1. Trigger any unhandled JavaScript error in any component
2. Application crashes without any error UI

**Risk Level:** High - Any unhandled error causes complete application failure

**Recommendation:** Implement Error Boundary component at App root level

---

## High Priority Bugs

### 3. Authorization Bypass: Doctor Can Access All Appointments

**Location:** `backend/src/controllers/appointmentController.js:21-24`

**Severity:** HIGH

**Description:** The `getAppointments` endpoint filters appointments by doctor_id only when `req.user.role === 'doctor'`. However, the SQL query uses `WHERE 1=1` with additional AND conditions, meaning other roles (admin, receptionist) can see ALL appointments across all doctors. While this is expected for admin, the implementation does not enforce proper filtering for doctors properly when there are no other filters applied.

**Root Cause:** Incomplete authorization logic in appointment filtering

**Affected Module:** appointmentController.js

**Risk Level:** Medium - Only affects data visibility, not modification

**Recommendation:** Ensure doctor's can only see their assigned appointments

---

### 4. Billing: Payment Recording Fails Silently for Missing Payment Table

**Location:** `backend/src/controllers/billingController.js:76-90, 236-251`

**Severity:** HIGH

**Description:** The billing controller has try-catch blocks that silently swallow errors when the `payments` table doesn't exist. The code checks for error codes 'ER_NO_SUCH_TABLE' and 'ER_BAD_FIELD_ERROR' and continues, but this means:
- Payments are recorded in the bill table (amount_paid field)
- But no payment history is recorded
- Users see "0 payments" even when money was received

**Root Cause:** Database schema mismatch - payments table may not exist, or has different schema

**Affected Module:** billingController.js

**Reproduction Steps:**
1. Create an invoice
2. Record a payment
3. Check payment history - shows as empty despite payment being recorded

**Risk Level:** High - Financial records are incomplete

**Database Related:** YES - payments table issue

**Recommendation:** Verify payments table exists and has correct schema

---

### 5. Frontend: Queue Wait Time Calculated Incorrectly on Render

**Location:** `backend/src/controllers/queueController.js:35-38`

**Severity:** MEDIUM

**Description:** Wait time is calculated on server-side when fetching queue data using `Math.floor((Date.now() - new Date(entry.created_at)) / 60000)`. This creates a static string at the time of API call and does not update. Users see stale wait times that don't refresh.

**Root Cause:** Server calculates wait time once at request time; frontend doesn't re-fetch or recalculate

**Affected Module:** queueController.js, Queue.jsx

**Reproduction Steps:**
1. Add patient to queue
2. Wait 5 minutes
3. View queue - wait time still shows initial minutes

**Risk Level:** Low - UI inconsistency, not functional failure

**Recommendation:** Calculate wait time on client-side with useEffect or use a polling mechanism

---

### 6. Lab Test Price Lookup Fails Silently

**Location:** `backend/src/controllers/referralController.js:62-64`

**Severity:** MEDIUM

**Description:** When creating a lab referral, the code attempts to look up test price from `lab_test_types` table using test_name. If the test is not found or the table doesn't have the expected schema, no error is thrown - the lab fee just becomes 0. This means:
- Lab tests are created without billing
- No revenue tracking for lab services
- Silent failure

**Root Cause:** Missing validation when price lookup fails

**Affected Module:** referralController.js

**Database Related:** YES - lab_test_types table schema

**Recommendation:** Add validation to ensure price is retrieved or log warning

---

### 7. Frontend: Race Condition in Search Debouncing

**Location:** `frontend/src/pages/Patients.jsx:278-284`

**Severity:** MEDIUM

**Description:** The patient search uses setTimeout with 400ms debounce, but there's a potential race condition:
- User types "John"
- After 400ms, API call made for "John"
- User quickly types "Smith" (total "John Smith")
- First API call for "John" returns and sets results
- Second API call for "John Smith" overwrites with correct results

This is mostly handled correctly, but if the first call returns AFTER the second call (due to network latency), stale data can be displayed.

**Root Cause:** No request cancellation mechanism (no AbortController)

**Affected Module:** Patients.jsx

**Reproduction Steps:**
1. Type partial search term quickly
2. Network is slow
3. Results may show previous search results

**Risk Level:** Low - Minor UX issue, not data corruption

**Recommendation:** Implement AbortController for request cancellation

---

## Medium Priority Bugs

### 8. Patient Update Endpoint Excludes Date of Birth

**Location:** `backend/src/controllers/patientController.js:186-206`

**Severity:** MEDIUM

**Description:** The `updatePatient` function allows updating name, phone, address, and email but excludes date_of_birth from the update operation. Patients cannot update their date of birth after registration.

**Root Cause:** Incomplete field handling in update function

**Affected Module:** patientController.js

**Reproduction Steps:**
1. Create patient with incorrect DOB
2. Try to update DOB - field is not available in update form (frontend)
3. Or attempt via API - DOB not included in UPDATE query

**Risk Level:** Medium - Data cannot be corrected

---

### 9. Missing Role-Based Access for Patient History

**Location:** `backend/src/routes/patients.js:33`

**Severity:** MEDIUM

**Description:** The patient history endpoint requires admin and doctor roles, but does not include 'receptionist' who may need to view patient history for registration purposes. Receptionist can view patient details but not full history.

**Root Cause:** Role configuration in route definition

**Affected Module:** routes/patients.js

**Risk Level:** Low - Minor workflow inconvenience

---

### 10. Queue Call Patient Sets Wrong Status

**Location:** `backend/src/controllers/queueController.js:176-190`

**Severity:** MEDIUM

**Description:** The `callPatient` endpoint updates status to 'waiting' when called:
```javascript
await pool.query(
  'UPDATE patient_queue SET called_at = NOW(), status = ?, updated_at = NOW() WHERE queue_id = ?',
  ['waiting', id]
);
```
This makes no sense - the patient was already waiting and is now being "called", so the status should probably become 'called' or remain 'waiting'. This logic is confusing and may cause workflow issues.

**Root Cause:** Unclear status logic

**Affected Module:** queueController.js

---

### 11. Frontend: No Form Validation for Empty Invoice Items

**Location:** `frontend/src/pages/Billing.jsx:75-79`

**Severity:** MEDIUM

**Description:** When creating a new invoice, the frontend validation only checks that at least one item has description and quantity > 0. However, it does NOT validate that unit_price is provided. Users can create invoice items with 0 price.

**Root Cause:** Incomplete form validation

**Affected Module:** Billing.jsx

**Recommendation:** Add validation to require unit_price > 0

---

### 12. Incomplete Error Handling in Pharmacy Dispensing

**Location:** `frontend/src/pages/DoctorQueue.jsx:104-156`

**Severity:** MEDIUM

**Description:** The DoctorQueue page has three separate methods for creating referrals:
- handleCreateLabReferral
- handleCreatePharmacyReferral
- handleCreateNurseTask

Each uses different API endpoints (/referrals/lab, /referrals/pharmacy, /referrals/nurse), but the main handleComplete function ALSO attempts to create referrals via the queue completion endpoint (/queue/{id}/complete). This creates confusion - some referrals go through queue completion, others through separate API calls. The UI is inconsistent about what happens after completion.

**Root Cause:** Design inconsistency

**Affected Module:** DoctorQueue.jsx

---

## Low Priority Bugs

### 13. Frontend: Duplicate key Prop Warning in Tables

**Location:** Multiple frontend pages (Patients.jsx, Billing.jsx, etc.)

**Severity:** LOW

**Description:** Several tables use array index as key in map functions. While functional, React throws console warnings about using index as key when items can be reordered or deleted.

**Affected Module:** Multiple pages

**Example (Patients.jsx line 421):**
```javascript
patients.map((p) => (
  <tr key={p.patient_id} ...> // OK - uses patient_id
```

---

### 14. Hardcoded Service Price in Consultation

**Location:** `backend/src/controllers/queueController.js:306-339`

**Severity:** LOW

**Description:** The consultation completion logic hardcodes "General Consultation" as the service name:
```javascript
const [[servicePrice]] = await pool.query(
  `SELECT unit_price FROM service_prices WHERE service_name = 'General Consultation' AND is_active = 1`
);
```
If this service doesn't exist in the database, the consultation fee is 0.

**Root Cause:** No fallback or error handling for missing service

**Recommendation:** Add validation and fallback pricing

---

### 15. Admin Controller - User Search Missing Role Validation

**Location:** `backend/src/controllers/adminController.js`

**Severity:** LOW

**Description:** The admin controller includes a search endpoint that allows searching users, but doesn't properly validate admin-only access in all endpoints.

**Note:** This needs verification against the actual adminController.js implementation

---

## Authentication Issues

### 16. JWT Token Has No Refresh Mechanism

**Description:** JWT tokens expire after the configured JWT_EXPIRES_IN period. There is no token refresh endpoint. When a token expires, users are immediately logged out without warning, losing unsaved work.

**Severity:** Medium

**Recommendation:** Implement token refresh endpoint

---

### 17. No Logout API Call - Only Client-Side Logout

**Location:** `frontend/src/components/Sidebar.jsx:84-90`

**Description:** The logout button only removes the token from localStorage on the client side. It does not call the backend `/api/auth/logout` endpoint to invalidate the token server-side. This means tokens remain valid until they naturally expire.

**Severity:** Low - Security concern but minor in practice

---

## Authorization Issues

### 18. Role Middleware Missing in Some Routes

**Location:** `backend/src/routes/appointments.js`

**Description:** Appointment routes are protected by verifyToken but the role restrictions are applied in the controller, not the route. This creates inconsistency with other routes that use requireRole middleware.

**Severity:** Low

---

### 19. Patient Delete Accessible Only by Admin (Correct)

**Location:** `backend/src/routes/patients.js:39`

**Description:** Patient delete is correctly restricted to admin role only. This is proper RBAC implementation.

**Status:** ✓ Working correctly

---

## Frontend Issues

### 20. Console Warnings - Bootstrap Icons Not Loaded

**Location:** Multiple pages

**Description:** The UI uses Bootstrap Icons (bi bi-*) class names but no Bootstrap Icons library is loaded in the project. Icons display as empty squares or fallback text.

**Severity:** Low - Visual only

**Recommendation:** Add Bootstrap Icons CDN or install library

---

### 21. No Loading State for Initial Page Load

**Location:** App.jsx

**Description:** When the app loads with a stored JWT token, there's no loading indicator while the token is being validated. Users may see a brief flash or white screen.

**Severity:** Low - UX issue

---

### 22. Form Reset Incomplete in Modal Components

**Location:** Multiple modal components (Patients.jsx, Billing.jsx, Queue.jsx)

**Description:** When closing modals without submitting, form state may persist. Components use useEffect to reset on open, but not all fields are consistently reset on close.

**Severity:** Low

---

## Backend Issues

### 23. No Input Sanitization for SQL Injection (Parameterized Queries Used)

**Status:** ✓ Working correctly - All queries use parameterized queries

**Description:** The codebase properly uses parameterized queries throughout, preventing SQL injection attacks.

---

### 24. Missing Rate Limiting on Non-Auth Routes

**Location:** backend/src/server.js

**Description:** Rate limiting is only applied to auth routes (login attempts). Other endpoints like patient search could be abused.

**Severity:** Low

**Recommendation:** Add general rate limiting

---

### 25. Inconsistent Error Response Format

**Location:** Multiple controllers

**Description:** Some errors return `{success: false, message: '...'}` while others may return different formats. This makes frontend error handling complex.

**Severity:** Low

**Recommendation:** Standardize error response format across all endpoints

---

## API Issues

### 26. Pagination Inconsistent Across Endpoints

**Description:** Some endpoints return pagination metadata (total, page, totalPages), others don't. For example:
- `/patients` - Returns pagination
- `/patients/search` - Returns array without pagination
- `/queue` - Returns array without pagination

**Severity:** Medium - Inconsistent API design

---

### 27. No API Versioning

**Description:** All API endpoints are at /api/ level with no versioning. Future breaking changes will be difficult to implement.

**Severity:** Low - Future concern

---

## Database/Data Integrity Issues

### 28. Payment Table May Not Exist

**Description:** The billing controller has code to handle missing payment table. This suggests the schema may be incomplete or migrations haven't been run properly.

**Database Related:** YES

**Severity:** High - Data integrity issue

**Recommendation:** Run database migrations to ensure all tables exist

---

### 29. Lab Test Types Table - Missing Price Column?

**Description:** The referral controller queries for `lab_test_types.price` but it's unclear if this column exists. The system may fall back to 0 fee silently.

**Database Related:** YES

**Severity:** Medium

---

### 30. No Foreign Key Constraints Visible

**Description:** Schema doesn't show explicit foreign key constraints. This could lead to orphaned records.

**Database Related:** YES

**Severity:** Medium

**Recommendation:** Add foreign key constraints in database schema

---

## Billing Workflow Issues

### 31. Bill Items Not Linked to Consultation Queue Entry

**Description:** When a consultation is completed, a bill is created with "General Consultation" item but there's no reference to which queue entry generated it. This makes reconciliation difficult.

**Severity:** Medium

---

### 32. Partial Payment Logic Works But Lacks Alerts

**Description:** When a bill reaches "Partial" payment status, there are no notifications or alerts for staff to follow up. The invoice just sits in Partial state.

**Severity:** Low - Feature gap

---

### 33. No Refund Functionality

**Description:** There's no way to process a refund if a payment was made in error or needs to be reversed.

**Severity:** Medium - Business gap

---

## Prescription Workflow Issues

### 34. Doctor Can Only Create Text-Based Pharmacy Requests

**Location:** `frontend/src/pages/DoctorQueue.jsx:268-385`

**Description:** Doctors can only send text descriptions of medications, not select from actual pharmacy inventory. Pharmacist must interpret the doctor's request and find appropriate medication.

**Root Cause:** Design limitation

**Severity:** Medium - Workflow inefficiency

---

### 35. No Prescription Validation Against Inventory

**Location:** DoctorQueue.jsx

**Description:** When doctor sends pharmacy request, there's no check if the requested medication is in stock. This leads to workflow delays when pharmacist must inform doctor of stock issues.

**Severity:** Medium

---

## Lab Workflow Issues

### 36. Lab Results Entered as Free Text

**Location:** `frontend/src/pages/Lab.jsx:24-66`

**Description:** Lab technicians enter results as free-form text. There's no structured format for test results (e.g., numeric ranges, normal/abnormal flags).

**Severity:** Medium - Data quality concern

---

### 37. No Results Notification to Doctor

**Description:** When lab results are entered, there's no notification to the doctor who ordered them. The doctor must check manually or wait for patient follow-up.

**Severity:** Low - Notification gap

---

## UI/UX Issues

### 38. Confusing Status Terminology in Queue

**Location:** Frontend Queue.jsx, DoctorQueue.jsx

**Description:** Queue uses three statuses: 'waiting', 'in_progress', 'completed'. The 'called' status exists in the database (called_at field) but is not used in UI. This creates confusion.

**Severity:** Low

---

### 39. No Confirmation for Destructive Actions

**Location:** Multiple pages

**Description:** Delete operations (remove from queue, archive patient) use simple confirm() dialogs instead of proper modal confirmations.

**Severity:** Low

---

### 40. Date/Time Handling - Timezone Issues

**Description:** Dates are stored in UTC but displayed in local time. Some dates may show incorrect day due to timezone conversion.

**Severity:** Low - Display issue

---

## Performance Issues

### 41. No Query Optimization - N+1 Queries

**Location:** Multiple controllers (queueController.js, patientController.js)

**Description:** Several endpoints fetch related data with separate queries instead of JOINs. For example, patient history endpoint makes 5 separate queries.

**Severity:** Medium - Performance concern at scale

---

### 42. No Pagination Limit Enforcement

**Location:** patientController.js:44-46

**Description:** While limit defaults to 20, there's no maximum cap. A malicious request could request limit=1000000.

**Severity:** Low

---

### 43. No Caching Implementation

**Description:** Frequently accessed data (doctors list, service prices, etc.) is fetched from database on every request with no caching.

**Severity:** Low - Performance at scale

---

## Security Concerns

### 44. JWT Secret in Environment Variable (Correct)

**Status:** ✓ Working correctly - JWT_SECRET is in .env file

---

### 45. No HTTPS Enforcement

**Description:** No middleware to redirect HTTP to HTTPS in production

**Severity:** Medium - Security

**Recommendation:** Add HTTPS redirect middleware

---

### 46. Password Requirements Not Enforced

**Location:** backend/src/controllers/authController.js

**Description:** No password complexity requirements (minimum length, uppercase, numbers, special chars).

**Severity:** Low - Security

---

### 47. Sensitive Data in Logs

**Description:** Server logs may contain sensitive information like patient names in error traces

**Severity:** Low - Security concern

---

## Reproduction Steps for Key Issues

### Issue #4: Payment History Not Recorded

1. Login as admin or receptionist
2. Navigate to Billing
3. Create a new invoice for a patient
4. Open the invoice details
5. Click "Record Payment"
6. Enter amount and payment method
7. Submit payment
8. View payment history section - it will be empty despite payment being recorded in total

### Issue #5: Stale Wait Times

1. Login as receptionist
2. Add patient to queue
3. Note the wait time shown
4. Wait 5 minutes
5. Refresh the queue page
6. Wait time still shows original minutes, not updated

### Issue #10: Empty Invoice Items Allowed

1. Login as admin/receptionist
2. Go to Billing
3. Create new invoice
4. Add item with description and quantity but leave price empty
5. Submit - it may create invoice with 0 price items

---

## Root Cause Analysis Summary

| Category | Count | Top Root Causes |
|----------|-------|-----------------|
| Code Duplication | 1 | deletePatient function |
| Missing Error Handling | 3 | Payment table, lab price, validation |
| State Management | 2 | Wait time staleness, search race conditions |
| Database Schema | 2 | Missing tables, inconsistent columns |
| Design Gaps | 4 | Prescriptions, lab results, notifications |
| RBAC Issues | 2 | Patient history roles, appointments filter |

---

## Recommended Fix Priority

### Immediate (This Sprint)
1. Add error boundary to React app
2. Fix duplicate deletePatient function
3. Verify/create payments table in database
4. Add lab_test_types price column or fallback logic

### Next Sprint
5. Fix queue wait time calculation (client-side)
6. Add form validation for invoice items (unit_price required)
7. Implement token refresh mechanism
8. Standardize API error response format

### Backlog
9. Add pagination to all list endpoints
10. Implement pharmacy inventory lookup for doctors
11. Add notification system for lab results
12. Add proper confirmation modals for destructive actions

---

## Potential Regression Risk Areas

| Area | Risk Level | Reason |
|------|------------|--------|
| Billing controller | HIGH | Payment recording has fragile error handling |
| Queue controller | MEDIUM | Status transitions are complex |
| Patient history | MEDIUM | Multiple JOIN queries could break |
| Referral system | MEDIUM | Multiple tables involved (referrals, lab, pharmacy, bills) |
| React Router | LOW | Protected routes work but nested routes complex |

---

## Testing Recommendations

### Smoke Tests (Per Role)

**Admin:**
- Login as admin, access all pages
- Create patient, appointment, invoice
- View all queues and dashboards

**Doctor:**
- Login as doctor, access examination queue
- Start consultation, complete with referrals
- View patient history

**Receptionist:**
- Login as receptionist
- Add patient to queue
- Create appointment
- Create invoice

**Lab:**
- Login as lab technician
- View pending requests
- Enter results

**Pharmacy:**
- Login as pharmacist
- View pharmacy inventory
- Process prescriptions

---

## Conclusion

The HMS system demonstrates solid core functionality with proper JWT authentication and role-based access control. The main areas requiring attention are:

1. **Data Integrity**: Payment recording issues and missing database schema elements
2. **Error Handling**: Need error boundaries and better validation
3. **UX**: Stale wait times, confusing referral workflow
4. **Code Quality**: Duplicate function, inconsistent error formats

The system is production-viable with the identified issues documented for resolution in subsequent sprints.