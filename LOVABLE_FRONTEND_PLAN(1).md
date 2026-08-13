# LOVABLE FRONTEND BUILD PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 02 / 14  
**Purpose:** Complete frontend/UI implementation plan for Lovable  
**Next stage:** Google Antigravity for refinement, integration and full application development  
**Application:** Web application only

---

# 1. Purpose of This Document

This document defines exactly what should be built in **Lovable** before the project is moved to Google Antigravity.

Lovable's responsibility is **STRICTLY frontend/UI only**:

- UI/UX
- Page structure
- Reusable frontend components
- Navigation
- Responsive layouts
- Static/mock data for visual demonstration
- Forms and form UI
- Loading/error/empty states
- Accessibility-oriented UI
- Patient/kiosk workflow
- Staff dashboard

### IMPORTANT: FRONTEND-ONLY RULE

**Lovable must NOT create, configure, or depend on its own backend infrastructure.**

Lovable often attempts to automatically add or configure features such as:

- Authentication
- Database
- Backend services
- Supabase
- Server-side functions
- API integrations
- Database schemas
- User accounts
- Persistent application state
- Backend workflows

For this project, these must **NOT** be implemented by Lovable.

The reason is that our actual backend, database, authentication, AI services, APIs, queue engine, and real-time infrastructure will be designed and implemented later in **Google Antigravity**. If Lovable creates its own backend/auth/database stack, it can conflict with the final architecture and create unnecessary migration, dependency, and integration problems.

Therefore:

> **Lovable = Frontend only. No real backend. No real database. No real authentication. No real API keys. No production integrations.**

Lovable should use **mock/local frontend data only** to demonstrate the complete UI flow.

### Lovable MUST NOT

- Create a real database.
- Create database tables/collections.
- Configure Supabase.
- Implement real JWT authentication.
- Create backend/server functions.
- Create API routes.
- Store real patient data.
- Add real AI API keys.
- Connect Gemini or other external AI APIs.
- Implement the real OCR service.
- Implement the real queue algorithm.
- Implement Supabase Realtime.
- Implement real notifications.
- Create production environment variables containing secrets.
- Build backend business logic.

### Lovable MAY

Lovable may create **frontend-only mock behavior** such as:

- Mock login screen
- Mock patient records
- Mock queue data
- Mock triage responses
- Mock OCR results
- Mock alerts
- Mock analytics
- Local component state
- Static JSON/mock data

These are only for visualizing and testing the frontend.

They must be structured so they can later be replaced by real API calls in Antigravity without redesigning the UI.

### Backend Integration Starts ONLY After Lovable

The correct architecture is:

```text
                    LOVABLE
                       │
                       │
                 FRONTEND ONLY
                       │
                       ▼
              ┌─────────────────┐
              │ Google          │
              │ Antigravity     │
              └────────┬────────┘
                       │
             Real Application Logic
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   Backend          Database        External APIs
       │               │                │
       ├── Auth        │                ├── AI
       ├── OCR         │                ├── Vision/OCR
       ├── Triage      │                └── Other approved APIs
       ├── Queue       │
       ├── Supabase Realtime │
       └── RBAC        │
```

The Lovable project should therefore be treated as a **UI prototype/frontend foundation**, not as the final application backend.


Lovable should **not** be responsible for any backend infrastructure, authentication, database, API integration, secure API-key handling, medical safety logic, real-time infrastructure, or final AI implementation.

The existing project plan explicitly defines the workflow as **Lovable → Google Antigravity → backend hardening**, and recommends building the kiosk shell and staff dashboard in Lovable first. fileciteturn1file0L3-L5 fileciteturn1file0L108-L112

---

# 2. Frontend Goals

The frontend must feel like a real hospital product rather than a generic SaaS dashboard.

Primary goals:

1. Make patient registration extremely simple.
2. Minimize the number of decisions shown on each screen.
3. Make the kiosk usable by elderly and stressed patients.
4. Clearly communicate progress.
5. Make emergency assistance immediately accessible.
6. Make AI interaction natural and understandable.
7. Make the final token/ticket screen extremely clear.
8. Give staff a fast operational dashboard.
9. Make priority states visually obvious.
10. Keep the architecture clean enough to continue development in Antigravity.

---

# 3. Design Philosophy

