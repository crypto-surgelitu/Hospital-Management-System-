# HMS Meru - Patient Workflow & Nurse Feature Implementation Plan

## Document Overview

This document outlines the comprehensive plan for implementing a new patient workflow system and nurse functionality in HMS Meru. The changes address the current disconnected workflow between departments and introduce proper patient queue management, nurse task handling, and a seamless referral system from doctors to lab, pharmacy, or nurse.

---

## 1. Executive Summary

### Current State
- Patients are registered directly without a queue system
- No formal way for doctors to refer patients to other departments
- No nurse role functionality exists in the system
- No tracking of patient consultation flow
- Disconnected operations between departments

### Proposed State
- Patients go through a structured queue system managed by receptionists
- Doctors see patients from their queue and complete consultations
- Doctors can formally refer patients to lab, pharmacy, or nurse
- Nurse role with task management capabilities
- Complete audit trail from patient arrival to discharge

### Benefits
1. **Reduced wait times** - Patients are properly queued and attended to in order
2. **Clear accountability** - Each patient assignment is tracked
3. **Better workflow** - Departments receive formal referrals from doctors
4. **Nurse integration** - Nurses have defined tasks from doctors
5. **Auditability** - Complete history of patient journey

---

## 2. Current System Architecture

### Existing User Roles
| Role | Permissions |
|------|------------|
| admin | Full system access, user management |
| doctor | View patients, appointments, lab requests |
| receptionist | Register patients, appointments, billing |
| lab | View and process lab requests |
| pharmacy | Manage inventory, dispense medications |

### Current Flow (Informal)
1. Receptionist registers patient
2. Receptionist creates appointment
3. Doctor sees appointment
4. Doctor examines patient
5. Doctor may order lab tests or prescribe medicine
6. Patient goes to lab or pharmacy independently
7. No tracking after leaving consultation

---

## 3. Proposed Patient Journey

### New End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                      PATIENT JOURNEY                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

   ┌──────────┐
   │ Patient  │
   │ Arrives  │
   └────┬─────┘
        │
        ▼
   ┌──────────────────┐
   │ Receptionist    │
   │ Registers    │
   │ Patient      │
   └────┬─────────┘
        │
        ▼
   ┌──────────────────┐
   │ Added to        │
   │ Waiting Queue   │
   └────┬─────────┘
        │
        ▼
   ┌───────────────────────────────┐
   │ Doctor Reviews Queue      │
   │ Calls Patient        │
   └────┬──────────────────┘
        │
        ▼
   ┌───────────────────────────────┐
   │ Doctor Examination     │
   │ + Notes              │
   └────┬──────────────────┘
        │
        ▼
   ┌───────────┴───────────┐
   │                    │
   ┈┴──────────────────┴┄
   │                     │
   ▼                     ▼                     ▼
┌────────┐          ┌──────────┐          ┌──────────┐
│  Lab   │          │ Pharmacy │          │  Nurse  │
│ Tests  │          │ Medicine │          │ Tasks   │
└───┬────┘          └────┬─────┘          └────┬────┘
    │                   │                   │
    └───────┬───────────┴───────┬───────────┘
            │               │
            ▼               ▼
      ┌──────────────────────────┐
      │ Consultation       │
      │ Complete        │
      │ Patient Exit   │
      └──────────────────────────┘
```

### Detailed Step Descriptions

#### Step 1: Patient Arrival
- Patient arrives at the hospital
- Patient may be new or returning
- Patient goes to reception desk

#### Step 2: Registration (Receptionist)
- If new patient: Full registration with personal details
- If returning: Search and verify existing record
- Receptionist adds patient to queue
- Patient receives queue number and waits

#### Step 3: Queue Management
- Patient appears in waiting queue
- Queue shows: patient name, assigned doctor, wait time, priority
- Status: waiting → in_progress → completed

#### Step 4: Doctor Consultation
- Doctor views their assigned queue
-Doctor calls next patient
-Doctor examines patient
-Doctor adds consultation notes
- Doctor decides: complete, refer to lab, refer to pharmacy, refer to nurse

#### Step 5: Referral (if applicable)
- Doctor selects referral type (lab/pharmacy/nurse)
- Doctor specifies items (tests, medicines, tasks)
- Referral is created and queued for respective department
- Patient notified of referral

#### Step 6: Department Processing
- **Lab**: Receives order, performs tests, enters results
- **Pharmacy**: Receives prescription, dispenses medicine
- **Nurse**: Receives task, completes task, marks done

#### Step 7: Completion
- All referrals completed
- Doctor marks consultation complete
- Patient exits queue with summary

---

## 4. Database Schema Changes

### 4.1 New Tables Required

#### Table: patient_queue
```sql
CREATE TABLE patient_queue (
    queue_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT,
    status ENUM('waiting', 'in_progress', 'completed', 'cancelled') DEFAULT 'waiting',
    priority ENUM('normal', 'urgent') DEFAULT 'normal',
    chief_complaint TEXT,
    notes TEXT,
    queue_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    called_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);
