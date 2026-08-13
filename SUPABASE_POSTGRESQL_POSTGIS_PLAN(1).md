# SUPABASE POSTGRESQL + POSTGIS PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Purpose:** Define the database, authentication, PostGIS and realtime boundaries for the final architecture.

---

# 1. FINAL SUPABASE ROLE

Supabase is responsible for:

```text
Supabase Auth
PostgreSQL
PostGIS
Row Level Security (RLS)
Database migrations
Optional Storage where genuinely required
```

Supabase is NOT the application's primary realtime layer.

The application's realtime layer is:

```text
Socket.io
```

---

# 2. FINAL ARCHITECTURE

```text
React Frontend
      │
      ├── Supabase Auth
      │       ↓
      │      JWT
      │
      ▼
Node.js + Express
      │
      ├── Authentication
      ├── RBAC
      ├── Business Logic
      ├── AI/ML orchestration
      │
      ▼
Supabase PostgreSQL
      │
      ├── RLS
      └── PostGIS
      │
      ▼
Database state
      │
      ▼
Socket.io
      │
      ▼
Authorized dashboards
```

---

# 3. AUTHENTICATION

Use:

```text
Supabase Auth
```

for:

- Email/password authentication
- Session management
- Access tokens
- Refresh/session lifecycle
- Password reset

The backend verifies the Supabase-issued JWT.

---

# 4. JWT FLOW

```text
User
 ↓
Supabase Auth
 ↓
JWT
 ↓
React
 ↓
Express
 ↓
JWT verification
 ↓
Authenticated request
```

The frontend must never be trusted as the source of identity or role information.

---

# 5. RBAC

Application roles:

```text
STAFF
DOCTOR
ADMIN
```

Express performs role/permission checks.

PostgreSQL RLS provides an additional database-level security layer.

---

# 6. PASSWORDS / BCRYPT

Supabase Auth owns normal user passwords.

Therefore:

```text
No duplicate password table
No custom password hashing
No bcrypt for Supabase Auth passwords
```

bcrypt would only be relevant if the application later introduced an independently managed credential system.

---

# 7. DATABASE

Primary database:

```text
Supabase PostgreSQL
```

Why PostgreSQL:

- Relational data
- Foreign keys
- Constraints
- Transactions
- SQL
- RLS
- PostGIS

Core entities:

```text
profiles
user_roles
hospitals
departments
doctors
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

---

# 8. POSTGIS

Enable:

```text
PostGIS
```

for location-aware features.

Potential uses:

```text
Hospital location
Department location
Nearby facility search
Distance calculation
```

Do NOT use it for:

```text
Continuous patient tracking
Live patient GPS monitoring
Unnecessary location collection
```

---

# 9. LOCATION DATA

Recommended type:

```sql
geography(Point, 4326)
```

for hospital/department locations.

Use spatial indexes such as:

```text
GiST
```

where appropriate.

---

# 10. RLS

Enable Row Level Security for protected application tables.

RLS is defense in depth:

```text
JWT
 ↓
Express authentication
 ↓
RBAC
 ↓
Business authorization
 ↓
PostgreSQL RLS
```

Do not rely only on frontend route protection.

---

# 11. SERVICE-ROLE KEY

The backend may use:

```text
SUPABASE_SERVICE_ROLE_KEY
```

for controlled privileged operations.

It must NEVER be exposed to:

```text
React
Lovable
browser
public repository
frontend environment variables
```

Because service-role access can bypass RLS, every privileged backend operation must still perform explicit application authorization.

---

# 12. DATABASE MIGRATIONS

Use version-controlled migrations:

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

The exact filenames may change, but schema changes must remain reproducible.

---

# 13. REALTIME DECISION — IMPORTANT

The final project uses:

```text
Socket.io
```

as the **primary and only application realtime layer for the core OPD workflow**.

Use Socket.io for:

```text
Queue updates
Patient called
Emergency alerts
Doctor status
Visit updates
Staff dashboard updates
Doctor dashboard updates
```

---

# 14. SUPABASE REALTIME

Supabase Realtime is:

```text
NOT used for the core OPD realtime workflow.
```

Do not implement the same event through both:

```text
Supabase Realtime
+
Socket.io
```

because that would create two competing realtime architectures.

Supabase remains responsible for:

```text
Auth
PostgreSQL
PostGIS
RLS
```

Socket.io remains responsible for:

```text
Application realtime events
```

---

# 15. SOCKET.IO FLOW

Correct:

```text
Frontend action
 ↓
Express API
 ↓
Authentication
 ↓
RBAC
 ↓
Business logic
 ↓
PostgreSQL transaction
 ↓
Database state updated
 ↓
Audit log
 ↓
Socket.io event
 ↓
Authorized clients
```

The database is always the source of truth.

---

# 16. SOCKET.IO AUTHENTICATION

Socket connections must be authenticated.

```text
Client
 ↓
Supabase JWT
 ↓
Socket.io handshake
 ↓
JWT verification
 ↓
Role/resource authorization
 ↓
Connection/room allowed
```

Do not allow anonymous access to protected OPD rooms.

---

# 17. SOCKET.IO EVENTS

Recommended events:

```text
queue:ticket-created
queue:updated
queue:patient-called
queue:completed

alert:created
alert:acknowledged
alert:resolved

visit:updated
doctor:status-changed
```

---

# 18. SOCKET.IO RULE

The client must NOT be able to do this:

```text
socket.emit("change-queue-priority", ...)
 ↓
database changes
```

Instead:

```text
Client
 ↓
REST API
 ↓
Backend authorization
 ↓
Database update
 ↓
Socket.io broadcast
```

This prevents clients from directly controlling authoritative state.

---

# 19. OPTIONAL FUTURE USE OF SUPABASE REALTIME

Supabase Realtime may be evaluated in the future for a separate, clearly defined use case.

However, for this semester project:

```text
Do not implement Supabase Realtime.
```

This keeps the architecture simple and avoids duplicate realtime systems.

---

# 20. SUPABASE STORAGE

Storage is optional.

For the semester MVP, avoid unnecessary storage of:

```text
Medical documents
Identity documents
Sensitive patient files
```

unless explicitly required.

If file upload becomes necessary, implement:

```text
authenticated access
file validation
authorization
appropriate retention
```

---

# 21. FRONTEND DATABASE ACCESS

Core application data should follow:

```text
React
 ↓
Express API
 ↓
Supabase PostgreSQL
```

The frontend should not directly modify critical records such as:

```text
Triage result
Queue priority
Doctor assignment
Alert state
Visit state
```

Supabase Auth may still be used directly by the frontend for authentication/session operations.

---

# 22. FINAL SUPABASE BOUNDARY

```text
SUPABASE
├── Auth
├── PostgreSQL
├── PostGIS
├── RLS
└── Optional Storage

NOT SUPABASE REALTIME
```

```text
EXPRESS
├── Authentication verification
├── RBAC
├── Business logic
├── REST API
├── AI/ML orchestration
└── Socket.io server
```

---

# 23. FINAL INFRASTRUCTURE RULE

The project must not introduce another database or authentication system.

Final infrastructure:

```text
Supabase Auth
+
Supabase PostgreSQL
+
PostGIS
+
RLS
+
Express
+
JWT
+
RBAC
+
Socket.io
+
Gemini
+
Python FastAPI ML
```

The core realtime decision is locked:

```text
Socket.io = PRIMARY REALTIME
Supabase Realtime = NOT USED
```
