# BACKEND DEVELOPMENT PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 08 / 14  
**Purpose:** Complete backend architecture, implementation sequence, API design, security, AI integration and realtime plan  
**Frontend:** React + Vite + Tailwind + shadcn/ui  
**Backend:** Node.js + Express  
**Database:** Supabase PostgreSQL + PostGIS  
**Authentication:** Supabase Auth  
**Token security:** JWT verification  
**Authorization:** RBAC  
**Password hashing:** bcrypt only for application-owned credentials, never Supabase Auth passwords  
**Realtime:** Socket.io  
**AI:** Gemini API  
**ML:** Python FastAPI inference service  
**Storage:** Supabase Storage only for approved non-sensitive assets  
**Frontend builder:** Lovable — frontend only  
**Primary implementation environment:** Google Antigravity

---

# 1. BACKEND OBJECTIVE

The backend is the central control layer between the frontend, authentication, database, AI services and realtime system.

```text
React Frontend
      ↓
Node.js + Express
      │
      ├── Authentication verification
      ├── Authorization / RBAC
      ├── Validation
      ├── Business logic
      ├── Queue engine
      ├── AI orchestration
      ├── Audit logging
      ├── Rate limiting
      └── Realtime events
      │
      ├──────────────┬───────────────┐
      ▼              ▼               ▼
Supabase         Gemini          Python ML
PostgreSQL       API             Service
+ PostGIS
```

The frontend must never become the authority for security, queue state, triage decisions or database integrity.

---

# 2. FINAL BACKEND STACK

```text
Runtime:
Node.js

Framework:
Express.js

Database:
Supabase PostgreSQL

Geospatial:
PostGIS

Authentication:
Supabase Auth

Token:
JWT

Authorization:
RBAC

Password hashing:
bcrypt only for application-owned credentials

Realtime:
Socket.io

AI:
Gemini API

ML:
Python + FastAPI + scikit-learn

Validation:
Zod or Joi

Security:
Helmet
CORS
Rate limiting
Input validation
JWT verification

Logging:
Structured application logs + audit_logs table
```

---

# 3. BACKEND RESPONSIBILITIES

The Express backend owns:

- API routing
- authentication verification
- RBAC
- patient workflows
- visit workflows
- triage orchestration
- queue management
- emergency escalation
- AI request handling
- ML service communication
- database operations
- audit logging
- realtime event emission
- validation
- error handling
- security controls

---

# 4. WHAT THE BACKEND DOES NOT OWN

Do not duplicate services unnecessarily.

The backend does not directly own:

```text
User passwords
```

Supabase Auth owns them.

The backend does not become:

```text
Primary database
```

Supabase PostgreSQL owns application data.

The backend does not become:

```text
AI model training environment
```

Python handles ML development/training.

The backend orchestrates inference but does not need to contain the training pipeline.

---

# 5. BACKEND FOLDER STRUCTURE

Recommended:

```text
server/
├── src/
│   ├── config/
│   │   ├── env.js
│   │   ├── supabase.js
│   │   └── gemini.js
│   │
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── validate.js
│   │   ├── rateLimit.js
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── patients.routes.js
│   │   ├── visits.routes.js
│   │   ├── triage.routes.js
│   │   ├── queue.routes.js
│   │   ├── alerts.routes.js
│   │   ├── departments.routes.js
│   │   ├── doctors.routes.js
│   │   ├── notifications.routes.js
│   │   ├── analytics.routes.js
│   │   └── admin.routes.js
│   │
│   ├── controllers/
│   │   ├── patients.controller.js
│   │   ├── visits.controller.js
│   │   ├── triage.controller.js
│   │   ├── queue.controller.js
│   │   └── alerts.controller.js
│   │
│   ├── services/
│   │   ├── patient.service.js
│   │   ├── visit.service.js
│   │   ├── triage.service.js
│   │   ├── queue.service.js
│   │   ├── alert.service.js
│   │   ├── ai.service.js
│   │   ├── ml.service.js
│   │   └── audit.service.js
│   │
│   ├── validators/
│   │   ├── patient.schema.js
│   │   ├── visit.schema.js
│   │   ├── triage.schema.js
│   │   └── queue.schema.js
│   │
│   ├── sockets/
│   │   ├── index.js
│   │   ├── queue.socket.js
│   │   └── alerts.socket.js
│   │
│   ├── utils/
│   │   ├── errors.js
│   │   ├── response.js
│   │   └── logger.js
│   │
│   ├── app.js
│   └── server.js
│
├── tests/
├── package.json
└── .env
```