```

#### Table: nurse_tasks
```sql
CREATE TABLE nurse_tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    queue_id INT NOT NULL,
    patient_id INT NOT NULL,
    task_description TEXT NOT NULL,
    task_type ENUM('injection', 'vital_signs', 'wound_care', 'observation', 'dressing', 'other') DEFAULT 'other',
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    priority ENUM('normal', 'urgent') DEFAULT 'normal',
    assigned_by INT NOT NULL,
    assigned_nurse INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (queue_id) REFERENCES patient_queue(queue_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id),
    FOREIGN KEY (assigned_nurse) REFERENCES users(user_id)
);
```

#### Table: doctor_referrals
```sql
CREATE TABLE doctor_referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    queue_id INT NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    referral_type ENUM('lab', 'pharmacy', 'nurse') NOT NULL,
    item_id INT,
    item_description TEXT,
    quantity INT DEFAULT 1,
    dosage_instructions TEXT,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (queue_id) REFERENCES patient_queue(queue_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);
```

### 4.2 Modified Tables

#### Table: appointments (Add columns)
```sql
ALTER TABLE appointments
ADD COLUMN queue_id INT,
ADD COLUMN status ENUM('scheduled', 'queued', 'in_consultation', 'completed', 'cancelled') DEFAULT 'scheduled',
ADD FOREIGN KEY (queue_id) REFERENCES patient_queue(queue_id);
```

#### Table: users (Add nurse if not exists)
- Ensure 'nurse' is in the role enum/values already checked

---

## 5. API Endpoints

### 5.1 Queue Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|------------|--------|
| GET | /api/queue | List all patients in queue | Receptionist, Doctor, Admin |
| GET | /api/queue/:id | Get specific queue entry | Doctor, Admin |
| POST | /api/queue | Add patient to queue | Receptionist |
| PATCH | /api/queue/:id/assign | Assign doctor to patient | Receptionist, Admin |
| PATCH | /api/queue/:id/call | Call/notify patient | Doctor |
| PATCH | /api/queue/:id/start | Start consultation | Doctor |
| PATCH | /api/queue/:id/complete | Complete consultation | Doctor |
| DELETE | /api/queue/:id | Remove from queue | Admin |

#### Request/Response Examples

**POST /api/queue**
```json
// Request
{
    "patient_id": 123,
    "doctor_id": 45,
    "priority": "normal",
    "chief_complaint": "Chest pain and shortness of breath"
}
// Response
{
    "success": true,
    "queue": {
        "queue_id": 1,
        "patient_id": 123,
        "queue_number": 1,
        "status": "waiting"
    }
}
```

**GET /api/queue?doctor_id=45**
```json
{
    "success": true,
    "queue": [
        {
            "queue_id": 1,
            "patient": { "patient_id": 123, "full_name": "John Doe" },
            "queue_number": 1,
            "status": "waiting",
            "wait_time": "15 minutes"
        }
    ]
}
```

### 5.2 Nurse Tasks Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|------------|--------|
| GET | /api/nurse/tasks | List assigned tasks | Nurse |
| GET | /api/nurse/tasks/:id | Get task details | Nurse |
| PATCH | /api/nurse/tasks/:id/start | Start task | Nurse |
| PATCH | /api/nurse/tasks/:id/complete | Complete task | Nurse |

### 5.3 Doctor Referrals Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|------------|--------|
| POST | /api/referrals/lab | Order lab test | Doctor |
| POST | /api/referrals/pharmacy | Prescribe medicine | Doctor |
| POST | /api/referrals/nurse | Assign nurse task | Doctor |
| GET | /api/referrals/patient/:id | Get patient referrals | Doctor, Nurse, Lab, Pharmacy |
| PATCH | /api/referrals/:id/complete | Mark completed | Lab, Pharmacy |

#### Request Examples

**POST /api/referrals/lab**
```json
{
    "queue_id": 1,
    "patient_id": 123,
    "test_type": "Blood Count",
    "priority": "normal"
}
```

**POST /api/referrals/nurse**
```json
{
    "queue_id": 1,
    "patient_id": 123,
    "task_description": "Administer injection",
    "task_type": "injection",
    "priority": "urgent"
}
```

### 5.4 Dashboard Statistics (Modified)

Add to existing /api/admin/stats:
- Patients waiting in queue
- Patients in consultation
- Urgent cases count
- Pending nurse tasks
- Pending lab orders
- Pending pharmacy orders

---

## 6. User Roles & Permissions

### 6.1 Role Definitions

| Role | Description |
|------|------------|
| admin | Full system access, manages all users, view all reports |
| doctor | Examine patients, order tests, prescribe medicine, assign nurse tasks |
| receptionist | Register patients, manage queue, create appointments |
| nurse | View and complete assigned tasks |
| lab | View and process lab orders |
| pharmacy | View and dispense prescriptions |

### 6.2 Queue Permissions Matrix

| Permission | Admin | Doctor | Receptionist | Nurse | Lab | Pharmacy |
|-----------|-------|--------|-----------|-------|------|----------|
| View all queue | ✓ | - | ✓ | - | - | - |
| View assigned queue | ✓ | ✓ | - | - | - | - |
| Add to queue | ✓ | - | ✓ | - | - | - |
| Assign doctor | ✓ | - | ✓ | - | - | - |
| Start consultation | ✓ | ✓ | - | - | - | - |
| Complete consultation | ✓ | ✓ | - | - | - | - |
| Order lab test | ✓ | ✓ | - | - | - | - |
| Prescribe medicine | ✓ | ✓ | - | - | - | - |
| Assign nurse task | ✓ | ✓ | - | - | - | - |
| View nurse tasks | ✓ | - | - | ✓ | - | - |
| Complete nurse task | ✓ | - | - | ✓ | - | - |
| View pending lab | ✓ | - | - | - | ✓ | - |
| Complete lab order | ✓ | - | - | - | ✓ | - |
| View prescriptions | ✓ | - | - | - | - | ✓ |
| Dispense medicine | ✓ | - | - | - | - | ✓ |

---

## 7. Frontend Page Specifications

### 7.1 New Pages Required

#### Receptionist: Queue Management Page
**Purpose**: Add patients to queue and manage waiting list

**Features**:
- Search and select patient
- Select priority (normal/urgent)
- Enter chief complaint
- Assign to specific doctor or auto-assign
- View all waiting patients
- Reorder queue positions
- Cancel queue entries

**Layout**:
```
┌────────────────────────────────────────────────────────────────────┐
│  Patient Queue Management                    Date: 2026-04-27 │
├────────────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────┐    ┌───────────────────────────────┐   │
│  │ Add to Queue    │    │  Waiting List (5 patients)   │   │
│  │                 │    │                            │   │
│  │ Patient: [___]  │    │  #1 John Doe        Dr.O │   │
│  │ Doctor: [___]  │    │     Waiting: 15min  [Call] │   │
│  │ Priority: [___] │    │                            │   │
│  │ Complaint:[___] │    │  #2 Jane Smith     Dr.K │   │
│  │                 │    │     Waiting: 5min  [Call] │   │
│  │ [Add to Queue]│    │                            │   │
│  └──────────────────┘    │  #3...              │   │
│                              │                            │   │
│                              └───────────────────────────────┘   │
│                                                            │
│  Legend: 🔴 Waiting 🟡 In Progress 🟢 Completed            │
└────────────────────────────────────────────────────────────────────┘
```

#### Doctor: Queue Dashboard Page
**Purpose**: View assigned patients and conduct examination

**Features**:
- View patient's queue for assigned doctor
- See queue number and wait time
- View patient details and history
- View chief complaint
- Start consultation
- Add consultation notes
- Order lab tests
- Prescribe medicine
- Assign nurse task
- Complete consultation

**Layout**:
```
┌────────────────────────────────────────────────────────────────────┐
│  Dr. Ochieng - My Queue                    Sessions Today: 5          │
├────────────────────────────────────────────────────────────────────┤
│                                                            │
│  Active Patient: John Doe (#1)                    [End Consultation] │
│  ────────────────────────────────────────────────────────────  │
│                                                            │
│  Patient Info: Male, 45 years                                  │
│  Chief Complaint: Chest pain, shortness of breath               │
│                                                            │
│  ┌────────────────────────────────────────────────────┐       │
│  │ Consultation Notes                              │       │
│  │                                            │       │
│  │ [Text area for notes]                      │       │
│  │                                            │       │
│  └────────────────────────────────────────────────────┘       │
│                                                            │
│  ┌─────────────────┐  ┌────────────────┐  ┌─────────────┐ │
│  │  Order Lab   │  │  Prescribe  │  │ Nurse Task │ │
│  └─────────────────┘  └────────────────┘  └─────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────────────┘
```

#### Nurse: Task List Page
**Purpose**: View and complete assigned tasks

**Features**:
- View all pending tasks
- Filter by status (pending/in_progress/completed)
- View patient details
- View task description
- Start task
- Complete task with notes

**Layout**:
```
┌────────────────────────────────────────────────────────────────────┐
│  Nurse Tasks                  Pending: 3  Completed: 5      ���
├────────────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ 🔴 Task #1 - Injection                        │        │
│  │ Patient: Jane Smith, Ward 3                  │        │
│  │ Assigned by: Dr. Ochieng                 │        │
│  │ Priority: URGENT                         │        │
│  │ Task: Administer IV antibiotic            │        │
│  │ Created: 10:30 AM                      │        │
│  │                                     [Start] [Complete] │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ 🟡 Task #2 - Vital Signs                   │        │
│  │ Patient: John Doe                       │        │
│  │ ...                                         │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                            │
└────────────────────────────────────────────────────────────────────┘
```

### 7.2 Existing Pages to Modify

#### Dashboard Page
- Add queue statistics widgets
- Show urgent cases alert
- Show pending tasks for nurses
- Show pending lab/pharmacy orders

#### Appointments Page
- Integration with queue
- Show queue status
- Connect appointment to queue entry

#### Lab Page
- Show doctor-ordered lab requests
- Filter by referral source

#### Pharmacy Page
- Show doctor prescriptions
- Filter by referral source

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)
**Deliverables**:
1. Database schema changes implemented
2. Backend queue routes created
3. Backend referral routes created
4. Nurse tasks routes created

**Tasks**:
- [ ] Create patient_queue table
- [ ] Create nurse_tasks table
- [ ] Create doctor_referrals table
- [ ] Modify appointments table
- [ ] Add queue routes to backend
- [ ] Add referral routes to backend
- [ ] Add nurse tasks routes to backend
- [ ] Update auth middleware with nurse role
- [ ] Add input validation for new routes
- [ ] Add error handling

### Phase 2: Frontend Queue (Week 2)
**Deliverables**:
1. Receptionist queue management page
2. Doctor queue dashboard page
3. Updated dashboard with queue stats

**Tasks**:
- [ ] Create QueueContext for state management
- [ ] Build QueueManagement page for receptionist
- [ ] Build Doctor dashboard with queue view
- [ ] Add queue widgets to Dashboard
- [ ] Add queue filters and search
- [ ] Implement real-time queue updates

### Phase 3: Referral System (Week 3)
**Deliverables**:
1. Lab order modal for doctors
2. Prescription modal for doctors
3. Nurse task modal for doctors
4. Updated Lab page to show pending orders
5. Updated Pharmacy page to show pending prescriptions

**Tasks**:
- [ ] Create OrderLabModal component
- [ ] Create PrescribeModal component
- [ ] Create NurseTaskModal component
- [ ] Update Lab page with incoming orders
- [ ] Update Pharmacy page with incoming prescriptions
- [ ] Add notification system for new orders

### Phase 4: Nurse Functionality (Week 4)
**Deliverables**:
1. Nurse role added to system
2. Nurse tasks page
3. Task completion workflow

**Tasks**:
- [ ] Add nurse to VALID_ROLES
- [ ] Create NurseTasks page
- [ ] Implement task assignment workflow
- [ ] Add task status updates
- [ ] Add task completion notes
- [ ] Create task history view

### Phase 5: Testing & Refinement (Week 5)
**Deliverables**:
1. Complete end-to-end testing
2. Bug fixes
3. Performance optimization
4. User acceptance testing

**Tasks**:
- [ ] Unit testing for new endpoints
- [ ] Integration testing
- [ ] End-to-end workflow testing
- [ ] Role permission testing
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Documentation updates
- [ ] Training materials

---

## 9. Data Flow Diagrams

### 9.1 Patient Registration Flow
```
Receptionist Actions:
1. Search existing patient OR Register new patient
2. Select doctor (optional, can be auto-assign)
3. Set priority (normal/urgent)
4. Enter chief complaint
5. Click "Add to Queue"
6. System creates queue entry with queue_number
7. Patient appears in queue list
```

### 9.2 Doctor Consultation Flow
```
Doctor Actions:
1. View assigned queue
2. Select patient
3. Click "Start Consultation"
4. View patient details and history
5. Enter consultation notes
6. Decide: Complete / Refer to lab / Prescribe / Nurse task
7. If referral: Fill referral form
8. Click "Complete Consultation"
9. Queue status changed to completed
10. Referrals are queued for respective departments
```

### 9.3 Referral Flow
```
For Lab:
Doctor → Creates lab order → Lab technician sees order → Processes → Enters results → Completes

For Pharmacy:
Doctor → Creates prescription → Pharmacist sees prescription → Dispenses → Completes

For Nurse:
Doctor → Creates nurse task → Nurse sees task → Performs task → Completes
```

---

## 10. Edge Cases & Error Handling

### 10.1 Queue Management Edge Cases

| Scenario | Handling |
|----------|----------|
| Patient doesn't show up after call | Mark as no-show, move to end of queue |
| Doctor calls wrong patient | Allow re-call with new notification |
| Urgent patient arrives | Receptionist marks urgent, moves to front |
| Doctor goes on break | Queue reassigned or put on hold |
| Queue overflow | Add waiting time estimation |

### 10.2 Referral Edge Cases

| Scenario | Handling |
|----------|----------|
| Lab closed | Queue order for next day, notify patient |
| Medicine out of stock | Notify doctor, suggest alternative |
| Nurse busy with urgent task | Reassign to another nurse |
| Referral cancelled by doctor | Mark as cancelled, notify department |

### 10.3 Error Responses

| Error | Response |
|-------|----------|
| Patient already in queue | Return error, show queue entry |
| Invalid doctor assignment | Return error with valid doctors list |
| Insufficient stock (pharmacy) | Return error, allow partial dispense |
| Task already completed | Return error, show completion time |

---

## 11. Security Considerations

### 11.1 Authentication
- JWT tokens required for all queue operations
- Token includes role for authorization
- Session timeout: 8 hours (configurable)

### 11.2 Authorization
- Role-based access control on all endpoints
- Doctor can only see their assigned queue
- Nurse can only see their assigned tasks
- Receptionist can see all queued patients

### 11.3 Data Validation
- Patient ID existence check
- Doctor ID existence check
- Valid queue status transitions
- Prevent duplicate queue entries (one active per patient)

### 11.4 Audit Logging
- All queue actions logged
- All referral actions logged
- All task completions logged
- Timestamp tracking for all states

---

## 12. Reports & Analytics

### 12.1 Queue Reports
- Average wait time by hour
- Average consultation duration
- Patients served per doctor
- Peak hours analysis

### 12.2 Referral Reports
- Tests ordered per department
- Most common lab tests
- Medicine prescriptions by category
- Nurse tasks by type

### 12.3 Performance Metrics
- Queue throughput (patients/hour)
- Doctor utilization
- Referral completion rate
- Average consultation time

---

## 13. Future Enhancements (Post-MVP)

These items are out of scope for initial implementation but planned for future:

| Feature | Description |
|--------|-------------|
| SMS Notifications | Notify patient when called |
| Patient Portal | Patients view queue status |
| Real-time Updates | WebSocket for queue changes |
| Appointment Integration | Link queue with appointments |
| Insurance Billing | Insurance claim integration |
| Reporting Dashboard | Advanced analytics |
| Mobile App | Queue management on mobile |

---

## 14. Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-27 | 1.0.0 | Initial document created |

---

## 15. Approval

This document requires approval before implementation begins.

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Technical Lead | | | |
| Hospital Administrator | | | |

---

## Document Information

| Field | Value |
|-------|-------|
| Document Title | HMS Meru - Patient Workflow & Nurse Feature Implementation Plan |
| Version | 1.0.0 |
| Status | Draft for Review |
| Author | HMS Development Team |
| Created | 2026-04-27 |
| Last Updated | 2026-04-27 |
| Review Deadline | TBD |

---

*End of Document*