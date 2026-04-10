# HMS Meru - Bug Report

## Resolved Bugs

### 1. Login Does Not Check User Active Status ✅
**File:** `backend/src/controllers/authController.js` (line 20)
**Severity:** High
**Status:** Fixed

The login function was not checking user active status because the SQL query was missing the `is_active` column. Added `is_active` to the SELECT query.

---

### 2. Port Mismatch in System Status ✅
**File:** `HMS_SYSTEM_STATUS.md`
**Severity:** Low
**Status:** Fixed

Updated system status document to reflect correct backend port (5001).

---

## Notes

- The random user generation feature has been successfully implemented.
- Frontend builds without errors.
- Backend routes and controllers load without syntax errors.
- No TODO/FIXME/HACK markers found in the codebase.