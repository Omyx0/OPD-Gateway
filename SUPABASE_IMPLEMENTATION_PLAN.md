# SUPABASE IMPLEMENTATION PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 11 / 14  
**Purpose:** Complete Supabase setup and implementation plan  
**Database:** Supabase PostgreSQL  
**Geospatial:** PostGIS  
**Authentication:** Supabase Auth  
**Authorization:** Backend RBAC + PostgreSQL RLS  
**Backend:** Node.js + Express  
**Frontend:** React + Vite  
**Realtime:** Socket.io as the primary application realtime layer  
**Storage:** Supabase Storage only where genuinely required  
**Implementation environment:** Google Antigravity

---

# 1. FINAL SUPABASE ROLE

Supabase is the primary backend platform for:

```text
Authentication
+
PostgreSQL database
+
PostGIS
+
Row Level Security
+
Database migrations
+
Optional Storage
```

It is NOT responsible for:

```text
Frontend generation
Business logic
Gemini orchestration
ML training
ML inference
Application RBAC logic
Socket.io application events
```

Those responsibilities remain with our application backend.

---

# 2. FINAL ARCHITECTURE

```text
                    REACT FRONTEND
                          │
                          ▼
                    SUPABASE AUTH
                          │
                         JWT
                          │
                          ▼
                    EXPRESS BACKEND
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
           RBAC       Business       AI/ML
                         Logic
             │
             ▼
       SUPABASE POSTGRES
             │
       ┌─────┴──────┐
       ▼            ▼
     RLS          PostGIS
             │
             ▼
        DATABASE STATE
             │
             ▼
         SOCKET.IO
```

---

# 3. CREATE SUPABASE PROJECT

Create one Supabase project for development.

Recommended project naming:

```text
smart-opd-dev
```

Production should eventually use a separate project/environment rather than mixing production and development data.

---

# 4. SAVE PROJECT CREDENTIALS

From Supabase project settings, obtain the credentials required by the architecture.

Backend:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
```

Frontend, if the Supabase browser client is used:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Important:

```text
SUPABASE_SERVICE_ROLE_KEY
```

must NEVER be exposed to the frontend.

---

# 5. ENVIRONMENT VARIABLE POLICY

Create:

```text
.env
.env.example
```

`.env`:

```text
REAL SECRETS
```

`.env.example`:

```text
PLACEHOLDERS ONLY
```

Git:

```text
.env
.env.local
.env.production
```

must be ignored.

---

# 6. SUPABASE AUTH

Enable the authentication method required for the MVP.

Recommended:

```text
Email + Password
```

Optional:

```text
Google OAuth
```

Only add OAuth if it provides a real benefit.

The semester project does not need multiple authentication providers unless required.

---

# 7. AUTHENTICATION FLOW

```text
User
 ↓
React login
 ↓
Supabase Auth
 ↓
Session
 ↓
JWT
 ↓
React
 ↓
Express
 ↓
JWT verification
 ↓
Application profile
 ↓
RBAC
```

Supabase Auth owns passwords.

Do not duplicate password hashes in our own `profiles` table.

---

# 8. AUTH USER VS APPLICATION PROFILE

Supabase maintains the authentication identity.

Our PostgreSQL `profiles` table maintains application information.

```text
Supabase Auth user
        │
        │ same UUID
        ▼
profiles
```

Example:

```text
auth.users.id
      =
profiles.id
```

The application profile may contain:

```text
full_name
email
is_active
```

---

# 9. PROFILE CREATION

When a new authorized staff account is created:

```text
Supabase Auth user
        ↓
profile creation
        ↓
