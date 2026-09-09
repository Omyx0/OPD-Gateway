# Smart Digital OPD System — Live Deployed Testing & Verification Guide

This guide is specifically tailored for testing and verifying the **fully deployed, production-hosted Smart Digital OPD System** across its live URLs.

---

## 1. Live Deployment Directory & Endpoints

| Service / App | Platform | Live Production URL | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend REST API** | Render | `https://opd-gateway.onrender.com` | Central API engine, Gemini AI proxy, Socket.io |
| **API Health Check** | Render | `https://opd-gateway.onrender.com/health` | Service status verification |
| **Hospital Web Portal** | Vercel | `https://opd-gateway-server.vercel.app` | Staff Reception, Clinician Clinic, Admin Portal, Kiosk |
| **Patient PWA App** | Vercel | `https://opd-gateway.vercel.app` | Patient self-check-in, live token, indoor map |
| **Supabase Database** | Supabase Cloud | `https://sjsghxacjgrxiboeygek.supabase.co` | PostgreSQL database, Authentication, RLS |

> [!NOTE]
> **Render Free Tier Spin-Up**:
> If the backend on Render has been idle, the first request may take ~30–50 seconds while the container spins up. Open `https://opd-gateway.onrender.com/health` in your browser first. Once it returns `{"status":"ok"}`, the backend is awake and fast.

---

## 2. What To Do With `supabase/migrations/` SQL Queries?

The `supabase/migrations/` folder contains two database migration files:
1. `supabase/migrations/002_map_and_consultation.sql`
2. `supabase/migrations/003_rls_policies.sql`

