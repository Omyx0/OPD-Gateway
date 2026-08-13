# API ENDPOINTS AND DATABASE SCHEMA PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 10 / 14  
**Purpose:** Complete REST API map, PostgreSQL schema, request/response contracts, authorization, realtime events and frontend-backend data flow  
**Frontend:** React + Vite  
**Backend:** Node.js + Express  
**Database:** Supabase PostgreSQL + PostGIS  
**Authentication:** Supabase Auth  
**Security:** JWT + RBAC + RLS  
**Realtime:** Socket.io  
**AI:** Gemini API  
**ML:** Python FastAPI  
**Status:** API and database integration blueprint

---

# 1. ARCHITECTURE

```text
React
  ↓
Supabase Auth
  ↓
JWT
  ↓
Express /api/v1
  ↓
Authentication
  ↓
RBAC
  ↓
Validation
  ↓
Service Layer
  ↓
Supabase PostgreSQL
  │
  └── PostGIS

AI:
Express → Gemini
Express → Python ML

Realtime:
Express → Socket.io → Authorized clients
```

The frontend never directly controls authoritative patient, visit, triage or queue state.

---

# 2. API BASE URL

Development:

```text
http://localhost:5000/api/v1
```

Production:

```text
https://<backend-domain>/api/v1
```

All protected routes require:

```http
Authorization: Bearer <supabase-access-token>
```

---

# 3. STANDARD RESPONSE FORMAT

## Success

```json
{
  "success": true,
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request."
  }
}
```

Do not expose:

- stack traces
- SQL errors
- secrets
- internal service details

---

# 4. AUTHENTICATION ENDPOINTS

Supabase Auth handles the actual login/password operations.

The Express backend does not create a duplicate password authentication system.

Potential application endpoints:

```http
GET /api/v1/auth/me
POST /api/v1/auth/logout
```

## GET /auth/me

Purpose:

Return application profile and role information for the authenticated user.

Flow:

```text
JWT
 ↓
Verify
 ↓
Find profile
 ↓
Find role
 ↓
Return user context
```

Example:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "doctor@example.com",
    "name": "Dr. Sharma",
    "role": "DOCTOR",
    "isActive": true
  }
}
```

---

# 5. PROFILE TABLE

```sql
profiles
--------
id UUID PRIMARY KEY
full_name TEXT NOT NULL
email TEXT
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

`id` maps to the authenticated Supabase user ID.

Do not store passwords here.

---

# 6. USER ROLES TABLE

```sql
user_roles
----------
id UUID PRIMARY KEY
user_id UUID REFERENCES profiles(id)
role TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
```

Recommended roles:

```text
STAFF
DOCTOR
ADMIN
```

Add a uniqueness constraint on:

```text
user_id + role
```

if multiple roles are supported.

---

# 7. PATIENT API

```http
POST   /patients
GET    /patients
GET    /patients/:id
PATCH  /patients/:id
```

Permissions:

```text
POST:
STAFF, DOCTOR, ADMIN

GET:
STAFF, DOCTOR, ADMIN

PATCH:
STAFF, DOCTOR, ADMIN
```

Actual row access must additionally respect RLS/business scope.

---

# 8. CREATE PATIENT

```http
POST /api/v1/patients
```

Request:

```json
{
  "fullName": "Rahul Sharma",
  "dateOfBirth": "2001-04-12",
  "gender": "MALE",
  "mobile": "9999999999",
  "preferredLanguage": "hi",
  "address": {
    "city": "Gwalior"
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientCode": "P-10024",
    "fullName": "Rahul Sharma"
  }
}
```

---

# 9. PATIENT TABLE

```sql
patients
--------
id UUID PRIMARY KEY
patient_code TEXT UNIQUE NOT NULL
full_name TEXT NOT NULL
date_of_birth DATE
gender TEXT
mobile TEXT
preferred_language TEXT
address JSONB
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

Use generated UUIDs.

Do not use government IDs as primary keys.

---

# 10. PATIENT SEARCH

```http
GET /api/v1/patients?search=rahul&page=1&limit=20
```

Backend should:

- validate query
- normalize search
- apply authorization
- paginate
- return only required fields

Example:

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

Do not return complete medical history in a patient search response.

---

# 11. VISIT API

```http
POST  /visits
GET   /visits/:id
GET   /patients/:id/visits
PATCH /visits/:id/status
```

---

# 12. VISIT TABLE

```sql
visits
------
id UUID PRIMARY KEY
patient_id UUID REFERENCES patients(id)
department_id UUID REFERENCES departments(id)
visit_type TEXT DEFAULT 'OPD'
status TEXT NOT NULL
source TEXT
registered_at TIMESTAMPTZ DEFAULT now()
completed_at TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