---

# 6. CONFIGURATION

Create a single environment configuration layer.

Example:

```env
NODE_ENV=development
PORT=5000

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
GEMINI_TRIAGE_MODEL=gemini-2.5-flash
GEMINI_LIGHT_MODEL=gemini-2.5-flash-lite

ML_SERVICE_URL=

CLIENT_URL=http://localhost:5173

JWT_ISSUER=
JWT_AUDIENCE=
```

Never commit `.env`.

Add:

```text
.env
.env.*
```

to `.gitignore`, while keeping a safe:

```text
.env.example
```

---

# 7. SUPABASE CLIENTS

The backend may maintain separate Supabase client configurations.

## Public/standard client

Used where normal authenticated user context should be preserved.

## Server/service client

Used only for controlled backend operations requiring elevated privileges.

The service-role key bypasses normal RLS protections.

Therefore:

```text
SUPABASE_SERVICE_ROLE_KEY
            ↓
         Backend
            ↓
        NEVER React
```

---

# 8. AUTHENTICATION FLOW

```text
User
 ↓
Supabase Auth
 ↓
Authenticated session
 ↓
JWT access token
 ↓
React
 ↓
Authorization: Bearer <token>
 ↓
Express
 ↓
JWT verification
 ↓
Authenticated request
```

The backend must reject:

```text
missing token
invalid token
expired token
malformed token
```

with an appropriate 401 response.

---

# 9. JWT VERIFICATION

The `authenticate` middleware should:

1. Read `Authorization`.
2. Confirm `Bearer`.
3. Extract token.
4. Verify the Supabase-issued JWT.
5. Extract user identity.
6. Attach authenticated user context to `req.user`.
7. Continue.

Example conceptual object:

```js
req.user = {
  id: "supabase-user-id",
  email: "staff@example.com"
};
```

Do not trust a user ID sent in the request body as the authenticated identity.

---

# 10. AUTHENTICATION VS AUTHORIZATION

These are separate middleware responsibilities.

```text
authenticate()
     ↓
Who are you?

authorize("ADMIN")
     ↓
Are you allowed?
```

Example:

```text
GET /api/patients

authenticate
    ↓
authorize(STAFF, DOCTOR, ADMIN)
    ↓
controller
```

---

# 11. RBAC

Recommended roles:

```text
STAFF
DOCTOR
ADMIN
```

Optional future:

```text
SUPER_ADMIN
RECEPTION
TRIAGE_NURSE
```

Create centralized authorization logic.

Do not scatter role strings throughout controllers.

Example:

```text
permissions.js
```

can define:

```text
VIEW_PATIENT
CREATE_PATIENT
VIEW_QUEUE
MANAGE_QUEUE
RUN_TRIAGE
ACKNOWLEDGE_ALERT
MANAGE_USERS
VIEW_ANALYTICS
```

---

# 12. ROLE → PERMISSION MODEL

Example:

```text
STAFF
 ├── VIEW_PATIENT
 ├── CREATE_PATIENT
 ├── VIEW_QUEUE
 ├── MANAGE_QUEUE
 ├── RUN_TRIAGE
 └── ACKNOWLEDGE_ALERT

DOCTOR
 ├── VIEW_PATIENT
 ├── VIEW_QUEUE
 ├── RUN_TRIAGE
 ├── COMPLETE_VISIT
 └── ACKNOWLEDGE_ALERT

ADMIN
 ├── all operational permissions
 ├── MANAGE_USERS
 ├── MANAGE_DEPARTMENTS
 └── VIEW_ANALYTICS
```

Keep permissions explicit.

---

# 13. BCRYPT RULE

This project uses Supabase Auth for normal user passwords.

Therefore:

```text
Do NOT:
Supabase password
 ↓
bcrypt
 ↓
our database
```

This would duplicate credential storage.

bcrypt should only be introduced if we create an independent application-owned credential.

Example:

```text
Application-owned local credential
 ↓
bcrypt hash
 ↓
dedicated secure table
```

For the standard login:

```text
Password
 ↓
Supabase Auth
 ↓
JWT
```

This distinction must be clearly explained during the project presentation.

---

# 14. DATABASE ACCESS

Use Supabase PostgreSQL as the source of truth.

The backend performs:

```text
API
 ↓
Service
 ↓
Supabase/PostgreSQL
```

Do not let frontend components directly mutate critical patient/queue data.

---

# 15. DATABASE SCHEMA

Primary tables:

```text
profiles
user_roles
patients
hospitals
departments
doctors
visits
symptoms
triage_assessments
queue_tickets
alerts
notifications
audit_logs
ai_interactions
```

Additional tables should only be added when a real requirement exists.

---

# 16. API VERSIONING

Use:

```text
/api/v1
```

Example:

```text
/api/v1/patients
/api/v1/visits
/api/v1/triage
/api/v1/queue
```

This keeps future API changes manageable.

---

# 17. PATIENT APIs

```http
POST   /api/v1/patients
GET    /api/v1/patients/:id
GET    /api/v1/patients?search=
PATCH  /api/v1/patients/:id
```

Permissions must be checked for every endpoint.

Do not expose unnecessary patient fields.

---

# 18. VISIT APIs

```http
POST   /api/v1/visits
GET    /api/v1/visits/:id
PATCH  /api/v1/visits/:id/status
GET    /api/v1/patients/:id/visits
```

Creating a visit may also initiate the triage workflow.

---

# 19. TRIAGE APIs

```http
POST /api/v1/triage/session
POST /api/v1/triage/extract
POST /api/v1/triage/assess
GET  /api/v1/triage/:visitId
```

The backend orchestrates:

```text
Gemini
 ↓
structured symptom data
 ↓
validation
 ↓
safety rules
 ↓
ML service
 ↓
triage result
```

---

# 20. TRIAGE REQUEST

Example:

```json
{
  "visitId": "uuid",
  "message": "I have fever since two days.",
  "language": "en"
}
```

The backend should associate the request with the authenticated session/visit rather than trusting arbitrary patient identifiers.

---

# 21. TRIAGE RESPONSE

Example:

```json
{
  "visitId": "uuid",
  "priority": "YELLOW",
  "confidence": 0.84,
  "redFlags": [],
  "recommendedAction": "PRIORITY_REVIEW",
  "modelVersion": "triage-v1"
}
```

The confidence value is a model score, not medical certainty.

---

# 22. QUEUE APIs

```http
POST   /api/v1/queue/tickets
GET    /api/v1/queue
GET    /api/v1/queue/:id
PATCH  /api/v1/queue/:id/status
PATCH  /api/v1/queue/:id/assign
POST   /api/v1/queue/:id/call
```

Only authorized staff can modify queue state.

---

# 23. QUEUE ENGINE

The backend determines:

```text
priority
+
arrival time
+
configured rules
+
department
+
doctor availability
```

The frontend must not calculate the authoritative queue order.

---

# 24. QUEUE PRIORITY

Project categories:

```text
RED
YELLOW
GREEN
```

Example conceptual ordering:

```text
RED
 ↓
YELLOW
 ↓
GREEN
```

Within the same priority, earlier arrival may be preferred.

Any advanced aging/fairness rule should be implemented and documented separately.

---

# 25. ALERT APIs

```http
GET   /api/v1/alerts
POST  /api/v1/alerts/:id/acknowledge
PATCH /api/v1/alerts/:id/status
```

Emergency alerts require appropriate role permissions.

---

# 26. DOCTOR / DEPARTMENT APIs

```http
GET /api/v1/departments
GET /api/v1/departments/:id
GET /api/v1/departments/:id/doctors
GET /api/v1/doctors
PATCH /api/v1/doctors/:id/status
```

Admin-only operations:

```http
POST   /api/v1/departments
PATCH  /api/v1/departments/:id
POST   /api/v1/doctors
PATCH  /api/v1/doctors/:id
```

---

# 27. ANALYTICS APIs

Possible:

```http
GET /api/v1/analytics/overview
GET /api/v1/analytics/queue
GET /api/v1/analytics/triage
```

Analytics should return aggregated information where possible.

Do not expose unnecessary patient-level information.

---

# 28. GEMINI SERVICE

Create:

```text
ai.service.js
```

Responsibilities:

- prompt construction
- Gemini request
- structured output handling
- response validation
- timeout handling
- retry policy
- error normalization
- model/version tracking

The Gemini API key exists only on the backend.

---

# 29. GEMINI REQUEST FLOW

```text
Express
 ↓
Validate input
 ↓
Build controlled prompt
 ↓
Gemini
 ↓
Receive structured response
 ↓
Schema validation
 ↓
Safety checks
 ↓
Return structured data
```

Never send uncontrolled backend prompts directly from the browser.

---

# 30. GEMINI SECURITY

Never expose:

```text
GEMINI_API_KEY
```

to React.

Do not place it in:

```text
VITE_GEMINI_API_KEY
```

Do not call Gemini directly from the browser.

Correct:

```text
React
 ↓
Express
 ↓
Gemini
```

---

# 31. ML SERVICE

Python service:

```text
FastAPI
```

Endpoint:

```http
POST /predict
```

Example input:

```json
{
  "chiefComplaint": "fever and weakness",
  "temperature": 38.4,
  "heartRate": 96,
  "respiratoryRate": 19,
  "oxygenSaturation": 97,
  "pain": 3
}
```

Output:

```json
{
  "priority": "YELLOW",
  "confidence": 0.84,
  "modelVersion": "triage-v1"
}
```

Numbers are examples only.

---

# 32. ML SERVICE SECURITY

The ML service should be internal.

```text
Public client
    ↓
Express
    ↓
ML service
```

Do not expose a public unauthenticated `/predict` endpoint.

Use an internal authentication mechanism if the deployment topology requires network-level separation.

---

# 33. TRIAGE ORCHESTRATION

Recommended service sequence:

```text
triage.controller
        ↓
triage.service
        ↓
┌───────┴─────────┐
▼                 ▼
ai.service      safety.service
       \          /
        \        /
          ↓
      ml.service
          ↓
    triage result
```

This keeps responsibilities separate.

---

# 34. SAFETY SERVICE

Create:

```text
safety.service.js
```

It should:

- detect configured red flags
- validate model output
- enforce escalation
- identify missing critical information
- prevent unsafe output from becoming a routine queue ticket

Example:

```text
AI = GREEN
Safety = RED
Final = RED
```

---

# 35. VALIDATION

Use a schema validation library such as:

```text
Zod
```

Validate:

- request bodies
- query parameters
- path parameters
- Gemini output
- ML output
- database-bound data

Never assume an AI response is valid simply because it is JSON.

---

# 36. ERROR HANDLING

Use centralized:

```text
errorHandler.js
```

Response pattern:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request."
  }
}
```

Do not return stack traces to users.

---

# 37. HTTP STATUS CODES

Use meaningful statuses:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
503 Service Unavailable
```

---

# 38. SECURITY MIDDLEWARE

Recommended order:

```text
Helmet
 ↓
CORS
 ↓
Body limits
 ↓
Request logging
 ↓
Rate limiting
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Controller
```

Exact middleware order can vary where framework constraints require it.

---

# 39. CORS

Allow only the actual frontend origin.

Development:

```text
http://localhost:5173
```

Production:

```text
https://your-production-domain
```

Do not use:

```text
*
```

for credentialed sensitive APIs.

---

# 40. RATE LIMITING

Apply stronger limits to:

```text
/auth-related endpoints
/triage
/ocr
/AI endpoints
```

Use a broader but reasonable limit for normal APIs.

Avoid rate limiting internal Socket.io events in a way that breaks normal queue operation.

---

# 41. REQUEST SIZE LIMITS

Limit:

```text
JSON body size
multipart/file size
query length
```