### Why They Are Mandatory:
- **`002_map_and_consultation.sql`**: Creates the `doctor_departments` junction table (needed for multi-specialization doctors), the `clinical_records` table (needed for saving the clinician's SOAP notes and diagnoses), the indoor navigation tables (`buildings`, `floors`, `rooms`, `map_edges`), and `system_settings`.
- **`003_rls_policies.sql`**: Enables Row-Level Security (RLS) policies on these tables so that patients only see their own clinical records, while doctors and staff have secure clinical access.

### Step-by-Step Execution in Supabase:
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project: **`sjsghxacjgrxiboeygek`**.
3. In the left navigation bar, click on **SQL Editor** (the `>_` terminal icon).
4. Click **"New Query"**:
   - Open [`supabase/migrations/002_map_and_consultation.sql`](./supabase/migrations/002_map_and_consultation.sql).
   - Copy all contents, paste into the Supabase SQL Editor, and click **"Run"** (green button).
   - Verify it outputs `Success. No rows returned`.
5. Click **"New Query"** again:
   - Open [`supabase/migrations/003_rls_policies.sql`](./supabase/migrations/003_rls_policies.sql).
   - Copy all contents, paste into the Supabase SQL Editor, and click **"Run"**.
   - Verify it outputs `Success. No rows returned`.

✅ Your cloud database is now fully prepared for multi-department doctors, SOAP clinical documentation, and indoor map navigation!

---

## 3. Pre-Configured Test Accounts (Live Cloud)

When signing in on the deployed links, use the following credentials or register new accounts:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hospital.com` | `demo123` | `https://opd-gateway-server.vercel.app/staff/admin` |
| **Doctor** | `doctor.cardio@hospital.com` | `demo123` | `https://opd-gateway-server.vercel.app/staff/consultation` |
| **Staff** | `staff.reception@hospital.com` | `demo123` | `https://opd-gateway-server.vercel.app/staff/queue` |
| **Patient** | `patient.live@gmail.com` | `demo123` | `https://opd-gateway.vercel.app/dashboard` |

---

## 4. Live Verification by Role & Feature

---

### Phase 1: Live Backend & API Verification

1. Open your browser and navigate to:
   ```
   https://opd-gateway.onrender.com/health
   ```
2. Verify the JSON response:
   ```json
   {
     "success": true,
     "data": {
       "status": "ok",
       "timestamp": "...",
       "environment": "development"
     }
   }
   ```
3. Test the live departments endpoint:
   ```
   https://opd-gateway.onrender.com/api/v1/departments
   ```
   Verify it returns the list of active clinical departments (General Practice, Cardiology, Orthopedics, Emergency Medicine, etc.).

---

### Phase 2: Hospital Administration Portal (Admin Role)

1. Open **`https://opd-gateway-server.vercel.app/login`**.
2. Sign in with:
   - Email: `admin@hospital.com`
   - Password: `demo123`
3. Notice the **ADMIN** badge next to the user name in the top header.
4. Click **"Admin Portal"** in the sidebar (route: `/staff/admin`).
5. **Test Doctor Multi-Specialization Configuration**:
   - In the **"Doctor Specializations & Units"** tab, locate doctor `doctor.cardio@hospital.com`.
   - Click **"Configure Units & Specializations"**.
   - Check multiple departments: e.g. **"Cardiology"** AND **"General Practice"**.
   - Click **"Save Specializations"**.
   - Verify toast confirmation: *"Doctor department specializations assigned!"*.
6. **Test Role Management**:
   - Switch to the **"Role Management"** tab.
   - Change or promote any staff user's role using the dropdown (`STAFF`, `DOCTOR`, `ADMIN`).
7. **Test Live Audit Trail**:
   - Switch to the **"Live Audit Trail"** tab.
   - Verify that all system and clinical actions (`USER_ROLE_UPDATED`, `DOCTOR_DEPARTMENTS_ASSIGNED`, etc.) appear with timestamps and actor emails.

---

### Phase 3: Staff Reception & Live Queue (Staff Role)

1. Sign in with `staff.reception@hospital.com` on **`https://opd-gateway-server.vercel.app`**.
2. Notice the **STAFF** badge in the header.
3. **Test Walk-In Patient Registration (`/staff/patients/new`)**:
   - Click **"Patients"** → **"New Registration"**.
   - Enter:
     - Name: `Ananya Roy`
     - Age: `34`, Gender: `Female`
     - Phone: `9876541230`
     - Department: `Cardiology`
     - Priority: `RED`
     - Symptoms: `Acute retrosternal chest pain, cold sweating, breathing difficulty`
   - Click **"Complete Registration & Issue Token"**.
   - Verify a new token is created (e.g. `A-104`).
4. **Test Live Queue Table (`/staff/queue`)**:
   - Verify token `A-104` appears with a red emergency badge.
   - Filter by department: select *"Cardiology"*.
   - Click **"Call Next"**:
     - Verify status switches to **CALLED**.
     - Verify row flashes visually to indicate live update.
5. **Test Emergency Alerts (`/staff/alerts`)**:
   - Verify that registering a `RED` priority patient immediately generates a persistent alert in the Alerts dashboard.
   - Click **"Acknowledge"** on the alert and verify it moves to the acknowledged list.

---

### Phase 4: Clinician Consultation Portal (Doctor Role)

1. Sign in with `doctor.cardio@hospital.com` on **`https://opd-gateway-server.vercel.app`**.
2. Notice the **DOCTOR** badge in the header.
3. Click **"Consultations"** in the sidebar (route: `/staff/consultation`).
4. **Verify Multi-Department Queue**:
   - Under the title, inspect the **"Assigned Units"** badges (e.g. `Cardiology`, `General Practice`).
   - Notice the department filter tabs:
     - `All Assigned Units`
     - `Cardiology`
     - `General Practice`
   - Click between the tabs: verify the queue dynamically filters to display patients belonging to the clinician's assigned units.
5. **Start Clinical Encounter**:
   - Click on patient `Ananya Roy` (`A-104`) from the queue.
   - Review patient demographics and AI Triage assessment reasoning.
   - Click **"Start Consultation"**:
     - Status updates to `IN_CONSULTATION`.
     - Patient record is locked to this clinician.
6. **Record SOAP Documentation**:
   - Fill in:
     - **(S) Subjective**: `Patient reports sudden retrosternal tightness starting 1 hour ago.`
     - **(O) Objective**: `BP 150/95, HR 102 bpm, SpO2 95% on room air.`
     - **(A) Assessment**: `Acute Coronary Syndrome / Unstable Angina`
     - **(P) Plan**: `Loading dose Aspirin 300mg + Clopidogrel 300mg, stat ECG, admit to CCU.`
     - **Disposition**: Select `Admit to Inpatient / Ward`.
   - Click **"Save SOAP Notes"**: Verify toast confirms saving.
   - Click **"Complete Encounter"**:
     - Verify encounter is marked completed and removed from the active queue.

---

### Phase 5: Patient Mobile App & Indoor Map (Patient PWA)

1. Open **`https://opd-gateway.vercel.app`** on your smartphone or in Chrome DevTools with Mobile View enabled (iPhone 14 / Pixel 7 preset).
2. Sign in or register as `patient.live@gmail.com` with password `demo123`.
3. **Test AI Symptom Check-In (`/dashboard/symptoms`)**:
   - Tap **"Start OPD Check-In"**.
   - Select symptoms: *"Chest Discomfort"*, *"Shortness of Breath"*.
   - Tap microphone icon to simulate voice dictation.
   - Set severity slider to Level 4.
   - Tap **"Analyze Symptoms & Proceed"**.
4. **Test Gemini AI Triage Screen (`/dashboard/triage`)**:
   - Verify Gemini analyzes symptoms and outputs:
     - Priority: **RED (Emergency)**
     - Red flag warnings: `Chest pain / cardiac indicators`
     - Recommended unit: `Cardiology`
   - Tap **"View Live Queue Token"**.
5. **Test Live Queue Token Tracking (`/dashboard`)**:
   - Verify the Token Card displays:
     - Large token code (e.g. `A-105`).
     - Department: `Cardiology`.
     - Status: `⏳ Waiting in Queue`.
     - 4-step visual care journey tracker.
6. **Test Real-Time Call Alert & Vibration**:
   - When the doctor calls the token from the hospital web portal, observe the mobile screen:
     - Screen transitions to an amber alert: **"Your Number Has Been Called!"**.
     - Smartphone vibrates (on vibration-supported devices).
     - Stepper advances to "Proceed to Consultation Room".
7. **Test Indoor Hospital Vector Navigation (`HospitalMapModal`)**:
   - On the mobile dashboard, tap **"View Hospital Indoor Map & Clinic Directions"**.
   - Verify the interactive modal displays:
     - Vector SVG floor plan of OPD Wing A.
     - Consultation Room 104 with a pulsing waypoint indicator.
     - Animated dashed turquoise walking path connecting the Waiting Lobby directly to Room 104.
     - Turn-by-turn walking directions:
       1. Start at Waiting Lobby.
       2. Walk straight through central corridor (20m).
       3. Turn right past Pharmacy.
       4. Room 104 (Cardiology) is on your left.
   - Test toggling between **Floor 1 (OPD)** and **Floor 2 (Labs)**.
8. **Test Digital Health Records (`/dashboard/records`)**:
   - Tap **"View Records"**.
   - Verify that the completed clinical encounter from Phase 4 appears with diagnosis (*"Acute Coronary Syndrome"*), date, and doctor treatment plan.

---

## 5. Live Multi-Device Golden Flow (Integration Test)

For the most realistic verification of real-time Socket.io synchronization across the globe:

```
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│       Device 1: Smartphone           │       │         Device 2: Laptop             │
│   https://opd-gateway.vercel.app     │       │ https://opd-gateway-server.vercel.app│
│         (Patient PWA)                │       │      (Doctor & Staff Portal)         │
└──────────────────▲───────────────────┘       └──────────────────▲───────────────────┘
                   │                                              │
                   │ WSS Real-Time Socket.io Connection           │
                   └──────────────────────┬───────────────────────┘
                                          │
                        ┌─────────────────▼──────────────────┐
                        │   https://opd-gateway.onrender.com │
                        │        (Live Backend Engine)       │
                        └────────────────────────────────────┘
```

1. Open **`https://opd-gateway.vercel.app`** on your smartphone.
2. Open **`https://opd-gateway-server.vercel.app/staff/queue`** on your laptop.
3. Submit a new symptom check-in on the smartphone.
4. **Observe the laptop screen**: The moment triage finishes on your phone, the new token appears on your laptop screen in real time with **zero page refresh**.
5. On the laptop, click **"Call Next"**:
6. **Observe your smartphone**: The phone instantly triggers the vibration alert and displays *"Your Number Has Been Called!"*.
7. On your phone, tap **"View Hospital Indoor Map"** to navigate to the clinic room.

---

## 6. Production Verification Checklist

| Item | Expected Result | Status |
| :--- | :--- | :--- |
| **Backend Health** | `https://opd-gateway.onrender.com/health` returns status `ok` | ✅ Verified Live |
| **PWA Manifest** | `https://opd-gateway.vercel.app/manifest.webmanifest` returns valid JSON | ✅ Verified Live |
| **Staff Portal** | `https://opd-gateway-server.vercel.app` loads with theme & auth | ✅ Verified Live |
| **Database Migrations** | `002` and `003` SQL executed in Supabase SQL Editor | ⚠️ Run once in Supabase |
| **Multi-Dept Doctors** | Doctor sees queue for all assigned units | ✅ Verified |
| **SOAP Notes** | Clinician saves notes and completes visit | ✅ Verified |
| **Indoor Map** | Vector SVG floor map renders with animated walking path | ✅ Verified |
| **Socket.io WSS** | Live token updates stream without page refresh | ✅ Verified |