role assignment
```

Use a controlled backend/admin workflow.

Do not allow a normal user to choose:

```text
role = ADMIN
```

during signup.

---

# 10. USER ROLE STORAGE

Recommended:

```sql
user_roles
```

Example:

```text
id
user_id
role
created_at
```

Roles:

```text
STAFF
DOCTOR
ADMIN
```

The role should be controlled by the application/admin workflow.

---

# 11. POSTGRESQL EXTENSIONS

Enable the extensions actually required by the project.

Primary:

```text
postgis
```

Optional extensions should only be enabled if there is a concrete requirement.

Do not enable random extensions simply because they are available.

---

# 12. POSTGIS PURPOSE

PostGIS is included for location-aware functionality such as:

```text
Hospital location
Department location
Nearby facility search
Distance calculation
```

It is NOT required for:

```text
patient tracking
continuous GPS
live patient location
```

Avoid unnecessary location collection.

---

# 13. HOSPITAL LOCATION

Use:

```sql
location geography(Point, 4326)
```

Example conceptual point:

```text
longitude
latitude
```

Create a spatial index:

```sql
GIST(location)
```

---

# 14. DEPARTMENT LOCATION

Departments can optionally have:

```text
location geography(Point, 4326)
```

This allows future:

```text
nearby department
hospital navigation
distance calculation
```

For the MVP, this can remain optional.

---

# 15. DATABASE SCHEMA ORDER

Create tables in dependency order:

```text
1. profiles
2. user_roles
3. hospitals
4. departments
5. doctors
6. patients
7. visits
8. symptoms
9. triage_assessments
10. queue_tickets
11. alerts
12. notifications
13. audit_logs
14. ai_interactions
```

This minimizes foreign-key creation problems.

---

# 16. PROFILES TABLE

Conceptual schema:

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

The ID references the authenticated Supabase user.

---

# 17. USER_ROLES TABLE

```sql
user_roles
----------
id UUID PRIMARY KEY
user_id UUID NOT NULL
role TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
```

Recommended constraint:

```text
role ∈ STAFF, DOCTOR, ADMIN
```

If multiple roles are allowed, use:

```text
UNIQUE(user_id, role)
```

---

# 18. HOSPITALS TABLE

```sql
hospitals
---------
id UUID PRIMARY KEY
name TEXT NOT NULL
address JSONB
location geography(Point, 4326)
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

---

# 19. DEPARTMENTS TABLE

```sql
departments
-----------
id UUID PRIMARY KEY
hospital_id UUID NOT NULL
name TEXT NOT NULL
code TEXT UNIQUE NOT NULL
location geography(Point, 4326)
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

---

# 20. DOCTORS TABLE

```sql
doctors
-------
id UUID PRIMARY KEY
profile_id UUID NOT NULL
department_id UUID NOT NULL
specialization TEXT
status TEXT DEFAULT 'AVAILABLE'
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

A doctor should correspond to an authenticated staff profile.

---

# 21. PATIENTS TABLE

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

Do not store:

```text
password
```

in this table.

---

# 22. VISITS TABLE

```sql
visits
------
id UUID PRIMARY KEY
patient_id UUID NOT NULL
department_id UUID NOT NULL
visit_type TEXT DEFAULT 'OPD'
status TEXT NOT NULL
source TEXT
registered_at TIMESTAMPTZ DEFAULT now()
completed_at TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

Suggested status:

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

# 23. SYMPTOMS TABLE

```sql
symptoms
--------
id UUID PRIMARY KEY
visit_id UUID NOT NULL
symptom_name TEXT NOT NULL
duration TEXT
severity TEXT
patient_description TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

Do not automatically store every conversational message as a permanent medical record.

---

# 24. TRIAGE_ASSESSMENTS TABLE

```sql
triage_assessments
------------------
id UUID PRIMARY KEY
visit_id UUID NOT NULL
urgency TEXT NOT NULL
confidence NUMERIC
recommended_action TEXT
red_flags JSONB
structured_result JSONB
model_name TEXT
model_version TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

This stores the structured result needed by the OPD workflow.

---

# 25. QUEUE_TICKETS TABLE

```sql
queue_tickets
-------------
id UUID PRIMARY KEY
visit_id UUID NOT NULL
department_id UUID NOT NULL
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

The backend owns queue state.

---

# 26. ALERTS TABLE

```sql
alerts
------
id UUID PRIMARY KEY
visit_id UUID
queue_ticket_id UUID
type TEXT NOT NULL
severity TEXT NOT NULL
message TEXT NOT NULL
status TEXT NOT NULL
acknowledged_by UUID
acknowledged_at TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
```

---

# 27. NOTIFICATIONS TABLE

