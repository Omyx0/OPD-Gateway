# Smart OPD Gateway — Comprehensive Project Report & Testing Guide

**Project Title:** Smart OPD: AI-Assisted Outpatient Department & Queue Management System  
**Version:** Milestone 1 (Working Full-Stack System)  
**Date:** August 2026  
**Repository Structure:** Monorepo (`server/`, `patient-pwa/`, `hospital-web/`, `supabase/`, `docs/`)

---

## 1. Executive Summary

The **Smart OPD Gateway** is an end-to-end digital outpatient healthcare platform designed to eliminate waiting-room congestion, automate clinical triage, and streamline the patient journey from check-in to consultation.

The system bridges two dedicated frontends through a centralized Node.js/Express backend, Supabase PostgreSQL database, and Google Gemini AI:
1. **Patient Progressive Web App (PWA):** Mobile-first application for patients to sign in, record symptoms with voice/text, receive instant AI triage priority assessments, and monitor live queue tokens in real-time.
2. **Hospital Staff Web Application:** Operational dashboard for hospital receptionists, triage nurses, and doctors to manage live queues, register walk-in patients, view clinical triage summaries, trigger audio calls, and advance patient consultation stages.
3. **Core Backend & AI Service:** RESTful API with Role-Based Access Control (RBAC), Gemini 2.5 Flash triage pipeline, automated queue token generation, and Supabase integration.

---

## 2. System Architecture & Tech Stack

```
                                  ┌───────────────────────────────┐
                                  │   Google Gemini 2.5 Flash     │
                                  │   (AI Triage Assessment)      │
                                  └───────────────▲───────────────┘
                                                  │
                                                  │ REST API
                                                  ▼
┌──────────────────────────┐      ┌───────────────────────────────┐      ┌──────────────────────────┐
│   Patient Mobile PWA     │◄────►│      Node.js / Express        │◄────►│   Hospital Staff Web     │
│   (React 19, Vite, PWA,  │ REST │      Backend API Engine       │ REST │   (React, TanStack Router│
│    Tailwind, Lucide)     │      │ (TypeScript, Zod, RBAC, Auth) │      │    TanStack Query, UI)   │
└──────────────────────────┘      └───────────────▲───────────────┘      └──────────────────────────┘
                                                  │
                                                  │ Supabase Client / Admin
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │     Supabase PostgreSQL       │
                                  │   Auth, PostGIS, 20 Tables    │
                                  └───────────────────────────────┘
```

### Technology Matrix

| Layer | Technologies Used | Key Responsibilities |
|---|---|---|
| **Patient PWA** | React 19, Vite, Tailwind CSS, Lucide Icons, Vite PWA | Mobile-first patient portal, symptom capture, voice transcription UI, live queue tracker |
| **Hospital Web App** | React, Vite, TanStack Router, TanStack Query, Tailwind CSS, Radix UI | Live queue management board, patient intake, department analytics, emergency alerts |
| **Backend Service** | Node.js, Express, TypeScript, Zod, Helmet, Morgan, CORS | RESTful APIs, JWT authentication, RBAC authorization middleware, error handling |
| **AI Intelligence** | Google Gemini API (`gemini-2.5-flash`) | Symptom entity extraction, clinical urgency classification (RED/YELLOW/GREEN), reasoning |
| **Database & Auth** | PostgreSQL (Supabase), PostGIS, Supabase Auth | Relational storage (profiles, visits, symptoms, queue_tickets, triage_assessments), Auth JWT |

---

## 3. Implemented Features & Modules

### 3.1 Patient Progressive Web App (PWA)
- **Ambient Healthcare Design System:** Glassmorphic cards, Geist typography, responsive layout optimized for mobile and desktop screens.
- **Patient Authentication:** Secure login and account registration via Supabase Auth with quick 1-click evaluation demo access (`patient@opd.com` / `demo123`).
- **Interactive Symptom Intake (`/dashboard/symptoms`):**
  - Text description area with simulated speech-to-text voice input.
  - Categorized quick symptom pills (Fever, Cough, Chest Pain, Headache, etc.).
  - 5-point severity intensity rating (Mild, Moderate, Severe, Critical Emergency).
  - Duration selector (Less than 24h, 1-3 days, 1 week, chronic).
