# LOVABLE PROMPTS
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 03 / 14  
**Purpose:** Copy-paste prompts for building the frontend in Lovable  
**Critical constraint:** FRONTEND ONLY

---

# 0. MASTER RULE — READ BEFORE USING ANY PROMPT

The following rule applies to **every Lovable prompt in this document**:

> **Build ONLY the frontend/UI. Do NOT create, configure, or depend on any backend infrastructure.**

Lovable must NOT create:

- Database
- Supabase
- Real authentication
- Backend/server functions
- API routes
- API integrations
- Gemini integration
- OCR API integration
- Supabase Realtime
- Real-time backend
- Notification backend
- Real patient-data storage
- Production environment secrets
- Backend business logic
- Queue algorithm implementation
- Medical/clinical AI logic

Use only:

- React frontend
- Tailwind CSS
- shadcn/ui where useful
- Lucide icons
- Framer Motion for meaningful UI transitions
- Local component state
- Mock JSON/static data
- Frontend-only navigation

The actual backend, authentication, database, APIs, AI, OCR, queue engine, and real-time infrastructure will be implemented later in **Google Antigravity**.

---

# 1. GLOBAL LOVABLE INSTRUCTION

Use this as the **base instruction** at the beginning of every Lovable prompt:

```text
IMPORTANT DEVELOPMENT CONSTRAINT:

Build FRONTEND ONLY.

Do not create or configure:
- database
- Supabase
- backend/server functions
- API routes
- external API integrations
- Gemini or other AI API
- OCR service
- Supabase Realtime
- real authentication
- real patient-data persistence
- secret environment variables
- production backend logic

Use realistic mock/local data only.

This frontend will later be connected to a separately developed backend in Google Antigravity.

Keep components, data structures, and UI states organized so mock data can later be replaced by REST API responses without redesigning the UI.

Do not make architectural decisions about the backend.
```

---

# 2. PROMPT 01 — INITIAL FRONTEND FOUNDATION

## Objective

Create the initial application shell and design system only.

### Prompt

```text
Build the initial frontend foundation for a web application called:

"Smart Digital OPD Management System with AI-Based Patient Triage"

This is a hospital OPD web application with two frontend surfaces:

1. Patient/Kiosk interface
2. Hospital Staff dashboard

IMPORTANT:
This is FRONTEND ONLY.

Do not create:
- database
- Supabase
- authentication backend
- backend/server functions
- APIs
- AI integrations
- OCR integrations
- Supabase Realtime
- real patient data
- secret environment variables

Use only mock/local frontend data.

TECH STACK:
- React
- Vite
- Tailwind CSS v4
- shadcn/ui
- Lucide icons
- Framer Motion only for meaningful transitions

Create a clean, reusable design system.

PATIENT/KIOSK DESIGN:
- calm
- medical
- trustworthy
- high contrast
- large typography
- large touch targets
- spacious
- accessible
- light theme

STAFF DESIGN:
- operational
- dense
- information-rich
- fast-scanning
- dashboard-oriented
- optional dark theme

Use a restrained deep navy/deep teal brand direction.

Reserve:
RED = Emergency
YELLOW = Priority/Attention
GREEN = Routine

Do not use these colors decoratively when they could confuse their operational meaning.

Create reusable components for:
- buttons
- inputs
- cards
- badges
- status indicators
- modals
- alerts
- tables
- loading states
- empty states
- error states

Create a clean folder/component structure suitable for later API integration.

Do not build backend functionality.

At the end, ensure the application runs entirely from frontend mock data.
```

---

# 3. PROMPT 02 — PATIENT/KIOSK SHELL

## Objective

Build the common patient-facing shell.

### Prompt

```text
Continue the existing frontend.

Build the complete patient/kiosk shell.

FRONTEND ONLY.
Do not add database, authentication, Supabase, APIs, backend logic, AI services, OCR services, or real persistence.

Create:

KioskShell
├── KioskHeader
├── ProgressIndicator
├── MainContent
└── EmergencyHelpButton

Header:
- hospital/product branding
- selected language
- accessibility control
- clean layout

Progress indicator:
Welcome → Registration → Symptoms → Ticket

Show the current stage clearly.

Always display an emergency/help action:

"I Need Help Now"

The emergency button must be visually distinct but not excessively alarming.

The kiosk should follow a one-decision-per-screen philosophy.

Use:
- large buttons
- large text
- generous spacing
- high contrast
- touch-friendly controls
- minimal distractions

Create responsive layouts for kiosk, tablet and desktop widths.

Add mock navigation between screens.

Do not implement real backend behavior.
```