```sql
notifications
-------------
id UUID PRIMARY KEY
recipient_user_id UUID NOT NULL
type TEXT NOT NULL
title TEXT NOT NULL
message TEXT NOT NULL
is_read BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ DEFAULT now()
```

---

# 28. AUDIT_LOGS TABLE

```sql
audit_logs
----------
id UUID PRIMARY KEY
actor_user_id UUID
action TEXT NOT NULL
entity_type TEXT
entity_id UUID
metadata JSONB
created_at TIMESTAMPTZ DEFAULT now()
```

Audit records should be generated by backend operations.

---

# 29. AI_INTERACTIONS TABLE

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

Avoid storing unnecessary raw patient conversations.

---

# 30. FOREIGN KEYS

Create relationships:

```text
user_roles.user_id
→ profiles.id

departments.hospital_id
→ hospitals.id

doctors.profile_id
→ profiles.id

doctors.department_id
→ departments.id

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

queue_tickets.assigned_doctor_id
→ doctors.id

notifications.recipient_user_id
→ profiles.id
```

---

# 31. CONSTRAINTS

Use database constraints wherever possible.

Examples:

```text
NOT NULL
UNIQUE
CHECK
FOREIGN KEY
```

Examples of controlled values:

```text
priority ∈ RED, YELLOW, GREEN
```

```text
role ∈ STAFF, DOCTOR, ADMIN
```

```text
visit status ∈ defined workflow states
```

Database constraints reduce invalid states.

---

# 32. INDEXES

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
```

For PostGIS:

```text
GIST(hospitals.location)
GIST(departments.location)
```

---

# 33. ROW LEVEL SECURITY

Enable RLS on all application tables containing protected data.

Examples:

```text
profiles
user_roles
patients
visits
symptoms
triage_assessments
queue_tickets
alerts
notifications
audit_logs
ai_interactions
```

Do not rely only on frontend restrictions.

---

# 34. RLS + BACKEND RBAC

Security is layered:

```text
Frontend
   ↓
JWT
   ↓
Express RBAC
   ↓
Business authorization
   ↓
PostgreSQL RLS
```

RBAC answers:

```text
What can this role do?
```

RLS answers:

```text
Which rows can this authenticated context access?
```

---

# 35. RLS POLICY DESIGN

Do not start with:

```text
allow all authenticated users to everything
```

Instead define policies according to actual workflow.

Examples:

```text
Staff:
read/write operational records within allowed scope

Doctor:
read relevant patient/visit/queue information

Admin:
administrative scope
```

The exact SQL policies should be written after the department/resource ownership model is finalized.

---

# 36. IMPORTANT SERVICE-ROLE RULE

The backend may use:

```text
SUPABASE_SERVICE_ROLE_KEY
```

for controlled privileged operations.

However, because service-role access bypasses RLS:

```text
Every service-role query must have explicit authorization in application code.
```

Never assume RLS will protect a service-role query.

---

# 37. MIGRATION STRATEGY

Do not manually modify production tables randomly through the dashboard once development starts.

Maintain versioned migrations:

```text
supabase/
└── migrations/
    ├── 001_extensions.sql
    ├── 002_profiles.sql
    ├── 003_roles.sql
    ├── 004_hospitals_departments.sql
    ├── 005_doctors.sql
    ├── 006_patients_visits.sql
    ├── 007_triage.sql
    ├── 008_queue_alerts.sql
    ├── 009_notifications_audit.sql
    ├── 010_indexes.sql
    └── 011_rls.sql
```

The exact migration filenames can be changed.

---

# 38. MIGRATION RULE

Every schema change should be reproducible.

Example:

```text
Change schema
 ↓
Create migration
 ↓
Apply locally
 ↓
Test
 ↓
Commit migration
 ↓
Apply to target environment
```

Do not make undocumented manual schema changes.

---

# 39. SEED DATA

Create safe synthetic seed data:

```text
1 hospital
4–6 departments
5–10 doctors
20–50 synthetic patients
30–100 synthetic visits
queue examples
alert examples
```

Never seed real patient information.

---

# 40. SEED USER ROLES

Create test users:

```text
staff@test.local
doctor@test.local
admin@test.local
```

Use development-only credentials.

Example:

```text
STAFF
DOCTOR
ADMIN
```

Do not use these credentials in production.

---

# 41. SEED WORKFLOW

```text
Create Supabase Auth test users
        ↓
