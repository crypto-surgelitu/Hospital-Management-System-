# HMS Meru - Hospital Management System

A comprehensive, role-based hospital management system designed for healthcare facilities. HMS Meru provides a complete digital solution for managing patients, appointments, laboratory tests, pharmacy inventory, and billing operations.

## Overview

HMS Meru is a full-stack healthcare management application built for **Meru Level 5 Hospital**. The system enables healthcare workers to efficiently manage daily hospital operations including patient registration, appointment scheduling, lab test management, pharmaceutical inventory, and billing.

### Key Features

- **Multi-Role Access Control** - Secure role-based login for different hospital staff
- **Patient Management** - Register, search, and manage patient records
- **Appointment Scheduling** - Book and manage doctor appointments
- **Laboratory Management** - Track and process lab test requests and results
- **Pharmacy Inventory** - Track medications, manage stock levels, and dispense drugs
- **Billing & Invoicing** - Generate bills and record payments

---

## User Roles

| Role | Access |
|------|--------|
| **Administrator** | Full system access - all modules and user management |
| **Doctor** | View patients, manage appointments, add lab requests, view results |
| **Receptionist** | Register patients, create appointments, manage billing |
| **Lab Technician** | View lab requests, collect specimens, enter results |
| **Pharmacist** | Manage pharmacy inventory, dispense medications |

---

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **JWT Decode** - Token handling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL** - Database
- **mysql2** - MySQL driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

### Database
- **MySQL** (MariaDB compatible)

---

## Project Structure

```
HMS/
├── backend/
│   ├── database/
│   │   ├── schema.sql      # Database schema
│   │   └── seeds/       # Sample data
│   └── src/
│       ├── config/       # Database configuration
│       ├── controllers/ # Request handlers
│       ├── middleware/  # Auth & validation
│       ├── routes/     # API routes
│       └── server.js   # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios configuration
│   │   ├── components/ # Reusable UI components
│   │   ├── context/   # React context (Auth)
│   │   ├── pages/     # Page components
│   │   ├── App.jsx  # Main app
│   │   └── main.jsx # Entry point
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
├── legacy/
│   └── php/             # Preserved PHP implementation
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 5.7+
- npm or yarn

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE hms_db;

-- Import schema
SOURCE backend/database/schema.sql;
```

### 2. Environment Configuration

Create `backend/.env`:

```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hms_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=8h
NODE_ENV=development
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

### Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| dr.ochieng | admin123 | Doctor |
| m.wanjiku | admin123 | Receptionist |
| s.oduor | admin123 | Lab Technician |
| g.akinyi | admin123 | Pharmacist |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patients` - List patients
- `GET /api/patients/search` - Search patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id/status` - Update status
- `PATCH /api/appointments/:id/notes` - Add doctor notes

### Laboratory
- `GET /api/lab` - List lab requests
- `POST /api/lab` - Create lab request
- `PATCH /api/lab/:id/specimen` - Mark specimen collected
- `PATCH /api/lab/:id/results` - Enter results

### Pharmacy
- `GET /api/pharmacy/drugs` - List inventory
- `POST /api/pharmacy/drugs` - Add new drug
- `PATCH /api/pharmacy/drugs/:id/stock` - Update stock
- `POST /api/pharmacy/dispense` - Dispense medication

### Billing
- `GET /api/billing` - List invoices
- `GET /api/billing/:id` - Get invoice details
- `POST /api/billing` - Create invoice
- `POST /api/billing/:id/payment` - Record payment

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id/toggle` - Toggle user status
- `PATCH /api/admin/users/:id/reset-password` - Reset password

---

## Database Schema

### Core Tables

**patients** - Patient records
- patient_id, full_name, date_of_birth, gender, phone, email, address, national_id, is_active, created_at, deleted_at

**users** - System users
- user_id, username, password_hash, full_name, role, department, is_active, created_at

**appointments** - Scheduled appointments
- appointment_id, patient_id, doctor_id, appointment_date, status, notes, created_at

**lab_requests** - Laboratory test requests
- lab_request_id, patient_id, test_type, status, priority, specimen_collected, results, requested_by, completed_at, created_at

**pharmacy_inventory** - Medication inventory
- drug_id, drug_name, generic_name, category, quantity_in_stock, unit, expiry_date, reorder_level, unit_price, is_active, created_at

**dispensing** - Medication dispensing records
- id, patient_id, pharmacist_id, created_at

**bills** - Patient bills
- bill_id, patient_id, total_amount, payment_status, bill_date, created_at

**payments** - Payment records
- payment_id, bill_id, amount, payment_method, created_at

---

## Architecture

### Role-Based Access Control (RBAC)

The system implements role-based access control at two levels:

1. **Route Level** - API routes check user roles using `requireRole()` middleware
2. **Frontend Level** - ProtectedRoute component filters navigation and page access

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. All subsequent requests include JWT in Authorization header
5. Token is decoded to determine user role and permissions

### Dashboard Statistics

Each role sees role-specific dashboard data:
- **Admin/Receptionist**: Total patients, today's appointments, pending lab tests, low stock drugs, pending payments
- **Doctor**: My patients, today's appointments, pending lab tests, unfinished notes
- **Lab**: Pending tests, completed today, urgent requests
- **Pharmacy**: Drugs in stock, low stock alerts
- **Pharmacist**: Drugs in stock, low stock alerts

---

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Helmet security headers
- CORS configuration
- Input validation with express-validator
- SQL injection prevention via prepared statements

---

## Development Notes

- Frontend runs on port 5173 (Vite default)
- Backend runs on port 5001
- Database uses `patient_id`, `user_id`, `drug_id` as primary keys
- All timestamps are in UTC
- Soft delete used (deleted_at column)

---

## License

Proprietary - Meru Level 5 Hospital

---

## Support

For technical support, contact the system administrator.