---

# 4. PROMPT 03 — WELCOME, LANGUAGE & ACCESSIBILITY

### Prompt

```text
Build the patient welcome flow.

Create these frontend screens:

1. Welcome
2. Language Selection
3. Accessibility

WELCOME SCREEN:

Title:
"Welcome to OPD"

Supporting text:
"Register, share your symptoms, and receive your OPD queue token."

Primary CTA:
"Start Registration"

Secondary controls:
- Language
- Accessibility
- Help

Persistent emergency action:
"I Need Help Now"

LANGUAGE SCREEN:

Show:
- English
- हिन्दी
- Regional Language placeholder

The selected language should update mock UI text.

ACCESSIBILITY:

Include:
- Larger text
- Higher contrast
- Reduced motion
- Voice preference
- Clear labels

Use frontend-local state only.

Do not implement translation APIs.

Do not create any backend.

Make every screen accessible, touch-friendly and visually consistent with the existing design system.
```

---

# 5. PROMPT 04 — REGISTRATION FLOW

### Prompt

```text
Build the complete frontend patient registration flow.

FRONTEND ONLY.
Use mock data and local state.

Create:

1. Registration Method
2. ID Scan
3. Manual Registration
4. Patient Confirmation

REGISTRATION METHOD:

Title:
"How would you like to register?"

Options:
- Scan ID
- Enter Details Manually
- Continue without ID / Walk-in

ID SCAN:

Create a realistic camera/document scanning UI with:
- camera preview placeholder
- document frame
- scan button
- scanning state
- processing state
- success state
- failure state

Success should display mock extracted information.

Failure should offer:
- Try Again
- Enter Details Manually

Do NOT implement real OCR.

MANUAL REGISTRATION:

Use only necessary fields:
- Full Name
- Date of Birth/Age
- Gender if required
- Mobile Number
- Address if required
- Insurance information if required

Include validation states.

PATIENT CONFIRMATION:

Display extracted/manual information in a clear confirmation card.

Actions:
- Everything is correct
- Edit details

Use realistic mock patient information.

Do not connect to a database.
Do not implement authentication.
Do not send data anywhere.
```

---

# 6. PROMPT 05 — SYMPTOM COLLECTION EXPERIENCE

### Prompt

```text
Build the frontend symptom collection experience.

This is a patient-facing AI-assisted symptom conversation UI.

FRONTEND ONLY.

Do not connect Gemini or any AI API.

Use predefined mock questions and responses.

Create:

1. Symptom Introduction
2. Voice-first Interaction
3. Text Fallback
4. Listening State
5. Processing State
6. AI Response State
7. Error State
8. Emergency Escape Flow

INTRODUCTION:

Text:
"Tell us how you are feeling. You can speak or type in your preferred language."

Show:
- Start button
- Type instead
- I Need Help Now

Include a concise disclaimer:
"This assistant provides preliminary triage support and does not replace a medical professional."

VOICE UI:

Create:
- large voice orb
- waveform
- microphone state
- Listening...
- Processing...
- AI Speaking...
- Stop control

TEXT FALLBACK:

Provide a large text input.

Conversation should show one question at a time rather than a large chat history.

Use mock conversation data.

Emergency button must remain accessible.

Do not implement actual speech recognition or AI.
```

---

# 7. PROMPT 06 — TRIAGE & TICKET FLOW

### Prompt

```text
Build the frontend after symptom collection.

FRONTEND ONLY.
Use mock triage responses.

Create:

1. Triage Processing
2. Triage Status
3. Ticket
4. Queue Tracking
5. Completion

TRIAGE PROCESSING:

Show:
"Reviewing your information..."

Use a calm loading state.

Do not show model reasoning.

TRIAGE STATUS:

Display a simple operational result.

Example:
"Your information has been assessed."
"Priority: High"

For emergency mock state:
"Hospital staff have been alerted."

Do not display disease diagnosis.

TICKET SCREEN:

Make this the clearest and calmest screen.

Show:

YOUR OPD TOKEN

A-104

Department:
General Medicine

Estimated Wait:
18 minutes

Patients Ahead:
4

Actions:
- Track My Queue
- Print / Save Ticket

QUEUE TRACKING:

Show:
- token
- current serving token
- patients ahead
- estimated wait
- department
- status

Create mock states:
WAITING
CALLED
IN_PROGRESS
COMPLETED

COMPLETION:

Show:
"Your OPD process is complete."

Provide:
"Return to Home"

Do not implement real queue logic.
```

---

# 8. PROMPT 07 — STAFF LOGIN & SHELL