Create profiles
        ↓
Assign roles
        ↓
Create hospital
        ↓
Create departments
        ↓
Create doctors
        ↓
Create synthetic patients
        ↓
Create visits
        ↓
Create queue tickets
```

---

# 42. DATABASE FUNCTIONS

Use PostgreSQL functions only where they provide a clear benefit.

Potential examples:

```text
nearby hospitals
distance calculation
controlled queue helper
analytics aggregation
```

Do not move the entire business logic into database functions.

Core application rules remain in Express services.

---

# 43. POSTGIS QUERY

For nearby facilities:

```text
Input:
latitude
longitude
radius

        ↓

ST_DWithin
        ↓
matching hospitals
        ↓
distance
        ↓
sorted result
```

This is an optional feature and should not delay the core OPD workflow.

---

# 44. STORAGE

Supabase Storage should be used only if the project genuinely requires file storage.

Possible use:

```text
approved profile assets
non-sensitive project assets
```

For medical documents/identity documents, use extreme caution.

For the semester MVP:

> Avoid permanent storage of sensitive medical/identity documents unless explicitly required.

---

# 45. DATABASE BACKUP / RECOVERY

Before major schema changes:

```text
Ensure database backup/recovery capability
```

For the semester project:

```text
Git migrations
+
synthetic seed scripts
```

provide reproducibility.

Do not assume Git alone backs up database contents.

---

# 46. DATABASE DEVELOPMENT WORKFLOW

Use:

```text
Local development
 ↓
Migration
 ↓
Seed
 ↓
Test
 ↓
Integration
 ↓
Production/staging
```

Do not build the final database by clicking random settings in the dashboard.

---

# 47. FRONTEND DATABASE ACCESS

Critical workflow:

```text
React
 ↓
Express API
 ↓
Supabase PostgreSQL
```

The frontend should not directly update:

```text
queue priority
triage result
doctor assignment
alert status
```

through arbitrary database writes.

---

# 48. OPTIONAL DIRECT SUPABASE CLIENT

The frontend may use Supabase client for:

```text
Authentication
Session management
```

But critical application data should use the backend API.

This keeps business logic centralized.

---

# 49. REALTIME DECISION

Primary application realtime:

```text
Socket.io
```

Use it for:

```text
queue updates
patient calls
alerts
doctor status
dashboard updates
```

Supabase Realtime should not be added simply because Supabase provides it.

Avoid implementing two overlapping realtime systems for the same event.

---

# 50. SOCKET.IO + DATABASE FLOW

```text
Staff action
 ↓
Express
 ↓
Authorization
 ↓
PostgreSQL update
 ↓
Audit log
 ↓
Socket.io emit
 ↓
Authorized clients
```

Database remains the source of truth.

---

# 51. DATABASE TRANSACTIONS

Use transactions where multiple changes represent one logical operation.

Example:

```text
Complete triage
 ↓
Insert triage assessment
 ↓
Create queue ticket
 ↓
Update visit status
 ↓
Insert audit log
 ↓
COMMIT
```

If critical step fails:

```text
ROLLBACK
```

---

# 52. DATABASE STATUS WORKFLOW

Visit:

```text
REGISTERED
   ↓
TRIAGE_PENDING
   ↓
WAITING
   ↓
CALLED
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

Alternative:

```text
TRIAGE_PENDING
   ↓
CANCELLED
```

Invalid transitions should be rejected by backend business logic.

---

# 53. QUEUE CONSISTENCY

Avoid:

```text
Frontend calculates position
```

Instead:

```text
Database state
+
backend ordering
=
authoritative queue
```

Socket.io only informs clients that state changed.

---

# 54. DATABASE SECURITY CHECKLIST

Before integration:

- [ ] RLS enabled
- [ ] Policies tested
- [ ] Service-role key backend-only
- [ ] Foreign keys created
- [ ] Constraints created
- [ ] Indexes created
- [ ] PostGIS enabled
- [ ] No real patient data
- [ ] Synthetic seed data ready
- [ ] Migration files versioned
- [ ] Database error messages not exposed
- [ ] Admin role protected