Statuses:

```text
REGISTERED
TRIAGE_PENDING
WAITING
CALLED
IN_PROGRESS
COMPLETED
CANCELLED
```

---

# 13. CREATE VISIT

```http
POST /api/v1/visits
```

Request:

```json
{
  "patientId": "uuid",
  "departmentId": "uuid",
  "visitType": "OPD",
  "source": "KIOSK"
}
```

Backend:

```text
Validate patient
 ↓
Validate department
 ↓
Create visit
 ↓
Set TRIAGE_PENDING
 ↓
Audit log
```

---

# 14. SYMPTOM API

```http
POST /visits/:visitId/symptoms
GET  /visits/:visitId/symptoms
PATCH /symptoms/:id
```

---

# 15. SYMPTOMS TABLE

```sql
symptoms
--------
id UUID PRIMARY KEY
visit_id UUID REFERENCES visits(id)
symptom_name TEXT NOT NULL
duration TEXT
severity TEXT
patient_description TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

---

# 16. TRIAGE API

```http
POST /triage/session
POST /triage/extract
POST /triage/assess
GET  /triage/:visitId
```

The triage service orchestrates:

```text
Patient input
 ↓
Gemini
 ↓
Structured symptoms
 ↓
Validation
 ↓
Safety rules
 ↓
ML model
 ↓
Confidence
 ↓
Final recommendation
```

---

# 17. TRIAGE SESSION

```http
POST /api/v1/triage/session
```

Request:

```json
{
  "visitId": "uuid",
  "language": "hi"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "visitId": "uuid",
    "status": "ACTIVE"
  }
}
```

A session ID allows the backend to associate conversational interactions with the visit without trusting arbitrary client identifiers.

---

# 18. TRIAGE EXTRACTION

```http
POST /api/v1/triage/extract
```

Request:

```json
{
  "sessionId": "uuid",
  "message": "Mujhe do din se bukhar hai aur weakness hai."
}
```

Backend:

```text
Authenticate
 ↓
Check visit/session access
 ↓
Validate message
 ↓
Gemini
 ↓
Validate JSON
 ↓
Store structured symptom data
```

Response:

```json
{
  "success": true,
  "data": {
    "symptoms": [
      {
        "name": "fever",
        "duration": "2 days"
      },
      {
        "name": "weakness",
        "duration": "2 days"
      }
    ],
    "redFlags": [],
    "missingInformation": [
      "temperature"
    ]
  }
}
```

---

# 19. TRIAGE ASSESSMENT

```http
POST /api/v1/triage/assess
```

Request:

```json
{
  "visitId": "uuid"
}
```

Backend:

```text
Load visit
 ↓
Load symptoms
 ↓
Run safety rules
 ↓
Call ML service
 ↓
Validate result
 ↓
Apply confidence rule
 ↓
Create assessment
 ↓
Create/update queue ticket
 ↓
Audit
 ↓
Socket event
```

---

# 20. TRIAGE ASSESSMENTS TABLE

```sql
triage_assessments
------------------
id UUID PRIMARY KEY
visit_id UUID REFERENCES visits(id)
urgency TEXT NOT NULL
confidence NUMERIC
recommended_action TEXT
red_flags JSONB
structured_result JSONB
model_name TEXT
model_version TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

---

# 21. TRIAGE RESULT

Example:

```json
{
  "priority": "YELLOW",
  "confidence": 0.84,
  "redFlags": [],
  "recommendedAction": "PRIORITY_REVIEW",
  "modelVersion": "triage-v1"
}
```

The confidence is an ML score, not medical certainty.

---

# 22. QUEUE API

```http
POST  /queue/tickets
GET   /queue
GET   /queue/:id
PATCH /queue/:id/status
PATCH /queue/:id/assign
POST  /queue/:id/call
```

---

# 23. QUEUE TABLE

