# HMS Meru - System Workflow Documentation

## Document Overview
This document tracks the implementation of the new patient workflow system and nurse feature. Each phase is documented as completed with details of changes made.

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-04-27 | Initial document creation |
| 1.1.0 | 2026-04-27 | Backend implementation completed |
| 1.2.0 | 2026-04-27 | Frontend Nurse Tasks page completed |
| 1.3.0 | 2026-04-27 | Queue & Doctor Examination pages completed |

---

## Phase 1: Database Foundation

### Status: ✅ COMPLETED

### Date Completed: 2026-04-27

### Description
Added necessary database tables and modified existing schema to support patient queue, nurse tasks, and doctor referrals.

### Changes Made

#### 1.1 New Tables Created

**patient_queue** - Manages patient waiting queue
- Tracks queue status (waiting, in_progress, completed, cancelled, no_show)
- Supports priority levels (normal, urgent)
- Stores chief complaint and notes
- Queue number for ordering
- Timestamps for all state changes

**nurse_tasks** - Assigns tasks to nurses from doctors
- Task types: injection, vital_signs, wound_care, observation, dressing, other
- Status tracking (pending, in_progress, completed)
- Links to queue entry and patient
- Assigned by and completed by tracking

**doctor_referrals** - Tracks referrals from doctor to lab, pharmacy, or nurse
- Stores referral type and item details
- Status tracking (pending, completed, cancelled)
- Links to queue, patient, and doctor

#### 1.2 Schema Modifications

**users table role values**
- Fixed: changed 'pharmacist' to 'pharmacy' to match actual usage
- Valid Roles: admin, doctor, nurse, pharmacy, lab, receptionist

### Related Files Modified
- `backend/database/schema.sql` - Added new tables
- `backend/src/middleware/auth.js` - Added 'nurse' to VALID_ROLES

---

## Phase 2: Backend Queue Routes

### Status: ✅ COMPLETED

### Date Completed: 2026-04-27

### Description
Created full queue management API for patient queue operations.

### API Endpoints Implemented

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/queue | receptionist, doctor | List queue |
| GET | /api/queue/:id | receptionist, doctor | Get specific entry |
| POST | /api/queue | receptionist | Add to queue |
| PATCH | /api/queue/:id/assign | receptionist | Assign doctor |
| PATCH | /api/queue/:id/call | doctor | Call patient |
| PATCH | /api/queue/:id/start | doctor | Start consultation |
| PATCH | /api/queue/:id/complete | doctor | Complete consultation |
| DELETE | /api/queue/:id | admin | Remove from queue |

### Files Created
- `backend/src/controllers/queueController.js` - Queue controller with all operations
- `backend/src/routes/queue.js` - Queue route definitions

### Files Modified
- `backend/src/server.js` - Mounted /api/queue route

### Implementation Details

**GET /api/queue**
- Returns queue list with patient and doctor details
- Calculates wait time
- Filters by doctor_id if doctor, shows all if admin/receptionist

**POST /api/queue**
- Prevents duplicate queue entries
- Auto-generates queue number
- Supports priority and chief complaint

**PATCH /api/queue/:id/complete**
- Sets consultation notes
- Marks queue entry as completed

---

## Phase 3: Backend Referral Routes

### Status: ✅ COMPLETED

### Date Completed: 2026-04-27

### Description
Created API endpoints for doctor referrals to lab, pharmacy, and nurse tasks.

### API Endpoints Implemented

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/referrals | lab, pharmacy | Get pending referrals |
| GET | /api/referrals/patient/:patient_id | doctor, lab, pharmacy, nurse | Get patient referrals |
| POST | /api/referrals/lab | doctor | Order lab test |
| POST | /api/referrals/pharmacy | doctor | Prescribe medicine |
| POST | /api/referrals/nurse | doctor | Assign nurse task |
| PATCH | /api/referrals/:id/complete | lab, pharmacy | Mark completed |

### Files Created
- `backend/src/controllers/referralController.js` - Referral controller
- `backend/src/routes/referrals.js` - Referral route definitions

### Files Modified
- `backend/src/server.js` - Mounted /api/referrals route

### Implementation Details

**POST /api/referrals/lab**
- Creates lab test order linked to queue
- Supports test type and priority

**POST /api/referrals/pharmacy**
- Creates prescription linked to queue
- Supports drug ID, quantity, dosage instructions

