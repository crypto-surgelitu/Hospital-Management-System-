# HMS RBAC (Role-Based Access Control)

## Roles
| Role | Code | Description |
|------|------|-------------|
| Admin | admin | Full system access |
| Doctor | doctor | Examination, diagnosis, referrals |
| Nurse | nurse | Execute nurse tasks |
| Receptionist | receptionist | Patient registration, queue, billing |
| Lab | lab | Lab test processing |
| Pharmacy | pharmacy | Dispense medications |

## Route Permissions Matrix

### /api/auth
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| POST | /login | Public |
| POST | /refresh | Public |

### /api/patients
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| GET | / | admin, doctor, receptionist |
| GET | /search | admin, doctor, receptionist |
| GET | /:id | admin, doctor |
| GET | /:id/history | admin, doctor |
| POST | / | admin, receptionist, doctor |
| PUT | /:id | admin, receptionist |
| DELETE | /:id | admin |

### /api/appointments
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| GET | / | admin, doctor, receptionist |
| GET | /:id | admin, doctor, receptionist |
| POST | / | admin, receptionist, doctor |
| PATCH | /:id/status | admin, doctor |
| PATCH | /:id/notes | admin, doctor |

### /api/queue
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| GET | / | admin, doctor, receptionist |
| GET | /:id | admin, doctor, receptionist |
| POST | / | admin, receptionist |
| PATCH | /:id/assign | admin, receptionist |
| PATCH | /:id/call | admin, doctor |
| PATCH | /:id/start | admin, doctor |
| PATCH | /:id/complete | admin, doctor |
| DELETE | /:id | admin |

### /api/lab
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| GET | / | admin, doctor, lab |
| GET | /types | admin, doctor, lab |
| POST | / | admin, doctor |
| PATCH | /:id/specimen | admin, lab |
| PATCH | /:id/results | admin, lab |

### /api/pharmacy
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| GET | / | admin, pharmacy |
| GET | /drugs | admin, doctor, pharmacy |
| POST | /drugs | admin, pharmacy |
| PATCH | /drugs/:id/stock | admin, pharmacy |
| POST | /dispense | admin, pharmacy |

### /api/billing
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| GET | / | admin, doctor, receptionist |
| GET | /services | All authenticated |
| GET | /:id | admin, doctor, receptionist |
| POST | / | admin, doctor, receptionist |
| POST | /auto | admin, doctor, receptionist |
| POST | /:id/payment | admin, doctor, receptionist |

### /api/nurse
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| GET | / | admin, nurse |
| GET | /stats | admin, nurse |
| GET | /:id | admin, nurse |
| PATCH | /:id/start | admin, nurse |
| PATCH | /:id/complete | admin, nurse |

### /api/referrals
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| GET | / | admin, lab, pharmacy |
| GET | /patient/:id | admin, doctor, lab, pharmacy, nurse |
| POST | /lab | admin, doctor |
| POST | /pharmacy | admin, doctor |
| POST | /nurse | admin, doctor |
| PATCH | /:id/complete | admin, lab, pharmacy |

### /api/admin
| Method | Endpoint | Allowed Roles |
|-------|----------|--------------|
| GET | /users | admin |
| POST | /users | admin |
| PUT | /users/:id | admin |
| PATCH | /users/:id/toggle | admin |
| DELETE | /users/:id | admin |

## Frontend Navigation

| Route | Admin | Doctor | Nurse | Receptionist | Lab | Pharmacy |
|-------|-------|--------|-------|---------------|-----|----------|
| /dashboard | Yes | Yes | Yes | Yes | Yes | Yes |
| /queue | Yes | No | No | Yes | No | No |
| /doctor-queue | Yes | Yes | No | No | No | No |
| /patients | Yes | Yes | No | Yes | No | No |
| /appointments | Yes | Yes | No | Yes | No | No |
| /lab | Yes | Yes | No | No | Yes | No |
| /pharmacy | Yes | Yes | No | No | No | Yes |
| /billing | Yes | Yes | No | Yes | No | No |
| /nurse-tasks | Yes | No | Yes | No | No | No |
| /admin | Yes | No | No | No | No | No |

## Validation Rules

### Patient Creation
- Full name: Required
- Phone: Required, numeric, 7+ digits
- National ID: Optional, numeric if provided, 4+ digits
- Date of birth: Optional
- Gender: Optional

### User Creation
- Full name: Required
- Username: Required, unique
- Password: Required
- Role: Required, must be valid role
- Department: Optional