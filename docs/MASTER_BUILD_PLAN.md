# MASTER BUILD PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 01 / 14  
**Status:** Master architecture — updated  
**Application:** Web application only

---

## 1. Project Objective

Build a smart digital OPD management web application that improves patient registration, preliminary symptom collection, AI-assisted triage, queue prioritization, and staff operations.

The system is an **assistive OPD management system**, not an autonomous diagnosis system.

---

## 2. Locked Architecture

```text
LOVABLE
   ↓
FRONTEND ONLY
   ↓
GOOGLE ANTIGRAVITY
   ↓
Node.js + Express Backend
   │
   ├── JWT verification
   ├── RBAC
   ├── business logic
   ├── queue engine
   ├── AI orchestration
   └── API security
   │
   ├───────────────┬───────────────────┬────────────────┐
   ▼               ▼                   ▼                ▼
Supabase        Supabase            Supabase         Gemini
PostgreSQL      Auth                 Realtime         AI/OCR
   │
   └── PostGIS
```

### Core technologies

- React + Vite
- Tailwind CSS
- shadcn/ui
- Node.js + Express
- Supabase PostgreSQL
- PostGIS
- Supabase Auth
- JWT
- RBAC
- bcrypt **only for application-owned credentials where genuinely required; never duplicate Supabase Auth passwords**
- Socket.io
- Gemini API
- Browser Web Speech API
- SpeechSynthesis

---

## 3. Authentication vs Authorization

These are intentionally separate.

### Authentication

Supabase Auth verifies who the user is.

```text
User
 ↓
Supabase Auth
 ↓
Authenticated session / JWT
```

### Authorization

Our Express backend decides what the authenticated user is allowed to do.

```text
JWT
 ↓
Express middleware
 ↓
User identity
 ↓
RBAC
 ↓
Permission
 ↓
API operation
```

---

## 4. JWT Strategy

Supabase Auth provides the authenticated user's token.

The frontend sends the access token to our backend:

```http
Authorization: Bearer <access_token>
```

Express verifies the token before protected operations.

Do not create a second authentication token system unless a later requirement specifically requires it.

JWT is therefore a core security concept in the project without duplicating Supabase's authentication mechanism.

---

## 5. bcrypt Strategy

Do **not** store or hash Supabase Auth passwords in our own database.

Supabase Auth owns those credentials.

bcrypt may be used only for an independently managed application credential if one is introduced later, for example a non-Supabase service credential or application-owned secret.

For normal staff login:

```text
Password
 ↓
Supabase Auth
 ↓
JWT
 ↓
Express
```

Not:

```text
Password
 ↓
bcrypt
 ↓
our users table
```

This avoids duplicate credential storage.

---

## 6. RBAC

Initial roles:

```text
STAFF
DOCTOR
ADMIN
```

Potential future:

```text
SUPER_ADMIN
RECEPTION
TRIAGE_NURSE
```

Authorization must be enforced server-side.

Example:

```text
STAFF
 ├── View queue
 ├── View authorized patients
 └── Acknowledge alerts

DOCTOR
 ├── View assigned patients
 ├── Update consultation state
 └── Complete visits

ADMIN
 ├── Manage staff
 ├── Manage departments
 ├── View analytics
 └── Configure system
```

Exact permissions will be finalized in the security/API documents.

---

## 7. Database

### Primary database

**Supabase PostgreSQL**

Stores:

- Patients
- Visits
- Symptoms
- Triage assessments
- Queue tickets
- Staff profiles
- Doctors
- Departments
- Alerts
- Notifications
- Audit logs
- AI interaction metadata
- Hospital/location data
- System configuration

### Geospatial

**PostGIS**

Use for:

- Hospital coordinates
- Department locations
- Distance calculations
- Future nearby-facility features

Do not track patient GPS continuously.

---

## 8. Supabase Auth

Use Supabase Auth for:

- Staff authentication
- Doctor authentication
- Admin authentication
- Email/password
- Optional Google OAuth later

Patients do not need accounts for the MVP.

Do not use Firebase anywhere in the project.

---

## 9. Supabase Realtime vs Socket.io

Both can technically provide realtime communication, but we will use:

**Socket.io as the primary application realtime layer.**

Use Socket.io for:

- Queue updates
- Patient called events
- Emergency alerts
- Ticket status changes
- Staff dashboard updates

Supabase Realtime may remain available for database-driven features where it provides a clear advantage, but it is not required for the core queue event architecture.

Do not unnecessarily duplicate every realtime event through both systems.

---

## 10. AI

Primary service:

**Gemini API**

Models:

- Gemini 2.5 Flash → main symptom conversation/triage
- Gemini 2.5 Flash-Lite → lightweight extraction/classification

Uses:

- Symptom conversation
- Preliminary triage
- Structured triage output
- Document/image understanding
- OCR-style extraction
- Multilingual processing

AI is assistive and never replaces clinician judgment.

---

## 11. Voice

Use browser-native:

- Web Speech API → speech recognition
- SpeechSynthesis → text-to-speech

Always provide text fallback.

---

## 12. Patient Flow

```text
Welcome
 ↓
Language / Accessibility
 ↓
Registration
 ↓
ID Scan or Manual Entry
 ↓
Patient Confirmation
 ↓
Symptom Collection
 ↓
AI-Assisted Triage
 ↓
Safety Validation
 ↓
Priority
 ↓
Queue Ticket
 ↓
Live Queue
 ↓
Called
 ↓
Consultation
 ↓
Completed
```

Emergency/help flow must bypass normal AI waiting behavior.

---

## 13. Staff Flow

```text
Login
 ↓
Supabase Auth
 ↓
JWT
 ↓
Express JWT Verification
 ↓
RBAC
 ↓
Dashboard
 ↓
Queue
 ↓
Patients
 ↓
Alerts
 ↓
Departments
 ↓
Analytics
```

---

## 14. Security Layers

Use defense in depth:

```text
1. Supabase Auth
2. JWT verification
3. Express authentication middleware
4. RBAC
5. PostgreSQL RLS
6. Input validation
7. API rate limiting
8. Secure CORS
9. Secret management
10. Audit logging
11. Safe AI output validation
```

---

## 15. Lovable Boundary

Lovable creates **frontend only**.

It must not create:

- Supabase project
- Supabase Auth
- PostgreSQL
- PostGIS
- Supabase Realtime
- Socket.io backend
- API endpoints
- Gemini integration
- Database
- Authentication backend
- Server functions
- API keys

Lovable uses mock/local data.

Actual integration begins in Antigravity.

---

## 16. Antigravity Responsibilities

After Lovable:

1. Audit frontend
2. Create Supabase project
3. Enable PostgreSQL/PostGIS
4. Configure Supabase Auth
5. Build schema/migrations
6. Configure RLS
7. Build Express backend
8. Implement JWT verification
9. Implement RBAC
10. Implement security middleware
11. Implement queue engine
12. Implement Socket.io
13. Integrate Gemini
14. Integrate OCR
15. Connect frontend
16. Test
17. Deploy

---

## 17. Development Principle

Keep the architecture understandable enough to explain in a college viva:

> Supabase Auth authenticates users; JWT carries authenticated identity; Express verifies the token and enforces RBAC; PostgreSQL/RLS protects data; bcrypt is used only for credentials our application actually owns; Socket.io provides real-time application events; Gemini performs assistive AI/OCR.

This is the authoritative architecture for all remaining documents.
