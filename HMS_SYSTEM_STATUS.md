# HMS Meru — System Status & Credentials

This document provides an overview of the current system state and access credentials for the Hospital Management System (HMS) Meru.

## 🌐 Server Status

| Component | Port | Status | URL |
| :--- | :--- | :--- | :--- |
| **Frontend** | 5173 | Running | http://localhost:5173 |
| **Backend** | 5001 | Running | http://localhost:5001 |

> [!NOTE]
> The frontend browser title may appear as "SwahiliPot Hub" (template leftover), but it correctly routes to the HMS modules (Patients, Pharma, etc.).

## 🔐 System Credentials

All default users share the same initial password.

**Default Password:** `Admin@1234`

| Role | Username | Department |
| :--- | :--- | :--- |
| **System Admin** | `admin` | Administration |
| **Doctor** | `dr.ochieng` | General Medicine |
| **Receptionist** | `m.wanjiku` | Front Desk |
| **Lab Tech** | `s.oduor` | Laboratory |
| **Pharmacist** | `g.akinyi` | Pharmacy |
| **Nurse** | `f.njeri` | Nursing |

## 🧪 Development Notes

### Random User Generation
A proposal has been made to add a feature for generating random test users. 
- **Proposed Endpoint**: `POST /api/admin/users/generate`
- **UI Location**: Admin Dashboard
- **Status**: Pending Approval (see `implementation_plan.md` for details)

---
*Last updated: April 10, 2026*
