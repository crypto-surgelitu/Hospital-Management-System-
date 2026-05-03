# HMS Meru QA & System Test Report

## Project Overview
- **Frontend Stack**: React 18, Vite, Tailwind CSS, React Router, Axios
- **Backend Stack**: Node.js, Express, MySQL (mysql2), bcryptjs, jsonwebtoken
- **Architecture Summary**: The system uses a decoupled client-server architecture. The frontend is a React Single Page Application communicating with a Node.js Express REST API. Authentication is handled via JWT tokens, and role-based access control (RBAC) is implemented on both the frontend (protected routes) and backend (middleware). 
- **Detected Modules**: Authentication, Dashboard, Patients, Appointments, Laboratory, Pharmacy, Billing, Admin (User Management).
- **Detected Roles**: Administrator, Doctor, Receptionist, Lab Technician, Pharmacist, Nurse.

---

## Environment & Setup Issues
- **Missing Dependencies**: The database connection fails immediately upon backend startup (`Database connection failed: Hint: Is MySQL server running on localhost?`). The local MySQL service was not found on the testing machine, preventing the full initialization of the backend API. 
- **Setup Script Flaws**: The root `check_db.js` script fails due to a `MODULE_NOT_FOUND` error because it requires `mysql2/promise` from the root directory instead of the `backend` directory where dependencies are installed.
- **Mock DB Absence**: There is no fallback or mocked database mode available for development or testing environments when MySQL is unavailable. 

---

## Authentication Findings
- **Session Handling**: The system utilizes JWT tokens with an expiration time (default 8h) configured in `.env`.
- **Validation**: Passwords are required to be at least 6 characters upon reset, enforced by backend validation.
- **Deactivated Accounts**: The backend properly checks `user.is_active` and returns a 401 error ("Account deactivated") before verifying passwords. 
- **Empty Passwords**: The system correctly rejects logins if the user lacks a password hash (`Please set a password. Contact admin to reset.`).
- **Direct Route Access**: The frontend correctly implements protected routes that redirect unauthorized and unauthenticated users back to the login page.

---

## Role-Based Access Findings
- **Middleware Enforcement**: The backend utilizes a `requireRole` middleware that correctly maps specific endpoints to allowed roles.
- **Permission Discrepancies**: 
  - `PATCH /api/appointments/:id/status` is restricted to `admin` and `doctor`. A `receptionist` who created the appointment cannot update its status (e.g., to mark a patient as arrived or cancelled).
  - `PATCH /api/lab/:id/results` is restricted to `lab` only. Administrators and Doctors cannot manually override or input results, which may be intended but could cause friction during edge-case manual data entry.
- **Admin Privilege Escalation**: The `updateUser` endpoint allows an Admin to change user roles. There is no explicit prevention against an Admin downgrading themselves or creating another Admin account to perform malicious actions.

---

## Module Testing Findings
*Note: Full end-to-end CRUD operations were blocked due to the MySQL environment failure. Findings below are based on static analysis and code review.*

- **Admin Module**: The `generateRandomUsers` feature successfully generates random users and passwords but returns the plaintext `temp_password` in the API response.
- **Lab Module**: Specimen collection can be marked by `admin` and `lab`, but results can only be entered by `lab`.
- **Appointments Module**: Lacks route-level constraints preventing doctors from viewing or modifying notes of appointments assigned to other doctors.
- **Patient Module**: Soft deletion (`deleted_at`) is supported in the schema, but validation constraints (e.g., preventing duplicate national IDs) rely heavily on database-level constraints.

---

## UI/UX Findings
- **Login Experience**: The login page gracefully handles API failures (like a DB connection timeout), though it may leave the user confused if the error simply states "Invalid credentials" or a 500 server error when the DB is entirely unreachable.
- **Form Consistency**: The Admin user creation/edit form requires all fields to be manually reset on close (`setForm({ full_name: '', username: '', password: '', ... })`), which works but can be prone to state leaks if expanded.
- **Loading States**: Action loading states (e.g., `actionLoading`) are properly implemented on critical buttons (like password reset) to prevent double submissions.