- **Gemini AI Triage Assessment (`/dashboard/triage`):**
  - Real-time AI evaluation determining urgency (RED / YELLOW / GREEN).
  - Confidence percentage calculation and AI clinical reasoning summary.
  - Red-flag warning badges and automatic assigned department routing (e.g., General Practice, Cardiology).
- **Live Queue Tracking (`/dashboard/queue` & `/dashboard`):**
  - Hero queue token display (e.g., `A-101`) with pulsating active indicators.
  - Visual 4-step care journey tracker (Registration → AI Triage → Waiting Area → Consultation).
  - Prominent alert banner when patient is called to the consultation room.
- **Clinical Records & Profile (`/dashboard/records`, `/dashboard/profile`):**
  - Past consultations timeline, prescription chips, emergency contact numbers, and preferences.

### 3.2 Hospital Staff Web Application
- **Live Operations Dashboard (`/staff`):**
  - Real-time counters for Emergency (Red), Priority (Yellow), and Routine (Green) patients.
  - Average wait time and longest wait time tracking.
  - Direct "Call next patient" action with automatic priority sorting.
- **Queue Management Board (`/staff/queue`):**
  - Filterable by department (General Practice, Cardiology, ENT, Orthopaedics, etc.).
  - Interactive status transitions: `WAITING` → `CALLED` → `IN_PROGRESS` → `COMPLETED` / `SKIPPED`.
  - Department reassignment dropdown.
- **Patient Registration & Walk-In Intake (`/staff/patients/new`):**
  - Multi-step intake form with ID document upload dropzone.
  - Automatic visit creation and immediate queue token allocation.
- **Patient Details & Clinical Records (`/staff/patients/$patientId`):**
  - Real-time view of recorded symptoms, duration, and severity.
  - Complete AI triage summary including model confidence, red flags, and reasoning.
  - Alert acknowledgment panel.

### 3.3 Backend API & Database Wiring
- **RESTful Endpoints:**
  - `POST /api/v1/patients/me`, `GET /api/v1/patients/me`
  - `POST /api/v1/patients`, `GET /api/v1/patients`, `GET /api/v1/patients/:id`
  - `POST /api/v1/visits`, `GET /api/v1/visits/:id`, `PATCH /api/v1/visits/:id/status`
  - `POST /api/v1/visits/:id/symptoms`, `GET /api/v1/visits/:id/symptoms`
  - `POST /api/v1/triage/session`, `POST /api/v1/triage/extract`, `POST /api/v1/triage/assess`, `GET /api/v1/triage/:visitId`
  - `POST /api/v1/queue/tickets`, `GET /api/v1/queue`, `GET /api/v1/queue/my-status`, `PATCH /api/v1/queue/:id/status`, `POST /api/v1/queue/:id/call`
  - `GET /api/v1/departments`, `GET /api/v1/alerts`, `POST /api/v1/alerts/:id/acknowledge`
- **Role-Based Access Control:** Strict database-verified role enforcement (`PATIENT`, `STAFF`, `DOCTOR`, `ADMIN`).

---

## 4. Step-by-Step Testing & Verification Guide

Follow these exact steps to test and demonstrate all features across the full stack.

### Step 1: Verify Environment Configuration

Ensure `.env` files are configured in each folder:

1. **`server/.env`**:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   SUPABASE_URL=https://sjsghxacjgrxiboeygek.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   SUPABASE_ANON_KEY=eyJhbGciOi...
   GEMINI_API_KEY=AQ.Ab8RN6LbXd5V2AgbPiMSMAk83XDuRfDOD5-1_0NtTkfobJ0TPw
   GEMINI_TRIAGE_MODEL=gemini-2.5-flash
   ```

2. **`patient-pwa/.env`**:
   ```env
   VITE_SUPABASE_URL=https://sjsghxacjgrxiboeygek.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_API_URL=http://localhost:5000/api/v1
   ```

3. **`hospital-web/.env`**:
   ```env
   VITE_SUPABASE_URL=https://sjsghxacjgrxiboeygek.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_API_URL=http://localhost:5000/api/v1
   ```

---

### Step 2: Seed the Database

Run the database seed script to populate hospitals, departments (`GP`, `CARDIO`, `ENT`, `ORTHO`, etc.), and default demo user accounts:

```powershell
cd "e:\OPD Gateway\server"
npm run seed
```

**Expected Console Output:**
```
[INFO] Starting database seed...
[INFO] Using existing Hospital (...)
[INFO] Department General Practice (GP) already exists
[INFO] Processing user: patient@opd.com (PATIENT)
[INFO] Seed completed successfully!
```

---

### Step 3: Launch Services in 3 Terminals

Open 3 terminal windows to run all three services concurrently:

#### Terminal 1 — Backend Server
```powershell
cd "e:\OPD Gateway\server"
npm run dev
```
*Server runs at: `http://localhost:5000` (Health Check: `http://localhost:5000/health`)*