```sql
queue_tickets
-------------
id UUID PRIMARY KEY
visit_id UUID REFERENCES visits(id)
department_id UUID REFERENCES departments(id)
token TEXT NOT NULL
priority TEXT NOT NULL
status TEXT NOT NULL
arrival_time TIMESTAMPTZ DEFAULT now()
called_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
assigned_doctor_id UUID
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

---

# 24. QUEUE PRIORITY

Project categories:

```text
RED
YELLOW
GREEN
```

The backend calculates queue ordering.

The frontend does not determine authoritative position.

---

# 25. GET QUEUE

```http
GET /api/v1/queue?departmentId=uuid&status=WAITING
```

Backend:

```text
Authenticate
 ↓
RBAC
 ↓
Validate department
 ↓
Check department access
 ↓
Query PostgreSQL
 ↓
Apply authoritative ordering
 ↓
Return queue
```

---

# 26. CALL PATIENT

```http
POST /api/v1/queue/:id/call
```

Backend:

```text
Authorize
 ↓
Validate ticket state
 ↓
Update queue status
 ↓
Set called_at
 ↓
Audit
 ↓
Emit Socket.io event
```

Event:

```text
queue:patient-called
```

---

# 27. ALERT API

```http
GET  /alerts
POST /alerts
POST /alerts/:id/acknowledge
PATCH /alerts/:id/status
```

Only appropriate roles can acknowledge/resolve alerts.

---

# 28. ALERTS TABLE

```sql
alerts
------
id UUID PRIMARY KEY
visit_id UUID
queue_ticket_id UUID
type TEXT
severity TEXT
message TEXT
status TEXT
acknowledged_by UUID
acknowledged_at TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
```

---

# 29. DEPARTMENT API

```http
GET   /departments
GET   /departments/:id
POST  /departments
PATCH /departments/:id
```

Creation/update:

```text
ADMIN only
```

Read access:

```text
STAFF
DOCTOR
ADMIN
```

---

# 30. DEPARTMENTS TABLE

```sql
departments
-----------
id UUID PRIMARY KEY
hospital_id UUID
name TEXT NOT NULL
code TEXT UNIQUE NOT NULL
is_active BOOLEAN DEFAULT TRUE
location GEOGRAPHY(POINT, 4326)
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

---

# 31. HOSPITALS TABLE

```sql
hospitals
---------
id UUID PRIMARY KEY
name TEXT NOT NULL
address JSONB
location GEOGRAPHY(POINT, 4326)
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

PostGIS is used for hospital/department location features.

Do not store continuous patient GPS.

---

# 32. DOCTOR API

```http
GET   /doctors
GET   /doctors/:id
POST  /doctors
PATCH /doctors/:id
PATCH /doctors/:id/status
```

Administrative creation/update requires:

```text
ADMIN
```

---

# 33. DOCTORS TABLE

```sql
doctors
-------
id UUID PRIMARY KEY
profile_id UUID
department_id UUID
specialization TEXT
status TEXT
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

---

# 34. NOTIFICATION API

```http
GET   /notifications
PATCH /notifications/:id/read
POST  /notifications/read-all
```

---

# 35. NOTIFICATIONS TABLE

```sql
notifications
-------------
id UUID PRIMARY KEY
recipient_user_id UUID
type TEXT
title TEXT
message TEXT
is_read BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ DEFAULT now()
```

Use in-app notifications initially.

---

# 36. AUDIT LOG API

Audit logs should normally **not** be directly writable by frontend users.

They are generated by backend services.

```text
User operation
 ↓
Service
 ↓
Database action
 ↓
Audit log
```

Table:

```sql
audit_logs
----------
id UUID PRIMARY KEY
actor_user_id UUID
action TEXT
entity_type TEXT
entity_id UUID
metadata JSONB
created_at TIMESTAMPTZ DEFAULT now()
```

---

# 37. AI INTERACTION TABLE

```sql
ai_interactions
---------------
id UUID PRIMARY KEY
visit_id UUID
provider TEXT
model_name TEXT
operation TEXT
input_type TEXT
success BOOLEAN
latency_ms INTEGER
created_at TIMESTAMPTZ DEFAULT now()
```

Store metadata rather than unnecessary raw patient conversations.

---

# 38. ANALYTICS API

```http
GET /analytics/overview
GET /analytics/queue
GET /analytics/triage
```

Possible outputs:

```text
Total patients
Total visits
Average waiting time
Queue by department
Triage distribution
Emergency alerts
Completed visits
```

Prefer aggregated results.

---

# 39. DATABASE RELATIONSHIP MAP