The frontend has **two distinct surfaces**:

## Patient/Kiosk

Mood:

- Calm
- Reassuring
- High contrast
- Minimal
- Spacious
- Accessible
- Touch-friendly

The existing design blueprint explicitly recommends a calm, high-contrast and restrained patient interface because patients may be stressed, elderly or unwell. fileciteturn1file0L13-L18

## Staff Dashboard

Mood:

- Dense
- Fast-scanning
- Information-rich
- Operational
- Real-time

Staff need to understand queue conditions quickly rather than experience a decorative interface. fileciteturn1file0L41-L49

---

# 4. Recommended Frontend Stack

Use the existing project direction:

- React
- Vite
- Tailwind CSS v4
- shadcn/ui
- Lucide icons
- Framer Motion
- React Router if routing is required

The existing plan recommends Tailwind CSS v4, shadcn/ui, Framer Motion and Lucide, with motion reserved for meaningful state transitions rather than decoration. fileciteturn1file0L20-L25

Do not introduce another UI framework unless a real implementation requirement appears.

---

# 5. Design Tokens

Create the design system before building individual pages.

## Primary Brand

Use a restrained:

- Deep navy
- Deep teal
- Neutral white
- Neutral gray

The primary brand color should communicate trust without competing with triage colors.

## Triage Colors

```text
RED
Emergency / immediate attention

YELLOW
Priority / attention required

GREEN
Routine / normal priority
```

RED/YELLOW/GREEN must be reserved primarily for operational status. Do not use them randomly for decorative cards or backgrounds.

This follows the existing recommendation to keep triage colors semantically meaningful. fileciteturn1file0L28-L28

---

# 6. Typography

Use one primary typeface throughout the product.

Recommended:

- Inter or equivalent humanist/grotesk sans-serif

Avoid mixing multiple display fonts.

## Patient hierarchy

```text
Page heading
↓
Instruction
↓
Input
↓
Helper text
```

Use large typography for:

- Welcome message
- Questions
- Patient name confirmation
- Ticket number
- Estimated waiting time
- Department

---

# 7. Spacing & Touch Targets

Patient UI should prioritize touch interaction.

Requirements:

- Large buttons
- Large input fields
- Generous spacing
- Minimal dense forms
- No tiny icon controls
- Clear primary/secondary actions

Avoid placing many controls beside each other.

The existing kiosk principle is **one decision per screen**. fileciteturn1file0L30-L36

---

# 8. Global Kiosk Shell

Build this first.

Component:

```text
<KioskShell>
    <KioskHeader />
    <ProgressIndicator />
    <MainContent />
    <EmergencyHelpButton />
</KioskShell>
```

## Header

Show:

- Project/hospital branding
- Current language
- Accessibility control
- Optional session indicator

Do not overload the header.

## Progress Indicator

Use:

```text
Welcome → Registration → Symptoms → Ticket
```

The current step should be obvious.

The existing plan identifies a persistent four-stage progress indicator as one of the most important kiosk UX improvements. fileciteturn1file0L30-L34

## Emergency Button

Always visible:

**“I Need Help Now”**

It should be visually distinct but not alarming.

The button must exist independently of the AI triage flow. fileciteturn1file0L36-L37

---

# 9. Patient Flow — Complete Page List

Create these screens:

```text
1. Welcome
2. Language Selection
3. Accessibility
4. Registration Method
5. ID Scan
6. Manual Registration
7. Patient Confirmation
8. Symptom Introduction
9. AI Symptom Chat
10. Triage Processing
11. Triage/Queue Status
12. Ticket
13. Queue Tracking
14. Completion
```

Some screens can be combined if the final UX becomes simpler. Do not create screens merely to increase page count.

---

# 10. Welcome Screen

## Goal

Immediately communicate:

- What the system does
- What the patient needs to do
- Where to start

## UI

Large:

**Welcome to OPD**

Supporting message:

> Register, share your symptoms, and receive your OPD queue token.

Primary CTA:

**Start Registration**

Secondary controls:

- Language
- Accessibility
- Help

Emergency action:

**I Need Help Now**

## Requirements

- Very large CTA
- Minimal text
- Strong contrast
- No unnecessary animation

---

# 11. Language Selection

Provide the final approved language list.

Initial design should support:

```text
English
Hindi
Regional Language
```

Do not hard-code a large number of languages until the backend/translation plan confirms what will actually be supported.

UI:

```text
Choose your language

[ English ]
[ हिन्दी ]
[ Regional Language ]
```

Language selection should update the interface consistently.

---

# 12. Accessibility Mode

Provide:

- Larger text
- Higher contrast
- Reduced motion
- Voice preference
- Clearer button labels

Accessibility should be available before registration rather than hidden deep inside settings.

The existing plan specifically recommends a larger-text toggle on the welcome screen. fileciteturn1file0L38-L39

---

# 13. Registration Method Screen

Present two clear options:

```text
How would you like to register?

[ Scan ID ]
[ Enter Details Manually ]
```

Optional:

```text
[ Walk-in / Continue without ID ]
```

The UI must make clear that manual registration is a legitimate fallback, not an error state.

---

# 14. ID Scan Screen

## Purpose

Provide a frontend interface for future OCR integration.

## UI

```text
Scan your ID

┌───────────────────────────────┐
│                               │
│       Camera Preview          │
│                               │
│     [ Scan Document ]         │
│                               │
└───────────────────────────────┘

Tips:
• Keep the document inside the frame
• Ensure sufficient lighting
• Avoid glare
```

## States

### Initial

Camera permission / scan CTA.

### Scanning

```text
Scanning...
```

### Processing

```text
Reading document...
```

### Success

Show extracted information for confirmation.

### Failure

```text
We couldn't read the document.

[ Try Again ]
[ Enter Details Manually ]
```

Lovable should create these states with mock OCR data.

The actual Gemini Vision/OCR implementation belongs in Antigravity/backend.

---

# 15. Manual Registration Screen

Keep the form short.

Potential fields:

- Full name
- Date of birth / age
- Gender if required
- Mobile number
- Address if actually required
- Optional insurance information

Do not collect unnecessary information.

## Validation UI

Show:

- Required field indicators
- Inline validation
- Clear error messages
- Input formatting
- Loading state

---

# 16. Patient Confirmation

Before proceeding:

```text
Please confirm your details

Name: Rahul Sharma
Age: 42
Mobile: XXXXXXXX21

[ Everything is correct ]
[ Edit details ]
```

This step prevents OCR mistakes from silently entering the database.

---

# 17. Symptom Introduction Screen

Explain the AI interaction simply.

Example:

> Tell us how you are feeling. You can speak or type in your preferred language.

Primary CTA:

**Start**

Secondary:

**I Need Help Now**

Include a clear safety disclaimer:

> This assistant provides preliminary triage support and does not replace a medical professional.

Do not overwhelm the patient with technical AI terminology.

---

# 18. AI Symptom Chat UI

This is one of the most important screens.

The existing plan recommends **voice-first, text-fallback** interaction. fileciteturn1file0L34-L36

## Primary UI

Large central voice interaction:

```text
        ┌─────────────┐
        │             │
        │  Voice Orb  │
        │             │
        └─────────────┘

     Listening...
```

Below:

```text
[ Type instead ]
```

## Chat States

### Idle

```text
Tap to speak
```

### Listening

```text
Listening...
```

### Processing

```text
Understanding your response...
```

### AI Response

Display one question at a time.

### Error

```text
We couldn't hear that clearly.

[ Try Again ]
[ Type Instead ]
```

Do not show a large multi-message chat history by default. The patient should focus on one question at a time.

---

# 19. Voice Interaction UI

Lovable should build the visual interaction only.

Include:

- Voice orb
- Waveform
- Listening animation
- Processing state
- Speaking state
- Stop button
- Text fallback

Do not implement actual WebRTC/STT logic in Lovable.

Antigravity will later connect browser Web Speech API or the final approved speech service.

---

# 20. Emergency Escape Flow

The emergency button must work independently of the normal symptom conversation.

Flow:

```text
I Need Help Now
       ↓
Emergency Confirmation
       ↓
Notify Staff
       ↓
Show Clear Instruction
```

Example:

> Please remain here. A staff member has been alerted.

The interface must never suggest that the patient should wait for the AI if they indicate an immediate emergency.

---

# 21. Triage Processing Screen

After symptom collection:

```text
Reviewing your information...

Please wait.
```