#### Terminal 2 — Hospital Staff Web Application
```powershell
cd "e:\OPD Gateway\hospital-web"
npm run dev
```
*Web App runs at: `http://localhost:5173` (or port specified in terminal)*

#### Terminal 3 — Patient PWA
```powershell
cd "e:\OPD Gateway\patient-pwa"
npm run dev
```
*PWA runs at: `http://localhost:5174` (or port specified in terminal)*

---

### Step 4: Verification Flow A — Patient PWA Check-In & AI Triage

1. Open `http://localhost:5174` in your browser.
2. Click **Start Registration** or click the top-right **Demo** badge.
3. On the Login screen, click **⚡ 1-Click Demo Patient Login** (or enter `patient@opd.com` / `demo123`).
4. You are redirected to the **Patient Dashboard**:
   - Notice the greeting, live department status cards, and the **Start OPD Check-In** hero banner.
5. Click **Start OPD Check-In** to navigate to `/dashboard/symptoms`:
   - Click the **Voice Input** button to simulate voice transcription, or type: `"Severe crushing chest pain radiating to left arm with breathlessness"`.
   - Tap symptom pills: **Chest Discomfort**, **Shortness of Breath**.
   - Set Severity to **5 (Critical / Emergency)**.
   - Click **Continue to AI Triage**.
6. On the **Triage Result** screen (`/dashboard/triage`):
   - Notice the live assessment from **Gemini AI**:
   - **Priority:** Emergency Priority (`RED`)
   - **Confidence:** e.g., `95%`
   - **AI Reasoning:** Clinical explanation describing acute cardiac symptoms.
   - **Red Flags:** e.g., `Chest discomfort radiating to arm`, `Shortness of breath`.
7. Click **View Live Queue Token**:
   - You are taken to the dashboard displaying your active token (e.g. `A-101`), marked with **Emergency Priority (RED)** and status `WAITING`.

---

### Step 5: Verification Flow B — Hospital Staff Live Queue & Management

1. Open `http://localhost:5173` in a second browser window (or incognito).
2. On the Staff Sign In screen, click **Staff Demo Credentials** (`staff@opd.com` / `demo123`).
3. You are redirected to the **Operations Dashboard** (`/staff`):
   - Notice the **Emergency (RED)** count incremented to reflect the patient from Flow A.
   - The active patient token (e.g., `A-101`) appears at the top of the queue table due to priority-weighted sorting.
4. Click **Call next patient** (or click **Call** on the row):
   - The ticket status changes to `CALLED`.
   - Switch back to the Patient PWA tab: notice the amber alert banner immediately notifying the patient that their number has been called!
5. Click **Start** in the Staff Web app:
   - The status updates to `IN_PROGRESS`.
6. Click **Done / Complete**:
   - The ticket status updates to `COMPLETED` and is cleared from the active queue.
7. Navigate to **Patients** (`/staff/patients`) and click on a patient record:
   - Verify the detailed view showing patient demographics, recorded symptoms, and complete Gemini AI triage assessment.

---

### Step 6: Verification Flow C — Walk-In Patient Registration from Reception

1. In the Staff Web App (`http://localhost:5173`), navigate to **Patients** → click **+ Register New Patient** (`/staff/patients/new`).
2. Fill in:
   - **Legal Full Name:** `John Doe`
   - **Date of Birth:** `1990-05-15`
   - **Biological Sex:** `Male`
   - **Primary Phone:** `9876543210`
3. Click **Complete Registration**:
   - The visit is created on the backend and automatically generates a new queue ticket (e.g., `A-102`).
4. Navigate to **Live Real-time Queue** (`/staff/queue`) to confirm John Doe is listed in `WAITING` status.

---

## 5. Automated Build Verification

To verify that the entire codebase is free of TypeScript and compilation errors, run the build command in each package:

```powershell
# 1. Backend Server Build
cd "e:\OPD Gateway\server"
npm run build

# 2. Patient PWA Build
cd "e:\OPD Gateway\patient-pwa"
npm run build

# 3. Hospital Web App Build
cd "e:\OPD Gateway\hospital-web"
npm run build
```