This prevents oversized malicious requests.

For OCR, use strict image type and size validation.

---

# 42. OCR FLOW

If document/image OCR is required:

```text
Frontend
 ↓
Express
 ↓
Validate file
 ↓
Temporary processing
 ↓
Gemini vision/OCR
 ↓
Structured extraction
 ↓
Validation
 ↓
User confirmation
 ↓
Delete temporary file
```

Do not permanently retain identity documents by default.

---

# 43. SOCKET.IO ARCHITECTURE

Use Socket.io for application events.

```text
React Client
     ↕
Socket.io
     ↕
Express/Node Server
     ↕
Supabase PostgreSQL
```

Potential events:

```text
queue:updated
queue:patient-called
queue:ticket-created
alert:created
alert:acknowledged
visit:updated
doctor:status-changed
```

---

# 44. SOCKET AUTHENTICATION

Do not allow anonymous users to join privileged staff rooms.

Socket connection:

```text
Client
 ↓
Supabase JWT
 ↓
Socket.io handshake
 ↓
JWT verification
 ↓
User identity
 ↓
RBAC
 ↓
Room access
```

Example rooms:

```text
department:<departmentId>
role:admin
staff:<userId>
```

Only authorized users may join them.

---

# 45. SOCKET EVENT AUTHORIZATION

Do not trust:

```text
client.emit("queue:updated")
```

as an authoritative event.

Clients should request an operation through a protected API.

Then:

```text
Backend changes database
 ↓
Backend emits event
 ↓
Clients receive event
```

This prevents clients from fabricating queue state.

---

# 46. QUEUE REALTIME FLOW

Correct:

```text
Staff
 ↓
PATCH /queue/:id/status
 ↓
Express authorization
 ↓
Database update
 ↓
Success
 ↓
Socket.io event
 ↓
All authorized dashboards update
```

Incorrect:

```text
Browser
 ↓
Socket event
 ↓
Other browsers
```

The database must remain authoritative.

---

# 47. AUDIT LOGGING

Log important security/business operations:

```text
LOGIN
PATIENT_CREATED
VISIT_CREATED
TRIAGE_CREATED
QUEUE_CREATED
QUEUE_UPDATED
ALERT_CREATED
ALERT_ACKNOWLEDGED
PATIENT_CALLED
VISIT_COMPLETED
USER_ROLE_CHANGED
```

Do not log:

- passwords
- JWTs
- API keys
- sensitive raw AI prompts containing unnecessary patient information

---

# 48. DATABASE TRANSACTIONS

Use transactions for operations that must succeed together.

Example:

```text
Create visit
   ↓
Create triage assessment
   ↓
Create queue ticket
   ↓
Commit
```

If a critical operation fails:

```text
Rollback
```

Do not leave partially created OPD workflows.

---

# 49. PATIENT CREATION FLOW

```text
POST /patients
       ↓
Authenticate/authorize
       ↓
Validate input
       ↓
Check duplicate criteria
       ↓
Create patient
       ↓
Audit log
       ↓
Return patient ID/code
```

---

# 50. VISIT CREATION FLOW

```text
POST /visits
       ↓
Validate patient
       ↓
Validate department
       ↓
Create visit
       ↓
Set TRIAGE_PENDING
       ↓
Audit log
       ↓
Return visit
```

---

# 51. TRIAGE COMPLETION FLOW

```text
Patient input
 ↓
Gemini extraction
 ↓
Schema validation
 ↓
Safety rules
 ↓
ML prediction
 ↓
Confidence check
 ↓
Final recommendation
 ↓
Store triage assessment
 ↓
Create/update queue ticket
 ↓
Audit log
 ↓
Socket.io event
```

---

# 52. FAILURE HANDLING

## Gemini unavailable

```text
AI unavailable
 ↓
Manual triage
```

## ML service unavailable

```text
ML unavailable
 ↓
Manual staff review
```

## Database unavailable

```text
503
 ↓
Do not fabricate success
```

## Socket unavailable

```text
Database remains authoritative
 ↓
Frontend can refresh/poll fallback
```

---

# 53. HEALTH CHECK

Provide:

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