---

## Backend/API Findings
- **Data Validation**: Express-validator is implemented on critical routes (e.g., `createValidation` in appointments), ensuring malformed payloads are rejected early.
- **Error Handling**: Database errors in controllers are generally caught by `try-catch` blocks and return a 500 status with a generic failure message, preventing stack trace leaks.
- **CORS Configuration**: The backend restricts cross-origin requests using an `ALLOWED_ORIGINS` environment variable, adding a layer of security against unauthorized clients.

---

## Security Findings
- **Exposed Secrets in API**: The `/api/admin/users/generate` endpoint returns randomly generated temporary passwords in plain text in the JSON response payload. While useful for the admin UI, this poses a risk if API traffic is intercepted or logged.
- **Rate Limiting Missing**: There are no apparent rate limiters on the `/api/auth/login` endpoint, making the system vulnerable to brute-force credential stuffing attacks.
- **Password Strength**: The system only enforces a minimal password length of 6 characters during manual resets (`password.length < 6`). There is no enforcement of uppercase, numerical, or special character complexity.
- **Hardcoded Credentials**: The `test_login.js` script contains hardcoded credentials (`admin` / `Admin@1234`). While only a test script, it highlights the default initial credentials strategy.

---

## Performance Findings
- **Pagination Missing**: The `getUsers` and `getDoctors` endpoints fetch all records simultaneously (`SELECT ... FROM users`). Without pagination, this will become a significant performance bottleneck as the hospital staff grows.
- **Database Indexing**: The current queries heavily rely on filtering by `role`, `is_active`, and `username`. Ensure the database schema has proper indexes on these columns to prevent slow table scans.

---

## Critical Bugs
1. **Application Startup Failure**: The backend API completely fails to operate without a local MySQL instance, lacking fallback mechanisms or clear setup scaffolding for new environments.
2. **Missing Module Resolution in Scripts**: The root `check_db.js` fails with `MODULE_NOT_FOUND` because it targets a dependency (`mysql2`) not installed in the root directory.

---

## Medium Priority Bugs
1. **Missing Pagination on List Endpoints**: The Admin and Doctor listing endpoints will suffer performance degradation at scale due to the absence of `LIMIT` and `OFFSET` implementation.
2. **Plaintext Password API Returns**: The `generateRandomUsers` endpoint returns sensitive `temp_password` fields in the HTTP response.
3. **Appointment Status Restrictions**: Receptionists cannot update appointment statuses despite being the primary role responsible for patient intake and scheduling.

---

## Minor Bugs
1. **Password Complexity**: Weak password constraints (minimum 6 characters) during password resets.

---

## Recommendations
1. **Containerize the Environment**: Introduce `docker-compose` with a MySQL container to ensure the application can be started consistently across any environment without local dependency issues.
2. **Implement Rate Limiting**: Add `express-rate-limit` to the authentication routes to prevent brute-force attacks.
3. **Enhance Role Permissions**: Review the RBAC matrix to allow receptionists to update appointment statuses (`pending` -> `in-progress` or `cancelled`).
4. **Implement Pagination**: Add query parameter support (`?page=1&limit=50`) to all `GET` list endpoints (Users, Patients, Appointments).
5. **Secure Temporary Passwords**: Instead of returning plaintext passwords in the API response for generated users, implement a one-time secure link or require users to set a password upon first login via email.

---

## Final Verdict
**Status: NOT Production Ready**

**Major Blockers:**
- The critical dependency on a local MySQL server with no containerization or easy setup script prevents deployment stability. The lack of pagination on core endpoints and absent rate-limiting on login present serious production risks.

**Most Unstable Modules:**
- The environment configuration and startup scripts (`check_db.js`).
- Admin user generation (due to security concerns with plaintext passwords).

**Strongest Parts of the System:**
- The backend architecture is clean and well-structured.
- Role-based middleware (`requireRole`) is consistently applied to routes.
- Frontend uses modern React paradigms with secure routing and action loading states to prevent duplicate submissions.