Do not show internal AI reasoning.

Do not expose raw model output.

Use a simple progress indicator.

---

# 22. Triage Result UI

The patient does not need to see complex medical scoring.

Show an appropriate operational message such as:

```text
Your information has been assessed.

Priority: High

A hospital staff member will assist you shortly.
```

For emergency cases:

```text
Please remain here.

Hospital staff have been alerted.
```

Avoid saying:

> “You have disease X.”

---

# 23. Ticket Screen

This is the most important visual payoff.

The existing design specifically recommends making the ticket screen the calmest and clearest screen, with token, estimated wait and department in very large type. fileciteturn1file0L37-L38

Example:

```text
YOUR OPD TOKEN

       A-104

Department
General Medicine

Estimated Wait
18 minutes

Patients Ahead
4
```

Primary action:

**Track My Queue**

Optional:

**Print / Save Ticket**

---

# 24. Queue Tracking Screen

Show:

- Token number
- Current serving token
- Patients ahead
- Estimated wait
- Department
- Current status

Example:

```text
Your Token
A-104

Now Serving
A-100

Patients Ahead
3

Estimated Wait
14 min

Status
WAITING
```

When called:

```text
PLEASE PROCEED TO
ROOM 3
```

Use real-time visual updates later through Supabase Realtime.

---

# 25. Completion Screen

After consultation/flow completion:

```text
Your OPD process is complete.

Thank you.

[ Return to Home ]
```

Keep it simple.

---

# 26. Staff Dashboard Architecture

Build:

```text
StaffShell
├── Sidebar
├── TopBar
├── LiveStats
├── QueuePanel
├── AlertsPanel
└── MainContent
```

---

# 27. Staff Login

Requirements:

- Email/username
- Password
- Show/hide password
- Validation
- Loading state
- Invalid credentials state
- Session state

Do not implement production authentication in Lovable.

Use mock login initially.

---

# 28. Staff Sidebar

Navigation:

```text
Dashboard
Queue
Patients
Departments
Alerts
Analytics
Settings
```

Show role-based navigation later.

The sidebar should collapse for smaller screens.

---

# 29. Staff Dashboard Overview

Top statistics:

```text
RED / Emergency
YELLOW / Priority
GREEN / Routine
Average Wait
Longest Wait
Total Waiting
```

The existing plan explicitly recommends these live operational counts. fileciteturn1file0L45-L47

---

# 30. Live Queue Table

Columns:

```text
Token
Patient
Priority
Department
Arrival
Wait Time
Status
Action
```

Example actions:

```text
Call
Reassign
Complete
View
```

Use shadcn DataTable-style UI.

The queue table should replace an alerts-only staff view. fileciteturn1file0L47-L47

---

# 31. Priority Indicators

Use:

```text
RED    Emergency
YELLOW Priority
GREEN  Routine
```

Always combine color with text/icon.

Never rely only on color because of accessibility.

Example:

```text
🔴 EMERGENCY
🟡 PRIORITY
🟢 ROUTINE
```

---

# 32. Emergency Alert Layer

Emergency alerts should appear as prominent persistent alerts.

Example:

```text
EMERGENCY ALERT

Token A-104
Potential urgent case detected.

Department: General Medicine

[ View Patient ]
[ Acknowledge ]
```

Alerts should not disappear instantly.

The existing plan recommends persistent toast/banner alerts rather than a passive feed item. fileciteturn1file0L47-L49

---

# 33. Patient Details Page

Show only information staff are authorized to access.

Sections:

```text
Patient Information
Visit Information
Symptoms
Triage Summary
Queue Information
Alerts
Audit Information
```

The frontend should display structured AI output rather than raw model responses.

---

# 34. Department View

Allow staff to filter:

```text
General Medicine
Pediatrics
Orthopedics
Emergency
Dermatology
...
```

The actual department list should be configurable rather than hard-coded permanently.

---

# 35. Queue Controls

Staff actions:

```text
Call Next
Call Patient
Mark In Progress
Mark Done
Skip
Reassign
```

Potentially dangerous actions should require confirmation.

Example:

```text
Are you sure you want to skip A-104?

[ Cancel ]
[ Skip Patient ]
```

---

# 36. Analytics UI

Initial semester analytics:

- Total patients
- Average waiting time
- Maximum waiting time
- Patients by priority
- Patients by department
- Completed visits
- Emergency alerts
- Queue throughput

Avoid complex predictive analytics in the initial frontend.

---

# 37. Notification UI

Provide:

- Notification bell
- Unread count
- Emergency notification
- Queue update
- Staff action notification

The actual notification infrastructure will be implemented later.

---

# 38. Loading States

Every asynchronous screen must have a designed loading state.

Examples:

```text
Reading document...
Analyzing symptoms...
Generating ticket...
Updating queue...
Loading patients...
```

Do not use generic blank screens.

---

# 39. Error States

Every major workflow needs an error state.

Examples:

### OCR failure

```text
We couldn't read your document.
[Try Again]
[Enter Manually]
```

### AI unavailable

```text
The assistant is temporarily unavailable.

You can continue with manual assistance.

[Continue]
```

### Network failure

```text
Connection lost.

We'll try to reconnect automatically.
```

### Queue update failure

```text
Unable to refresh queue.

[Try Again]
```

Never leave patients trapped on an error screen.

---

# 40. Empty States

Staff dashboard examples:

```text
No patients waiting.
```

```text
No emergency alerts.
```

```text
No patients found.
```

Use helpful explanations rather than blank tables.

---

# 41. Responsive Design

Although the primary patient interface may run on kiosk-sized displays, the web application must still support:

- Desktop
- Tablet
- Mobile-width browser

Staff dashboard:

- Desktop-first
- Tablet-compatible
- Mobile fallback for essential monitoring

Patient UI:

- Touch-first
- Large controls
- No horizontal scrolling
- Flexible viewport layout

---

# 42. Animation Rules

Use Framer Motion only for meaningful state transitions:

- Step changes
- Triage processing
- Priority reveal
- Alert arrival
- Ticket transition

Avoid:

- Constant floating elements
- Excessive gradients
- Decorative movement
- Long loading animations

The existing plan specifically recommends motion that communicates state rather than entertainment. fileciteturn1file0L21-L24

---

# 43. Mock Data Strategy

Lovable should use realistic mock data.

Example patient:

```json
{
  "token": "A-104",
  "name": "Rahul Sharma",
  "department": "General Medicine",
  "priority": "YELLOW",
  "status": "WAITING",
  "waitMinutes": 18
}
```

Use multiple patients to demonstrate queue ordering.

Mock data must be structured so it can later be replaced by API responses without rewriting the UI.

---

# 44. Frontend State Model

At the Lovable stage, establish logical state boundaries.

Patient session state:

```text
language
accessibilityMode
registrationMethod
patientData
visitData
symptoms
triageStatus
triageResult
ticket
queueStatus
```

Staff state:

```text
authenticatedUser
department
patients
queue
alerts
notifications
analytics
```

Do not place all state in one giant global object.

---

# 45. Reusable Components

Build reusable components instead of page-specific duplicates.

Recommended:

```text
Button
Input
Select
Modal
Toast
Badge
StatusBadge
PriorityBadge
Card
StatCard
DataTable
EmptyState
ErrorState
LoadingState
ProgressIndicator
EmergencyButton
TicketCard
QueueCard
PatientCard
AlertCard
```

---

# 46. Frontend File Structure

Recommended target:

```text
client/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── kiosk/
│   │   └── staff/
│   ├── pages/
│   │   ├── kiosk/
│   │   └── staff/
│   ├── layouts/
│   ├── hooks/
│   ├── api/
│   ├── services/
│   ├── utils/
│   ├── constants/
│   ├── types/
│   ├── App.jsx
│   └── main.jsx
└── ...
```

Lovable may generate a slightly different structure. The final structure will be normalized in Antigravity.

---

# 47. Lovable Build Sequence

Build in exactly this order:

## Step 1 — Design System

Create:

- Colors
- Typography
- Spacing
- Buttons
- Forms
- Status badges
- Cards
- Alerts
- Tables

## Step 2 — Kiosk Shell

Create:

- Header
- Progress indicator
- Emergency button
- Main content container

## Step 3 — Welcome + Language

Build:

- Welcome
- Language
- Accessibility

## Step 4 — Registration

Build:

- Registration method
- ID scan
- Manual entry
- Confirmation