Optional detailed internal health check:

```text
database
gemini
ml-service
socket
```

Do not expose sensitive infrastructure details publicly.

---

# 54. BACKEND TESTING

Test:

### Authentication

- valid JWT
- expired JWT
- missing JWT
- malformed JWT

### RBAC

- staff accessing staff route
- doctor accessing doctor route
- staff denied admin route
- admin allowed admin route

### Validation

- invalid UUID
- missing required field
- invalid priority
- invalid status

### Queue

- priority ordering
- duplicate ticket prevention
- unauthorized modification

### AI

- valid Gemini response
- malformed Gemini response
- Gemini timeout
- ML timeout
- low confidence

### Realtime

- authenticated socket
- unauthorized room
- queue update event

---

# 55. SECURITY TESTING

Before deployment:

```text
Check .env
Check exposed secrets
Check CORS
Check RLS
Check RBAC
Check rate limits
Check input validation
Check file upload restrictions
Check Socket.io authentication
Check service-role key exposure
Check Gemini key exposure
```

Search the built frontend for accidental secret strings.

---

# 56. DEVELOPMENT ORDER

Implement backend in this order:

```text
1. Express skeleton
       ↓
2. Environment configuration
       ↓
3. Supabase connection
       ↓
4. Database migrations
       ↓
5. Supabase Auth
       ↓
6. JWT verification
       ↓
7. RBAC
       ↓
8. Validation/error middleware
       ↓
9. Patient APIs
       ↓
10. Visit APIs
       ↓
11. Queue engine
       ↓
12. Socket.io
       ↓
13. Gemini service
       ↓
14. Safety service
       ↓
15. Python ML service
       ↓
16. Triage orchestration
       ↓
17. Alerts
       ↓
18. Analytics
       ↓
19. Testing
       ↓
20. Deployment
```

---

# 57. BACKEND ENVIRONMENT SEPARATION

Use:

```text
development
test
production
```

Never use production secrets locally.

Keep:

```text
.env.example
```

with placeholders.

---

# 58. API DOCUMENTATION

Document APIs using OpenAPI/Swagger after the first stable backend version.

Include:

- endpoint
- method
- authentication requirement
- role requirement
- request schema
- response schema
- errors
- example

This will help both development and project presentation.

---

# 59. BACKEND SUCCESS CRITERIA

Backend is ready when:

- Authentication works through Supabase Auth.
- JWTs are verified correctly.
- RBAC blocks unauthorized operations.
- PostgreSQL is the source of truth.
- RLS is configured.
- Queue state is server-controlled.
- Socket.io events are authenticated.
- Gemini API key is server-side.
- ML service is not publicly exposed.
- AI output is validated.
- Safety rules can override unsafe AI outputs.
- Audit logs are recorded.
- Errors do not expose secrets.
- Frontend cannot bypass authorization.
- AI failures fall back to manual operation.

---

# 60. FINAL BACKEND ARCHITECTURE

```text
                         REACT
                           │
                           ▼
                    SUPABASE AUTH
                           │
                         JWT
                           │
                           ▼
                    EXPRESS SERVER
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
      RBAC             Validation          Rate Limit
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    BUSINESS SERVICES
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      SUPABASE          GEMINI          PYTHON ML
      PostgreSQL         API             FastAPI
          │
       PostGIS
          │
          ▼
       DATA STATE
          │
          ▼
      SOCKET.IO
          │
          ▼
    AUTHORIZED CLIENTS
```

---

# 61. FINAL SECURITY PRINCIPLE

The backend follows:

```text
Supabase Auth
      ↓
JWT
      ↓
Express verification
      ↓
RBAC
      ↓
Validation
      ↓
Business rules
      ↓
PostgreSQL + RLS
```

and:

```text
Socket.io
      ↓
Authenticated connection
      ↓
Authorized room/event
      ↓
Server-generated events
```

and:

```text
Gemini / ML
      ↓
Never trusted blindly
      ↓
Schema validation
      ↓
Safety rules
      ↓
Confidence check
      ↓
Human escalation
```

This gives the project a proper backend engineering and security architecture while keeping Supabase as the core platform.