### Prompt

```text
Build the staff-facing frontend.

FRONTEND ONLY.

Do not implement real authentication.

Create a mock Staff Login screen.

Fields:
- Email/Username
- Password

States:
- Default
- Loading
- Invalid credentials
- Success

After mock login, show:

StaffShell
├── Sidebar
├── TopBar
├── MainContent
└── AlertsLayer

Sidebar:

Dashboard
Queue
Patients
Departments
Alerts
Analytics
Settings

Create responsive behavior.

Desktop should be the primary target.

Use mock authentication state only.
Do not create Supabase Auth, database, backend, or API calls.
```

---

# 9. PROMPT 08 — STAFF DASHBOARD

### Prompt

```text
Build the complete staff dashboard frontend.

FRONTEND ONLY.

Use realistic mock data.

Dashboard top statistics:

- Emergency
- Priority
- Routine
- Average Wait
- Longest Wait
- Total Waiting

Use RED/YELLOW/GREEN only for triage states.

Create a live queue section.

Queue table columns:

Token
Patient
Priority
Department
Arrival
Wait Time
Status
Action

Actions:
- Call
- View
- Reassign
- Complete

Use local mock state for button interactions.

Create an emergency alert panel.

Example:

EMERGENCY ALERT
Token A-104
Potential urgent case detected.
Department: General Medicine

Actions:
- View Patient
- Acknowledge

Alerts should remain visible until acknowledged.

Do not implement real-time Supabase Realtime.
Do not connect to backend.
```

---

# 10. PROMPT 09 — PATIENT DETAILS & DEPARTMENTS

### Prompt

```text
Build the staff patient-management frontend.

FRONTEND ONLY.

Create:

1. Patient List
2. Patient Details
3. Department View

PATIENT LIST:

Filters:
- Search
- Department
- Priority
- Status

Columns:
- Token
- Name
- Department
- Priority
- Status
- Waiting Time

PATIENT DETAILS:

Sections:
- Patient Information
- Visit Information
- Symptoms
- Triage Summary
- Queue Information
- Alerts

Use structured mock triage information.

Do not show raw AI model output.

DEPARTMENT VIEW:

Create configurable-looking department cards/list.

Example:
- General Medicine
- Pediatrics
- Orthopedics
- Emergency
- Dermatology

Do not hard-code architecture-dependent assumptions.

Use mock data only.
```

---

# 11. PROMPT 10 — QUEUE CONTROLS

### Prompt

```text
Improve the staff queue interface.

FRONTEND ONLY.

Implement local mock interactions for:

- Call Next
- Call Patient
- Mark In Progress
- Mark Done
- Skip
- Reassign

Show confirmation dialogs for destructive actions.

Example:

"Are you sure you want to skip A-104?"

[Cancel]
[Skip Patient]

Create visual state transitions for:

WAITING
→ CALLED
→ IN_PROGRESS
→ DONE

Also create a mock queue update animation.

Do NOT implement the actual queue algorithm.

Do NOT connect Supabase Realtime.

Do NOT create backend logic.
```

---

# 12. PROMPT 11 — ANALYTICS & NOTIFICATIONS

### Prompt

```text
Build frontend-only analytics and notifications.

ANALYTICS:

Show:
- Total patients
- Average waiting time
- Maximum waiting time
- Patients by priority
- Patients by department
- Completed visits
- Emergency alerts
- Queue throughput

Use simple charts/cards based on mock data.

NOTIFICATIONS:

Create:
- notification bell
- unread count
- notification dropdown/panel
- emergency notification
- queue update
- staff action notification

Use local mock data.

Do not connect to a notification service or backend.
Do not implement push notifications.
```

---

# 13. PROMPT 12 — ERROR, LOADING & EMPTY STATES

### Prompt

```text
Audit the entire frontend and add complete UI states.

FRONTEND ONLY.

Every asynchronous-looking operation should have:

- loading
- success
- error
- empty

Examples:

OCR:
"Reading document..."

AI:
"Analyzing your information..."

Ticket:
"Generating your token..."

Queue:
"Updating queue..."

Patient list:
"No patients found."

Emergency:
"Unable to notify staff. Please seek immediate assistance."

Network:
"Connection lost. We'll try to reconnect."

AI unavailable:
"The assistant is temporarily unavailable. Please continue with manual assistance."

Ensure users are never trapped on a blank or broken screen.

Use local mock state to demonstrate each state.
```

---

# 14. PROMPT 13 — ACCESSIBILITY & RESPONSIVENESS AUDIT

### Prompt