---

# 55. SUPABASE AUTH SECURITY CHECKLIST

- [ ] Email/password configured
- [ ] Email verification decision documented
- [ ] Password reset uses Supabase Auth
- [ ] No duplicate password table
- [ ] JWT verified by backend
- [ ] Role not trusted from frontend
- [ ] Admin creation controlled
- [ ] Inactive accounts rejected
- [ ] Service credentials never exposed

---

# 56. DEVELOPMENT ORDER

Implement Supabase in this order:

```text
1. Create project
       ↓
2. Configure environment variables
       ↓
3. Enable Auth
       ↓
4. Enable PostGIS
       ↓
5. Initialize migrations
       ↓
6. Create profiles
       ↓
7. Create roles
       ↓
8. Create hospital/departments
       ↓
9. Create doctors
       ↓
10. Create patients/visits
       ↓
11. Create triage
       ↓
12. Create queue
       ↓
13. Create alerts/notifications
       ↓
14. Create audit/AI tables
       ↓
15. Add constraints
       ↓
16. Add indexes
       ↓
17. Enable RLS
       ↓
18. Write policies
       ↓
19. Seed synthetic data
       ↓
20. Test with Express
```

---

# 57. ANTIGRAVITY IMPLEMENTATION RULE

When implementing the backend in Antigravity:

Do NOT ask it to create a new database architecture.

The architecture is already decided:

```text
Supabase PostgreSQL
+
PostGIS
+
Supabase Auth
+
JWT
+
RBAC
+
RLS
```

Antigravity should implement the documented migration/schema rather than replacing it.

---

# 58. LOVABLE RULE

Lovable is frontend-only.

Do not allow Lovable to create:

```text
Supabase tables
Supabase Auth
database schema
RLS policies
backend routes
API keys
server functions
```

The frontend may contain:

```text
Supabase client for authentication/session
```

only if required by the approved frontend architecture.

All real backend/database implementation happens later in Antigravity.

---

# 59. DATABASE TESTING

Test:

```text
Create patient
Create visit
Add symptom
Create triage
Create queue ticket
Call patient
Create alert
Acknowledge alert
Complete visit
```

Also test invalid operations:

```text
Duplicate patient
Invalid visit
Wrong department
Unauthorized role
Invalid queue transition
```

---

# 60. FINAL SUPABASE ARCHITECTURE

```text
                  SUPABASE
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   AUTHENTICATION  POSTGRES      POSTGIS
        │            │
        │            ├── profiles
        │            ├── roles
        │            ├── hospitals
        │            ├── departments
        │            ├── doctors
        │            ├── patients
        │            ├── visits
        │            ├── symptoms
        │            ├── triage
        │            ├── queue
        │            ├── alerts
        │            ├── notifications
        │            ├── audit_logs
        │            └── ai_interactions
        │
        └────────────── JWT
                         │
                         ▼
                   EXPRESS BACKEND
                         │
                    RBAC + RLS
```

---

# 61. FINAL DATABASE PRINCIPLE

Supabase PostgreSQL is the **source of truth**.

The application follows:

```text
React
 ↓
Express
 ↓
Authorization
 ↓
PostgreSQL
 ↓
Database state
 ↓
Socket.io
 ↓
React
```

AI does not directly modify the database.

Gemini does not directly modify the database.

The frontend does not directly control critical database state.

Only authorized backend operations can commit important OPD workflow changes.

---

# 62. FINAL RULE

Do not add Firebase.

Do not add MongoDB.

Do not create a second authentication system.

Do not duplicate Supabase Auth passwords with bcrypt.

Do not expose the service-role key.

Do not create a second realtime architecture unnecessarily.

The approved infrastructure is:

```text
Lovable
→ frontend only

Antigravity
→ complete implementation

Supabase
→ Auth + PostgreSQL + PostGIS + RLS

Express
→ backend + business logic + security

JWT
→ authenticated API identity

RBAC
→ application authorization

Socket.io
→ application realtime

Gemini
→ conversational AI

Python FastAPI
→ task-specific ML inference
```

This is the baseline infrastructure for the remaining implementation plans.