**POST /api/referrals/nurse**
- Creates nurse task linked to queue
- Supports task type, description, priority

---

## Phase 4: Backend Nurse Tasks Routes

### Status: ✅ COMPLETED

### Date Completed: 2026-04-27

### Description
Created API endpoints for nurses to view and complete assigned tasks.

### API Endpoints Implemented

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/nurse/tasks | nurse | List tasks |
| GET | /api/nurse/tasks/:id | nurse | Get task details |
| PATCH | /api/nurse/tasks/:id/start | nurse | Start task |
| PATCH | /api/nurse/tasks/:id/complete | nurse | Complete task |

### Files Created
- `backend/src/controllers/nurseController.js` - Nurse controller
- `backend/src/routes/nurse.js` - Nurse route definitions

### Files Modified
- `backend/src/server.js` - Mounted /api/nurse route

### Implementation Details

**GET /api/nurse/tasks**
- Returns tasks assigned to current nurse
- Shows all pending tasks if admin
- Filters by status (pending/in_progress/completed)

**PATCH /api/nurse/tasks/:id/start**
- Marks task as in_progress
- Assigns current nurse to task

**PATCH /api/nurse/tasks/:id/complete**
- Marks task as completed
- Records completion notesand timestamp

---

## Phase 5: Frontend Updates

### Status: ✅ COMPLETED

### Date Completed: 2026-04-27

### Description
Updated frontend to support nurse role and added Nurse Tasks page.

### Changes Made

#### 5.1 ROLE_ROUTES Updated
Added nurse role with access to dashboard and nurse-tasks.

#### 5.2 Sidebar Updated
Added Nurse Tasks menu item with icon and roles.

#### 5.3 App.jsx Updated
Added route for /nurse-tasks with ProtectedRoute for admin and nurse roles.

#### 5.4 NurseTasks Page Created
New file: `frontend/src/pages/NurseTasks.jsx`

#### 5.5 Queue Page Created
New file: `frontend/src/pages/Queue.jsx`
- Patient search and selection
- Doctor assignment
- Priority selection (normal/urgent)
- Chief complaint entry
- Queue list with wait times
- Call patient functionality
- Remove from queue

#### 5.6 DoctorQueue Page Created
New file: `frontend/src/pages/DoctorQueue.jsx`
- Waiting patient list
- Start consultation
- Consultation notes
- Order Lab Test modal
- Prescribe Medicine modal
- Assign Nurse Task modal
- Complete consultation

---

## Implementation Summary

### Backend Routes Completed
| Route | File | Status |
|-------|------|--------|
| /api/queue | routes/queue.js | ✅ |
| /api/referrals | routes/referrals.js | ✅ |
| /api/nurse | routes/nurse.js | ✅ |

### Backend Controllers Completed
| Controller | File | Status |
|------------|------|--------|
| queueController | queueController.js | ✅ |
| referralController | referralController.js | ✅ |
| nurseController | nurseController.js | ✅ |

### Database Tables Completed
| Table | Status |
|-------|--------|
| patient_queue | ✅ |
| nurse_tasks | ✅ |
| doctor_referrals | ✅ |

---

## Setup Instructions

### 1. Database Update
Run the updated schema to create new tables:
```bash
mysql -u root -p hms_db < backend/database/schema.sql
```

### 2. Backend Restart
Restart the backend server to apply new routes:
```bash
cd backend
npm start
```

### 3. Test New Endpoints

**Test Queue**
```bash
# Add to queue (receptionist)
curl -X POST http://localhost:5001/api/queue \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"patient_id": 1, "priority": "normal", "chief_complaint": "Checkup"}'
```

**Test Nurse Tasks**
```bash
# Get tasks (nurse)
curl http://localhost:5001/api/nurse/tasks \
  -H "Authorization: Bearer <token>"
```

---

## API Endpoints Quick Reference

### Queue
- `GET /api/queue` - List queue entries
- `POST /api/queue` - Add patient to queue
- `PATCH /api/queue/:id/complete` - Complete consultation

### Referrals
- `POST /api/referrals/lab` - Order lab test
- `POST /api/referrals/pharmacy` - Prescribe medicine
- `POST /api/referrals/nurse` - Assign nurse task

### Nurse Tasks
- `GET /api/nurse/tasks` - Get nurse tasks
- `PATCH /api/nurse/tasks/:id/complete` - Complete task

---

*Document updated: 2026-04-27*