## Step 5 — Symptom Experience

Build:

- Introduction
- Voice-first chat
- Text fallback
- Listening/processing states
- Emergency escape

## Step 6 — Triage + Ticket

Build:

- Processing
- Triage status
- Ticket
- Queue tracking
- Completion

## Step 7 — Staff Shell

Build:

- Login
- Sidebar
- Header

## Step 8 — Dashboard

Build:

- Stats
- Queue table
- Alerts
- Patient details

## Step 9 — Advanced Staff UI

Build:

- Departments
- Queue actions
- Analytics
- Notifications

## Step 10 — Responsive & Accessibility

Audit every screen.

## Step 11 — Mock Integration

Connect screens with realistic mock state.

## Step 12 — Final Visual Polish

Fix:

- spacing
- typography
- alignment
- hierarchy
- empty states
- errors
- loading
- transitions

---

# 48. Lovable Completion Criteria

Do not move to Antigravity until the **frontend-only prototype** is visually and functionally complete.

Before handoff, verify that Lovable has **not introduced any unwanted backend dependency**.

### Backend Cleanup Check

Before exporting/moving the project:

- Remove/disable any Lovable-created backend.
- Remove/disable any Supabase integration created by Lovable. The real Supabase infrastructure will be created later in Antigravity.
- Remove real authentication implementations.
- Remove real database connections.
- Remove real API keys/secrets.
- Remove server-side functions.
- Replace backend-dependent behavior with mock/local data.
- Ensure the frontend can run independently as a UI prototype.
- Keep API-facing service boundaries easy to implement later in Antigravity.

Only after this check should the project be moved to Antigravity.


### Patient

- Full patient journey can be clicked through.
- Registration has validation.
- ID scan has all states.
- Manual fallback works.
- Symptom chat is visually complete.
- Emergency button works in mock flow.
- Ticket is clearly displayed.
- Queue screen exists.

### Staff

- Login works with mock credentials.
- Dashboard is complete.
- Queue table works with mock data.
- Priority badges work.
- Emergency alerts work.
- Patient detail page exists.
- Department filtering works.
- Basic analytics UI exists.

### Quality

- No broken routes.
- No obvious placeholder text.
- No inconsistent components.
- Responsive layout works.
- Keyboard navigation works where relevant.
- Large touch targets.
- No inaccessible icon-only controls.
- Loading/error/empty states exist.

---

# 49. What Happens After Lovable

Once the frontend is visually complete:

```text
LOVABLE
   ↓
Export / Connect Repository
   ↓
ANTIGRAVITY
   ↓
Code Audit
   ↓
Component Cleanup
   ↓
State Management
   ↓
API Client
   ↓
Backend Integration
   ↓
Database
   ↓
Authentication
   ↓
OCR
   ↓
AI Triage
   ↓
Queue Engine
   ↓
Supabase Realtime
   ↓
Testing
   ↓
Deployment
```

The existing roadmap similarly places frontend hardening, API-client integration and voice/Supabase Realtime work in the Antigravity stage. fileciteturn1file0L114-L117

---

# 50. Final Principle

Lovable should produce a **high-quality, realistic and complete frontend foundation — and nothing beyond the frontend**.

The frontend must remain independent of:
- Supabase Auth
- Supabase PostgreSQL
- PostGIS
- Supabase Realtime
- Socket.io
- JWT authentication
- RBAC
- Gemini API
- bcrypt
until Antigravity integration.


The most important handoff rule is:

> **Do not let Lovable create the application's real backend.**

Any automatically generated authentication, database, Supabase setup, server functions, API integrations, or backend workflows must be avoided or removed before the project enters Antigravity.

The frontend should be designed as an API-ready client with mock data, so that the real architecture can be implemented cleanly afterward.


It should not attempt to solve the entire application.

The correct division is:

```text
LOVABLE
UI + UX + Components + Mock Flow
             ↓
ANTIGRAVITY
Architecture + State + APIs + Backend
             ↓
AI/DATA
Triage + Dataset + Evaluation
             ↓
INTEGRATION
Queue + Real-Time + Security
             ↓
FINAL PRODUCT
Tested Smart Digital OPD System
```

The objective is to make the Lovable output good enough that Antigravity can focus on engineering rather than redesigning the entire product.
