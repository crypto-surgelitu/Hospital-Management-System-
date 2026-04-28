# HMS System Workflow Documentation

## Overview
Hospital Management System (HMS) - A multi-role healthcare application managing patient flow from registration through consultation, diagnosis, lab tests, pharmacy, and billing.

---

## User Roles & Access

| Role | Username | Responsibilities |
|------|----------|------------------|
| Admin | admin | System administration, user management |
| Doctor | dr.ochieng | Consult patients, write diagnosis, order tests/prescriptions |
| Nurse | f.njeri | Execute nurse tasks assigned by doctor |
| Receptionist | m.wanjiku | Patient registration, queue management, appointments |
| Pharmacy | g.akinyi | Fulfill prescriptions |
| Lab | s.oduor | Perform and record lab tests |

**Default Password**: `admin123` (set for all users)

---

## Patient Flow

```
Patient Registration → Queue Check-in → Doctor Consultation → Diagnosis
                                                            ↓
                          ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
                          ↓                    ↓            ↓
                       Lab Tests          Pharmacy      Nurse Tasks
                          ↓                    ↓            ↓
                       Lab Tech          Pharmacist      Nurse
                          ↓                    ↓            ↓
                       Results          Fulfillment      Completion
                          ↓                    ↓            ↓
                          → → → → → → → → → → → → → → → → → → → →
                                                            ↓
                                                         Billing
                                                            ↓
                                                       Admin Review
```

---

## Phase 1: Diagnosis & Consultation Flow ✅ **COMPLETE**

### Status: READY FOR TESTING

### Features Implemented:
1. **Doctor Queue** - Doctor sees waiting patients
2. **Start Consultation** - Doctor begins patient consultation
3. **Consultation Notes** - Doctor adds consultation notes
4. **Complete Consultation** - Doctor finishes and adds diagnosis
5. **Referral System** - Doctor sends patient to:
   - Lab (for tests)
   - Pharmacy (for medications)
   - Nurse (for procedures)

### API Endpoints:
- `GET /api/queue` - Get patient queue
- `PATCH /api/queue/:id/start` - Start consultation
- `PATCH /api/queue/:id/complete` - Complete with diagnosis
- `POST /api/referrals/lab` - Create lab referral
- `POST /api/referrals/pharmacy` - Create prescription
- `POST /api/referrals/nurse` - Create nurse task

### TODO (Phase 1b):
- [ ] Diagnosis field in consultation completion
- [ ] Diagnosis viewable in patient history
- [ ] Follow-up appointment option

---

## Phase 2: Lab Test Results System ✅ **COMPLETE**

### Status: READY FOR TESTING

### Features Implemented:
1. **Lab Test Catalog** - 14 predefined test types in database ✅
2. **Get Test Types API** - `GET /api/lab/types`
3. **Doctor Test Selection** - Dropdown loads from database ✅
4. **Priority Options** - Routine, Urgent, STAT ✅
5. **Specimen Collection** - Collection status tracking
6. **Result Entry** - Lab tech enters results
7. **Result Notification** - Doctor can view completed results

### Database:
- `lab_test_types` table with 14 predefined tests

### Frontend:
- DoctorQueue.jsx - Loads test types from API

---

## Phase 3: Prescription Fulfillment ✅ COMPLETE

### Status: READY FOR TESTING

### Features Implemented:
1. **Drug Catalog** - 19 drugs in pharmacy inventory
2. **Get Drugs API** - GET /api/pharmacy/drugs
3. **Doctor Drug Selection** - Dropdown loads from database
4. **Prescription Creation** - Creates referral with drug_id
5. **Inventory Tracking** - Stock decreases on dispense
6. **Dispense Recording** - Full audit trail

---

## Phase 4: Nurse Portal ✅ COMPLETE

### Status: READY FOR TESTING

### Features Implemented:
1. **Nurse Login** - Standalone nurse user ✅
2. **Task Dashboard** - View all assigned tasks
3. **Task Filtering** - By status (pending/in_progress/completed)
4. **Patient Info** - Name, phone, gender
5. **Task Details** - Task description, priority
6. **Start/Complete** - Mark tasks in progress/complete
7. **Stats API** - `/api/nurse/stats`
8. **Enhanced Query** - More patient details

### Users:
- `f.njeri` / `nurse123` (Nurse)

---

## Phase 5: Billing Integration ✅ COMPLETE

### Status: READY FOR TESTING

### Features Implemented:
1. **Service Prices** - 23 predefined services
2. **Get Services API** - GET /api/billing/services
3. **Auto Bill Creation** - POST /api/billing/auto
4. **Bill Items** - Line items with quantities
5. **Payment Recording** - Cash, M-Pesa, Insurance
6. **Payment Status** - Tracking paid/pending

### Database:
- `service_prices` - 23 services (Consultation, Lab, Pharmacy, Nursing)
- `bills` - Patient bills
- `bill_items` - Bill line items

### API:
- GET /api/billing/services - Get service catalog
- POST /api/billing/auto - Auto-generate bill from services

---

## Phase 6: Patient History ✅ COMPLETE

### Status: READY FOR TESTING

### Features Implemented:
1. **Full History API** - GET /api/patients/:id/history
2. **Appointments** - Visit history with doctor
3. **Lab Results** - All ordered tests
4. **Prescriptions** - All medications
5. **Bills** - Payment history
6. **Queue Visits** - Consultation records
7. **UI Modal** - History view in Patients page

### Database Query:
- Aggregates from: appointments, lab_requests, doctor_referrals, bills, patient_queue

---

## ALL PHASES COMPLETE ✅

| Phase | Name | Status |
|-------|------|--------|
| 1 | Diagnosis & Consultation | ✅ Complete |
| 2 | Lab Results | ✅ Complete |
| 3 | Prescription Fulfillment | ✅ Complete |
| 4 | Nurse Portal | ✅ Complete |
| 5 | Billing Integration | ✅ Complete |
| 6 | Patient History | ✅ Complete |

**ALL 6 PHASES COMPLETE** ✅