```text
profiles
   │
   └── user_roles

hospitals
   │
   └── departments
          │
          └── doctors

patients
   │
   └── visits
         │
         ├── symptoms
         │
         ├── triage_assessments
         │
         └── queue_tickets
                 │
                 └── alerts

profiles
   ├── notifications
   └── audit_logs

visits
   └── ai_interactions
```

---

# 40. FOREIGN KEY RULES

Use foreign keys wherever a relationship must be enforced.

Examples:

```text
visits.patient_id
→ patients.id

visits.department_id
→ departments.id

symptoms.visit_id
→ visits.id

triage_assessments.visit_id
→ visits.id

queue_tickets.visit_id
→ visits.id

queue_tickets.department_id
→ departments.id
```

Avoid orphan records.

---

# 41. DELETE STRATEGY

Healthcare-related records should not be casually deleted.

Prefer controlled status transitions:

```text
ACTIVE
COMPLETED
CANCELLED
ARCHIVED
```

Hard deletion should require explicit policy and authorization.

For the semester MVP, avoid implementing destructive patient deletion unless genuinely required.

---

# 42. PAGINATION

All list APIs should support pagination.

Example:

```http
GET /patients?page=1&limit=20
```

Set a maximum:

```text
limit <= 100
```

Do not allow:

```text
limit=1000000
```

---

# 43. SEARCH

Search should be validated and bounded.

Example:

```http
GET /patients?search=rahul
```

Do not expose unrestricted SQL-like filtering from query parameters.

---

# 44. TRANSACTIONAL WORKFLOW

For a completed triage-to-queue operation:

```text
Triage assessment
       ↓
Queue ticket
       ↓
Visit status
       ↓
Audit log
```

If these operations must be atomic:

```text
BEGIN
 ↓
write triage
 ↓
write queue
 ↓
update visit
 ↓
write audit
 ↓
COMMIT
```

If critical failure:

```text
ROLLBACK
```

---

# 45. SOCKET.IO EVENT MAP

## Queue

```text
queue:ticket-created
queue:updated
queue:patient-called
queue:completed
```

## Alerts

```text
alert:created
alert:acknowledged
alert:resolved
```

## Visit

```text
visit:updated
```

## Doctor

```text
doctor:status-changed
```

---

# 46. SOCKET EVENT FLOW

```text
Client request
 ↓
Protected REST API
 ↓
RBAC
 ↓
Database change
 ↓
Audit
 ↓
Socket.io emit
 ↓
Authorized clients
```

The client never creates authoritative state merely by emitting a socket event.

---

# 47. FRONTEND → BACKEND FLOW

## Patient Registration

```text
React
 ↓
POST /patients
 ↓
Express
 ↓
Validation
 ↓
PostgreSQL
 ↓
Patient code
 ↓
React
```

## Triage

```text
React
 ↓
POST /triage/extract
 ↓
Gemini
 ↓
Structured symptoms
 ↓
React
```

## Final assessment

```text
React
 ↓
POST /triage/assess
 ↓
Safety rules
 ↓
Python ML
 ↓
PostgreSQL
 ↓
Queue
 ↓
Socket.io
 ↓
Dashboard
```

---

# 48. STAFF DASHBOARD FLOW

```text
Login
 ↓
Supabase Auth
 ↓
JWT
 ↓
GET /auth/me
 ↓
Role
 ↓
Dashboard
 ↓
GET /queue
 ↓
Socket.io connection
 ↓
Live updates
```

---

# 49. ADMIN FLOW

```text
Admin Login
 ↓
JWT
 ↓
RBAC
 ↓
Admin Dashboard
 ↓
Manage:
   users
   doctors
   departments
   analytics
   system settings
```

Every mutation is audited.

---

# 50. API PERMISSION SUMMARY

| Endpoint group | STAFF | DOCTOR | ADMIN |
|---|---:|---:|---:|
| Patients | ✓ | ✓ | ✓ |
| Visits | ✓ | ✓ | ✓ |
| Symptoms | ✓ | ✓ | ✓ |
| Triage | ✓ | ✓ | ✓ |
| Queue | ✓ | ✓ | ✓ |
| Alerts | ✓ | ✓ | ✓ |
| Departments read | ✓ | ✓ | ✓ |
| Departments manage | ✗ | ✗ | ✓ |
| Doctors read | ✓ | ✓ | ✓ |
| Doctors manage | ✗ | ✗ | ✓ |
| Analytics | Limited | Limited | ✓ |
| Users manage | ✗ | ✗ | ✓ |