```text
Perform a complete frontend accessibility and responsive audit.

FRONTEND ONLY.

Check every patient and staff screen.

PATIENT/KIOSK:

- large touch targets
- high contrast
- large text
- clear focus
- readable instructions
- no horizontal scrolling
- simple language
- emergency action always accessible
- larger-text mode
- reduced motion

STAFF:

- keyboard navigation
- visible focus states
- accessible tables
- accessible dialogs
- non-color-only status indicators
- responsive sidebar
- responsive tables

Use icons plus text for priority states.

Do not rely only on RED/YELLOW/GREEN.

Fix any layout overflow, spacing inconsistency, poor contrast or inaccessible controls.

Do not introduce backend changes.
```

---

# 15. PROMPT 14 — FRONTEND CONSISTENCY & POLISH

### Prompt

```text
Perform a final visual and interaction polish pass across the entire frontend.

FRONTEND ONLY.

Do not add backend infrastructure.

Audit:

- spacing
- typography
- colors
- border radius
- shadows
- button hierarchy
- card consistency
- form consistency
- table consistency
- icon sizing
- responsive behavior
- loading states
- error states
- empty states
- transitions

Patient interface should feel:
- calm
- trustworthy
- simple
- accessible

Staff interface should feel:
- operational
- efficient
- information-rich

Remove:
- unnecessary gradients
- excessive animations
- decorative clutter
- duplicate components
- placeholder lorem ipsum
- inconsistent wording

Ensure every page looks like part of one real healthcare product.
```

---

# 16. PROMPT 15 — MOCK FLOW INTEGRATION

### Prompt

```text
Connect the entire frontend using LOCAL MOCK DATA ONLY.

IMPORTANT:
Do not create or connect any backend.

Create a realistic end-to-end demonstration:

WELCOME
→ LANGUAGE
→ REGISTRATION
→ ID/MANUAL
→ CONFIRMATION
→ SYMPTOMS
→ MOCK TRIAGE
→ MOCK PRIORITY
→ TICKET
→ QUEUE TRACKING

Also connect:

STAFF LOGIN
→ DASHBOARD
→ QUEUE
→ PATIENT DETAILS
→ ALERTS
→ DEPARTMENTS
→ ANALYTICS

Create mock scenarios:

1. Routine patient
2. High-priority patient
3. Emergency patient
4. Multiple patients in queue

Use frontend state/local mock JSON.

The goal is to make the application fully demonstrable without a backend.

Do not create a database, authentication service, API, Supabase or external integration.
```

---

# 17. PROMPT 16 — API-READY FRONTEND REFACTOR

Use this prompt **only after the visual frontend is complete**.

```text
Prepare the frontend for future backend integration without actually implementing the backend.

IMPORTANT:
Do NOT create:
- database
- authentication
- backend
- API endpoints
- server functions
- Supabase
- external APIs
- API keys

Refactor mock data access so it is separated from UI components.

Create frontend service interfaces such as:

patientService
visitService
triageService
queueService
staffService
alertService

For now, these services should return mock data only.

Example conceptual structure:

services/
├── patientService
├── visitService
├── triageService
├── queueService
├── staffService
└── alertService

Keep UI components independent from the mock-data implementation.

The purpose is to make it easy for Google Antigravity to replace these mock service functions with real REST/API clients later.

Do not implement the actual API.
```

---

# 18. PROMPT 17 — FINAL BACKEND-CONFLICT AUDIT

Use this as the **last Lovable prompt before moving to Antigravity**.

```text
Perform a strict frontend-only architecture audit.

This project will now be moved to Google Antigravity for complete backend development.

Check the entire project for ANY backend infrastructure or external-service dependency.

Remove or disable anything related to:

- Supabase
- database
- backend/server functions
- API routes
- real authentication
- real API calls
- Gemini
- OCR APIs
- Supabase Realtime
- push notifications
- external databases
- secret API keys
- production environment secrets

Replace backend-dependent functionality with mock/local frontend behavior.

The final Lovable project must be:

1. Frontend-only.
2. Runnable without a backend.
3. Runnable without external API keys.
4. Runnable without a database.
5. Runnable without any backend or Supabase.
6. Runnable without Supabase.
7. Fully navigable using mock data.
8. Structured for later REST/API integration.

Do NOT redesign the application.

Only remove backend dependencies and ensure the frontend is clean and API-ready.

At the end, provide a concise list of:
- backend dependencies removed
- mock services remaining
- pages completed
- components completed
- remaining work for Google Antigravity
```

---

# 19. Recommended Lovable Execution Order

Do not paste all prompts simultaneously.

Use them sequentially:

```text
01 Initial Foundation
        ↓
02 Kiosk Shell
        ↓
03 Welcome / Language / Accessibility
        ↓
04 Registration
        ↓
05 Symptom Experience
        ↓
06 Triage / Ticket
        ↓
07 Staff Login / Shell
        ↓
08 Staff Dashboard
        ↓
09 Patients / Departments
        ↓
10 Queue Controls
        ↓
11 Analytics / Notifications
        ↓
12 Loading / Error / Empty States
        ↓
13 Accessibility / Responsive Audit
        ↓
14 Visual Polish
        ↓
15 Mock Flow Integration
        ↓
16 API-Ready Refactor
        ↓
17 Backend-Conflict Audit
        ↓
              ANTIGRAVITY
```

---

# 20. Important Lovable Usage Rules

## Rule 1 — Never ask Lovable to build the backend

Do NOT prompt:

> "Connect this to Supabase."

Do NOT prompt:

> "Create authentication."

Do NOT prompt:

> "Create a database."

Do NOT prompt:

> "Connect Gemini."

Do NOT prompt:

> "Create API endpoints."

Those belong to Antigravity.

---

## Rule 2 — If Lovable automatically creates backend infrastructure

Immediately tell Lovable:

```text
Remove the backend infrastructure you just created.

This project is frontend-only.

Remove:
- database
- authentication
- Supabase/- server functions
- API integrations
- backend dependencies

Replace them with local mock data.

Do not change the visual design or page structure.
```

---

## Rule 3 — Mock everything

Examples:

```text
Mock login
Mock patients
Mock symptoms
Mock OCR
Mock triage
Mock queue
Mock alerts
Mock analytics
```

But keep the **data shape realistic**.

---

# 21. What We Want From Lovable

At the end of Lovable development, we should have:

```text
┌────────────────────────────────────────────┐
│              FRONTEND ONLY                 │
├────────────────────────────────────────────┤
│                                            │
│ Patient/Kiosk                              │
│ ├── Welcome                                │
│ ├── Registration                           │
│ ├── ID Scan                                │
│ ├── Manual Registration                    │
│ ├── Confirmation                           │
│ ├── Symptoms                               │
│ ├── Triage UI                              │
│ ├── Ticket                                 │
│ └── Queue Tracking                         │
│                                            │
│ Staff                                      │
│ ├── Login UI                               │
│ ├── Dashboard                              │
│ ├── Queue                                  │
│ ├── Patients                               │
│ ├── Departments                            │
│ ├── Alerts                                 │
│ └── Analytics                              │
│                                            │
│ Mock Data                                  │
│ Local State                                │
│ Responsive UI                              │
│ Accessibility                              │
│                                            │
└────────────────────────────────────────────┘
                     │
                     ▼
              GOOGLE ANTIGRAVITY
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Backend      Database       APIs
        │            │            │
        ├── Auth     │            ├── AI
        ├── OCR      │            ├── Vision
        ├── Triage   │            └── Other services
        ├── Queue    │
        ├── RBAC     │
        └── Supabase Realtime
```

---

# 22. Final Handoff Checklist

Before moving to Antigravity, confirm:

### Frontend

- [ ] Patient flow complete
- [ ] Staff flow complete
- [ ] Responsive
- [ ] Accessible
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Mock data
- [ ] Mock interactions
- [ ] Visual consistency

### Backend Conflict

- [ ] No database
- [ ] No Supabase
- [ ] No Supabase
- [ ] No real authentication
- [ ] No backend functions
- [ ] No real APIs
- [ ] No API keys
- [ ] No Gemini
- [ ] No OCR service
- [ ] No Supabase Realtime
- [ ] No real patient data
- [ ] No production secrets

### Handoff

- [ ] Frontend runs independently
- [ ] Mock services are separated from UI
- [ ] Components are reusable
- [ ] API-ready service boundaries exist
- [ ] Backend can be implemented independently in Antigravity

---

# 23. Final Architecture Rule

The entire development workflow is:

```text
                 LOVABLE
                    │
                    │
              FRONTEND ONLY
                    │
                    ▼
             API-READY UI
                    │
                    ▼
              ANTIGRAVITY
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     Backend     Database      APIs
        │           │           │
        ├─ Auth     │           ├─ AI
        ├─ OCR      │           ├─ Vision/OCR
        ├─ Triage   │           └─ Other approved APIs
        ├─ Queue    │
        ├─ RBAC     │
        └─ Realtime │
                    │
                    ▼
              FINAL SYSTEM
```

**Lovable creates the interface.  
Antigravity creates the actual application.**