**Result:** All 3 packages compile with **0 errors**.

---

## 6. API Reference & Data Contracts

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/v1/patients/me` | `PATIENT`, `STAFF`, `DOCTOR`, `ADMIN` | Resolves authenticated patient profile |
| `POST` | `/api/v1/patients/me` | `PATIENT`, `STAFF`, `DOCTOR`, `ADMIN` | Self-provisions patient record on first sign-in |
| `POST` | `/api/v1/patients` | `STAFF`, `DOCTOR`, `ADMIN` | Creates new patient record (reception desk) |
| `GET` | `/api/v1/patients` | `STAFF`, `DOCTOR`, `ADMIN` | Lists patients with search & pagination |
| `GET` | `/api/v1/patients/:id` | `STAFF`, `DOCTOR`, `ADMIN` | Gets specific patient details |
| `POST` | `/api/v1/visits` | `STAFF`, `DOCTOR`, `ADMIN`, `PATIENT` | Creates visit and auto-generates queue ticket |
| `GET` | `/api/v1/visits/:id` | `STAFF`, `DOCTOR`, `ADMIN`, `PATIENT` | Retrieves visit record with department join |
| `POST` | `/api/v1/visits/:id/symptoms` | `STAFF`, `DOCTOR`, `ADMIN`, `PATIENT` | Submits symptoms for a visit |
| `GET` | `/api/v1/visits/:id/symptoms` | `STAFF`, `DOCTOR`, `ADMIN`, `PATIENT` | Gets symptoms list for a visit |
| `POST` | `/api/v1/triage/assess` | `STAFF`, `DOCTOR`, `ADMIN`, `PATIENT` | Runs Gemini AI triage assessment on symptoms |
| `GET` | `/api/v1/triage/:visitId` | `STAFF`, `DOCTOR`, `ADMIN`, `PATIENT` | Fetches saved triage assessment |
| `GET` | `/api/v1/queue` | `STAFF`, `DOCTOR`, `ADMIN` | Gets queue tickets with priority ordering |
| `GET` | `/api/v1/queue/my-status` | `PATIENT`, `STAFF`, `DOCTOR`, `ADMIN` | Gets active queue tickets for current user |
| `POST` | `/api/v1/queue/:id/call` | `STAFF`, `DOCTOR`, `ADMIN` | Calls patient to consultation room |
| `PATCH` | `/api/v1/queue/:id/status` | `STAFF`, `DOCTOR`, `ADMIN` | Updates ticket status (`WAITING`, `CALLED`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`) |
| `GET` | `/api/v1/departments` | `PATIENT`, `STAFF`, `DOCTOR`, `ADMIN` | Lists active hospital departments |
| `GET` | `/api/v1/alerts` | `STAFF`, `DOCTOR`, `ADMIN` | Lists emergency and operational alerts |
| `POST` | `/api/v1/alerts/:id/acknowledge` | `STAFF`, `DOCTOR`, `ADMIN` | Acknowledges active alert |

---

## 7. Default Credentials for Evaluation

| Role | Email | Password | Primary Interface |
|---|---|---|---|
| **Patient** | `patient@opd.com` | `demo123` | Patient PWA (`http://localhost:5174`) |
| **Reception Staff** | `staff@opd.com` | `demo123` | Hospital Web (`http://localhost:5173`) |
| **Doctor** | `doctor@opd.com` | `demo123` | Hospital Web (`http://localhost:5173`) |
| **Admin** | `admin@opd.com` | `demo123` | Hospital Web (`http://localhost:5173`) |

---

## 8. Summary of Milestones Achieved

- ✅ **Full-Stack Connectivity:** Seamless REST communication between Patient PWA, Hospital Staff Web, and Node.js backend.
- ✅ **Real Gemini AI Integration:** Production integration with Google Gemini 2.5 Flash for symptom intelligence and clinical triage priority determination.
- ✅ **Dynamic Priority Queue:** Automated token assignment with emergency priority sorting (`RED` > `YELLOW` > `GREEN`).
- ✅ **Production Quality UI/UX:** Glassmorphic mobile-first PWA and real-time operations dashboard with zero compilation or lint errors.
- ✅ **Clean Repository Structure:** All legacy documentation archived to `/docs`, central project report in root.