Actual row-level scope is additionally controlled by RLS and backend business rules.

---

# 51. POSTGIS API EXAMPLE

Future endpoint:

```http
GET /api/v1/hospitals/nearby?lat=26.2183&lng=78.1828&radius=5000
```

Backend:

```text
Validate coordinates
 ↓
PostGIS ST_DWithin
 ↓
Find nearby hospitals
 ↓
Calculate distance
 ↓
Return results
```

This is optional for the core OPD MVP.

---

# 52. API ERROR CASES

Example:

```text
Missing token
→ 401

Wrong role
→ 403

Invalid UUID
→ 400

Unknown patient
→ 404

Duplicate patient conflict
→ 409

AI service unavailable
→ 503 / controlled fallback

Rate limit exceeded
→ 429
```

---

# 53. DATABASE INDEXES

Recommended:

```text
patients(patient_code)
patients(mobile)

visits(patient_id)
visits(department_id, status)
visits(created_at)

symptoms(visit_id)

triage_assessments(visit_id)

queue_tickets(department_id, status, priority)
queue_tickets(department_id, status, arrival_time)

alerts(status, created_at)

notifications(recipient_user_id, is_read)

audit_logs(actor_user_id, created_at)
ai_interactions(visit_id)

hospitals.location
departments.location
```

Use GiST indexes for PostGIS location fields.

---

# 54. API SECURITY BOUNDARY

Every protected request:

```text
JWT
 ↓
Authentication
 ↓
RBAC
 ↓
Resource-level authorization
 ↓
Validation
 ↓
Service
 ↓
Database/RLS
```

This prevents:

```text
"I have a valid login"
```

from automatically meaning:

```text
"I can access every patient."
```

---

# 55. FRONTEND CONTRACT

The frontend should consume typed API contracts.

Recommended:

```text
types/
api/
services/
```

Example:

```text
patientService.createPatient()
queueService.getQueue()
triageService.assessVisit()
alertService.acknowledgeAlert()
```

Do not scatter raw `fetch()` calls throughout components.

---

# 56. API SERVICE LAYER

Frontend:

```text
components
 ↓
hooks
 ↓
service layer
 ↓
API
```

Example:

```text
useQueue()
 ↓
queueService.getQueue()
 ↓
GET /queue
```

This keeps UI code independent from backend URL details.

---

# 57. BACKEND SERVICE LAYER

Backend:

```text
route
 ↓
controller
 ↓
service
 ↓
database/external service
```

Do not put all business logic directly in Express route handlers.

---

# 58. API TESTING

Create Postman/Thunder Client collection covering:

```text
Auth
Patients
Visits
Triage
Queue
Alerts
Doctors
Departments
Analytics
```

Test each endpoint with:

```text
No token
STAFF
DOCTOR
ADMIN
Invalid data
Valid data
```

---

# 59. OPENAPI DOCUMENTATION

After the API stabilizes, document:

```text
/api/v1
```

using OpenAPI/Swagger.

Each endpoint should document:

- Authentication
- Role/permission
- Parameters
- Request body
- Response
- Error codes

This becomes useful for the semester report and viva.

---

# 60. FINAL API ARCHITECTURE

```text
                      REACT
                        │
                 Supabase Auth
                        │
                       JWT
                        │
                        ▼
                EXPRESS /api/v1
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
   Authentication      RBAC          Validation
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                    SERVICES
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
   PostgreSQL         Gemini          Python ML
    + PostGIS           │                │
       │                └──────┬─────────┘
       │                       ▼
       │                  Triage result
       │
       ▼
   Transaction
       │
       ▼
    Audit log
       │
       ▼
    Socket.io
       │
       ▼
 Authorized dashboards
```

---

# 61. FINAL API PRINCIPLE

The system follows one authoritative direction:

```text
Frontend requests
      ↓
Backend validates
      ↓
Backend authorizes
      ↓
Backend executes business logic
      ↓
PostgreSQL stores state
      ↓
Backend emits realtime event
      ↓
Frontend updates UI
```

The frontend never becomes the source of truth for:

- authentication
- authorization
- queue position
- triage priority
- patient access
- alert state
- doctor assignment

This contract should be followed for all subsequent implementation.
