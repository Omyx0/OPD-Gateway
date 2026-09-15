# 🏥 Smart Digital OPD System — Complete Feature Testing Guide

**Project**: OPD Gateway  
**Date**: September 2026  
**Purpose**: Step-by-step testing guide for all 7 features of the Smart Digital OPD System, with separate sections for **Localhost** and **Deployed Production** environments.

---

## Table of Contents

1. [Environment URLs & Credentials](#environment-urls--credentials)
2. [Feature 1 — Authentication (Supabase Auth + JWT)](#feature-1--authentication-supabase-auth--jwt)
3. [Feature 2 — Patient Registration & OPD Visit Management](#feature-2--patient-registration--opd-visit-management)
4. [Feature 3 — Symptom Collection (Natural Language Input)](#feature-3--symptom-collection-natural-language-input)
5. [Feature 4 — AI Symptom Understanding (Gemini AI)](#feature-4--ai-symptom-understanding-gemini-ai)
6. [Feature 5 — Safety-Rule Evaluation & ML-Based Triage](#feature-5--safety-rule-evaluation--ml-based-triage)
7. [Feature 6 — Priority Queue Management (Realtime Updates)](#feature-6--priority-queue-management-realtime-updates)
8. [Feature 7 — OPD Consultation & Visit Completion](#feature-7--opd-consultation--visit-completion)
9. [End-to-End Flow Checklist](#end-to-end-flow-checklist)

---

## Environment URLs & Credentials

### Localhost URLs

| Service | URL | Port |
| :--- | :--- | :--- |
| **Backend API** | `http://localhost:5000/api/v1` | 5000 |
| **Backend Health** | `http://localhost:5000/health` | 5000 |
| **Hospital Web Portal** | `http://localhost:5173` | 5173 |
| **Patient PWA** | `http://localhost:5174` (default Vite next port) | 5174 |
| **ML Triage Service** | `http://localhost:8000` | 8000 |
| **ML Health** | `http://localhost:8000/health` | 8000 |

### Deployed Production URLs

| Service | Platform | URL |
| :--- | :--- | :--- |
| **Backend API** | Render | `https://opd-gateway.onrender.com/api/v1` |
| **Backend Health** | Render | `https://opd-gateway.onrender.com/health` |
| **Hospital Web Portal** | Vercel | `https://opd-gateway-server.vercel.app` |
| **Patient PWA** | Vercel | `https://opd-gateway.vercel.app` |

> [!NOTE]
> The Render backend may take ~30–50 seconds to wake up if idle. Hit the `/health` endpoint first and wait for `{"status":"ok"}` before testing other features.

### Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@opd.com` | `demo123` |
| **Doctor** | `doctor@opd.com` | `demo123` |
| **Staff** | `staff@opd.com` | `demo123` |
| **Patient** | `patient@opd.com` | `demo123` |

### Starting Localhost Services

```bash
# Terminal 1 — Backend API + ML Service
cd server
npm run dev

# Terminal 2 — Hospital Web Portal
cd hospital-web
npm run dev

# Terminal 3 — Patient PWA
cd patient-pwa
npm run dev
```

---

## Feature 1 — Authentication (Supabase Auth + JWT)

### What This Feature Does
- User registration and login via Supabase Auth
- JWT token generation and validation
- Role-based access control (Patient, Staff, Doctor, Admin)
- Protected routes and API authorization middleware

### 🖥️ Localhost Testing

#### Test 1.1 — Patient Login (Patient PWA)
1. Open `http://localhost:5174/login`.
2. Enter `patient@opd.com` / `demo123`.
3. Click **Sign In**.
4. **✅ Expected**: Redirected to `/dashboard`. Patient name visible in header.

#### Test 1.2 — Staff Login (Hospital Web)
1. Open `http://localhost:5173/login`.
2. Enter `staff@opd.com` / `demo123`.
3. Click **Sign In**.
4. **✅ Expected**: Redirected to `/staff` dashboard. Staff sidebar visible with Queue, Patients, etc.

#### Test 1.3 — Doctor Login (Hospital Web)
1. Open `http://localhost:5173/login`.
2. Enter `doctor@opd.com` / `demo123`.
3. Click **Sign In**.
4. **✅ Expected**: Redirected to staff area. "Consultation" tab accessible.

#### Test 1.4 — Admin Login (Hospital Web)
1. Open `http://localhost:5173/login`.
2. Enter `admin@opd.com` / `demo123`.
3. **✅ Expected**: Full admin panel accessible at `/staff/admin`.

#### Test 1.5 — Unauthorized API Access
1. Open a terminal and run:
   ```bash
   curl http://localhost:5000/api/v1/queue
   ```
2. **✅ Expected**: `401 Unauthorized` response (no JWT token provided).

#### Test 1.6 — New Patient Registration (Patient PWA)
1. Open `http://localhost:5174/register`.
2. Fill in a new email, name, phone, and password.
3. Click **Register**.
4. **✅ Expected**: Account created, redirected to dashboard.

---

### 🌐 Deployed Production Testing

#### Test 1.1P — Patient Login
1. Open `https://opd-gateway.vercel.app/login`.
2. Enter `patient@opd.com` / `demo123`.
3. **✅ Expected**: Redirected to `/dashboard`.

#### Test 1.2P — Staff Login
1. Open `https://opd-gateway-server.vercel.app/login`.
2. Enter `staff@opd.com` / `demo123`.
3. **✅ Expected**: Redirected to staff area with sidebar navigation.

#### Test 1.3P — Doctor Login
1. Open `https://opd-gateway-server.vercel.app/login`.
2. Enter `doctor@opd.com` / `demo123`.
3. **✅ Expected**: Consultation page accessible.

#### Test 1.4P — Admin Login
1. Open `https://opd-gateway-server.vercel.app/login`.
2. Enter `admin@opd.com` / `demo123`.
3. **✅ Expected**: Full admin panel at `/staff/admin`.

#### Test 1.5P — Unauthorized API Access
1. In a browser, navigate to:
   ```
   https://opd-gateway.onrender.com/api/v1/queue
   ```
2. **✅ Expected**: `401 Unauthorized` JSON error response.

---

## Feature 2 — Patient Registration & OPD Visit Management

### What This Feature Does
- Staff registers new patients with demographics (name, DOB, gender, mobile, blood group)
- Unique patient codes auto-generated (e.g., `OPD-XXXX`)
- OPD visits created with department assignment (GP, Cardiology, Neurology, etc.)
- Visits track lifecycle status: `WAITING → IN_CONSULTATION → COMPLETED`

### 🖥️ Localhost Testing

#### Test 2.1 — Register a New Patient (Staff Portal)
1. Login as Staff at `http://localhost:5173/login`.
2. Navigate to **Patients → New Patient** (`/staff/patients/new`).
3. Fill in: Full Name, Date of Birth, Gender, Mobile, Blood Group, Emergency Contact.
4. Click **Register Patient**.
5. **✅ Expected**: Patient created with auto-generated `patient_code`. Redirected to patient detail page.

#### Test 2.2 — Create a Visit (Staff Portal)
1. On the patient detail page, click **Create Visit** or **New Visit**.
2. Select a Department (e.g., General Practice).
3. Select Visit Type = `OPD`, Source = `RECEPTION`.
4. Click **Submit**.
5. **✅ Expected**: Visit created with status `WAITING`. A queue ticket is auto-generated (e.g., `A-101`).

#### Test 2.3 — Patient Self-Registration (Patient PWA)
1. Open `http://localhost:5174/register`.
2. Fill in all fields and register.
3. **✅ Expected**: Patient record created in the system. Visible in Staff → Patients list.

#### Test 2.4 — View Patient History
1. Login as Staff at `http://localhost:5173`.
2. Navigate to **Patients** and click on any existing patient.
3. **✅ Expected**: Patient details, visit history, and associated records visible.

#### Test 2.5 — API Verification
```bash
# Get all patients (requires Staff/Admin JWT token)
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/v1/patients

# Create a new visit
curl -X POST http://localhost:5000/api/v1/visits \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"patientId":"<PATIENT_UUID>","departmentId":"<DEPT_UUID>","visitType":"OPD","source":"KIOSK"}'
```

---

### 🌐 Deployed Production Testing

#### Test 2.1P — Register a New Patient
1. Login as Staff at `https://opd-gateway-server.vercel.app/login`.
2. Navigate to **Patients → New Patient**.
3. Fill in details and submit.
4. **✅ Expected**: Patient registered with auto-code.

#### Test 2.2P — Create a Visit
1. On patient detail page, create a new visit.
2. Select department and submit.
3. **✅ Expected**: Visit created, queue ticket auto-generated.

#### Test 2.3P — Patient Self-Registration
1. Open `https://opd-gateway.vercel.app/register`.
2. Complete registration flow.
3. **✅ Expected**: Account created, redirected to dashboard.

#### Test 2.4P — API Verification
```bash
# Wake up the backend first
curl https://opd-gateway.onrender.com/health

# Get departments list
curl -H "Authorization: Bearer <TOKEN>" https://opd-gateway.onrender.com/api/v1/departments
```

---

## Feature 3 — Symptom Collection (Natural Language Input)

### What This Feature Does
- Patients describe symptoms in natural language (free-text or voice input)
- Common symptom pills for quick selection (e.g., "High Fever", "Chest Discomfort")
- Severity scale (1–5) and duration captured
- Symptoms stored per-visit in the `symptoms` database table
- Both Kiosk (Hospital Web) and Patient PWA support symptom entry

### Code Locations
- **Patient PWA**: `patient-pwa/src/pages/Symptoms.tsx`
- **Hospital Web Kiosk**: `hospital-web/src/routes/symptoms.tsx`
- **Backend API**: `server/src/routes/visits.routes.ts` — `POST /visits/:id/symptoms`

### 🖥️ Localhost Testing

#### Test 3.1 — Submit Symptoms via Patient PWA
1. Login as Patient at `http://localhost:5174/login`.
2. On the Dashboard, click **Check In** or **New Visit**.
3. On the Symptom Intake page:
   - Type: `"I have severe headache and high fever since yesterday morning, feeling very dizzy"`
   - OR tap common symptom pills like **High Fever**, **Severe Headache**, **Dizziness**.
4. Adjust severity slider (e.g., 4 = Severe).
5. Set duration to `"1-3 days"`.
6. Click **Continue / Submit**.
7. **✅ Expected**:
   - Visit created in the backend.
   - Symptoms saved to database.
   - Navigated to Triage page.

#### Test 3.2 — Voice Input (Patient PWA)
1. On the Symptom Intake page, tap the **Microphone** 🎤 button.
2. Wait for the simulated speech-to-text transcription (~2.4s demo delay).
3. **✅ Expected**: Text populated in the symptom input field (demo text: "Severe pain with elevated body temperature since yesterday morning").

#### Test 3.3 — Submit Symptoms via Hospital Kiosk
1. Login as Staff at `http://localhost:5173/login`.
2. Navigate to the Kiosk flow → Symptoms page (`/symptoms`).
3. Answer the guided symptom questions one by one (voice or text mode).
4. **✅ Expected**: Symptoms collected and stored against the active kiosk visit session.

#### Test 3.4 — API Verification
```bash
# Submit a symptom to an existing visit
curl -X POST http://localhost:5000/api/v1/visits/<VISIT_ID>/symptoms \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "symptomName": "Severe Headache",
    "patientDescription": "Intense throbbing pain behind the eyes for 3 days",
    "duration": "3 days",
    "severity": "4"
  }'

# Fetch symptoms for a visit
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/v1/visits/<VISIT_ID>/symptoms
```

---

### 🌐 Deployed Production Testing

#### Test 3.1P — Submit Symptoms via Patient PWA
1. Login at `https://opd-gateway.vercel.app/login` as Patient.
2. From Dashboard, start a new check-in flow.
3. Describe symptoms in the text box or use quick pills.
4. Set severity and duration.
5. Click **Continue**.
6. **✅ Expected**: Symptoms submitted to the cloud backend, navigated to triage.

#### Test 3.2P — Voice Input
1. On the Symptom Intake page, tap the 🎤 button.
2. **✅ Expected**: Simulated transcription appears in the text field.

#### Test 3.3P — API Verification
```bash
# Submit symptom to cloud
curl -X POST https://opd-gateway.onrender.com/api/v1/visits/<VISIT_ID>/symptoms \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "symptomName": "Chest Discomfort",
    "patientDescription": "Tightness in chest when climbing stairs",
    "duration": "1 week",
    "severity": "4"
  }'
```

---

## Feature 4 — AI Symptom Understanding (Gemini AI)

### What This Feature Does
- Patient symptom descriptions (natural language) sent to Google Gemini 3.5 Flash API
- Gemini extracts structured data: symptom names, body areas, severity, duration
- Identifies red flags (e.g., "chest pain", "shortness of breath")
- Suggests missing information / follow-up questions
- Generates clinical summary
- Falls back to rule-based parsing if Gemini API is unavailable

### Code Locations
- **Backend API**: `server/src/routes/triage.routes.ts` — `POST /triage/extract`
- **Gemini Config**: `server/src/config/gemini.ts`
- **AI Interaction Logging**: `ai_interactions` table in Supabase

### 🖥️ Localhost Testing

#### Test 4.1 — Symptom Extraction via API
```bash
curl -X POST http://localhost:5000/api/v1/triage/extract \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have been having severe chest pain for the last 2 hours, difficulty breathing, and my left arm feels numb",
    "visitId": "<VISIT_ID>"
  }'
```
**✅ Expected Response** (structured JSON):
```json
{
  "symptoms": [
    { "name": "chest pain", "bodyArea": "chest", "severity": "severe", "duration": "2 hours" },
    { "name": "difficulty breathing", "bodyArea": "respiratory", "severity": "severe", "duration": "2 hours" },
    { "name": "left arm numbness", "bodyArea": "left arm", "severity": "moderate", "duration": "unknown" }
  ],
  "redFlags": ["severe chest pain", "difficulty breathing", "arm numbness - possible cardiac event"],
  "missingInformation": ["Any history of heart disease?", "Current medications?"],
  "summary": "Patient presents with acute chest pain, dyspnea, and left arm paresthesia suggestive of potential ACS."
}
```

#### Test 4.2 — Routine Symptom Extraction
```bash
curl -X POST http://localhost:5000/api/v1/triage/extract \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have a mild headache and a runny nose for the past 2 days"
  }'
```
**✅ Expected**: Symptoms extracted with low severity, no red flags, classified as routine.

#### Test 4.3 — Hindi/Mixed Language Input
```bash
curl -X POST http://localhost:5000/api/v1/triage/extract \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mujhe kal se tez bukhar hai aur sar mein dard ho raha hai"
  }'
```
**✅ Expected**: Gemini handles multilingual input, extracts "high fever" and "headache".

#### Test 4.4 — Fallback When Gemini Unavailable
1. Temporarily set an invalid `GEMINI_API_KEY` in `.env`.
2. Restart the server.
3. Submit the extract request.
4. **✅ Expected**: Falls back to basic parsing — returns symptom with message text, severity "moderate", and a note to describe symptoms in more detail.

---

### 🌐 Deployed Production Testing

#### Test 4.1P — Symptom Extraction
```bash
curl -X POST https://opd-gateway.onrender.com/api/v1/triage/extract \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have severe abdominal pain and persistent vomiting since morning",
    "visitId": "<VISIT_ID>"
  }'
```
**✅ Expected**: Gemini extracts structured symptoms with red flags for vomiting + abdominal pain.

#### Test 4.2P — End-to-End via Patient PWA
1. Login at `https://opd-gateway.vercel.app` as Patient.
2. Start check-in → Describe symptoms → Submit.
3. On the Triage page, observe the AI-generated assessment.
4. **✅ Expected**: Triage result shows priority color (RED/YELLOW/GREEN), reasoning, and red flags.

---

## Feature 5 — Safety-Rule Evaluation & ML-Based Triage

### What This Feature Does
- **Gemini AI Triage**: Sends symptoms to Gemini for priority assessment (RED/YELLOW/GREEN)
- **ML Model (scikit-learn)**: FastAPI service runs a trained LogisticRegression model on patient vitals + chief complaint
- **Deterministic Safety Rules**: Hard-coded rules that **override ML predictions** for critical conditions:
  - O₂ saturation < 90% → RED
  - Respiratory rate ≥ 30 → RED
  - Systolic BP < 90 → RED
  - Pain ≥ 9/10 → RED
  - Emergency keywords (chest pain, seizure, stroke, unconscious, etc.) → RED
- **Rule-based Fallback**: If Gemini is unavailable, keyword-matching rules (`RED_KEYWORDS`, `YELLOW_KEYWORDS`) provide triage

### Code Locations
- **Triage Assess Endpoint**: `server/src/routes/triage.routes.ts` — `POST /triage/assess`
- **ML FastAPI Service**: `server/ml/api/main.py` — `POST /predict`
- **Safety Rules Engine**: `server/ml/safety/rules.py`
- **Trained Model**: `server/ml/models/triage_vitals_model.joblib`

### 🖥️ Localhost Testing

#### Test 5.1 — Full Triage Assessment (Gemini + ML + Safety)
```bash
curl -X POST http://localhost:5000/api/v1/triage/assess \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"visitId": "<VISIT_ID_WITH_SYMPTOMS>"}'
```
**✅ Expected Response**:
```json
{
  "priority": "RED",
  "confidence": 0.92,
  "urgencyLevel": "EMERGENCY",
  "redFlags": ["chest pain", "breathing difficulty"],
  "recommendedAction": "EMERGENCY",
  "recommendedDepartment": "Cardiology",
  "reasoning": "Patient presents with acute chest pain and dyspnea...",
  "mlResult": {
    "mlPriority": "YELLOW",
    "finalPriority": "RED",
    "confidence": 0.85,
    "safetyOverride": true,
    "reasons": ["Emergency symptom: severe chest pain"]
  }
}
```

#### Test 5.2 — ML Service Direct Test
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "chief_complaint": "severe chest pain difficulty breathing",
    "temperature": 101.5,
    "heartrate": 120,
    "resprate": 32,
    "o2sat": 88,
    "sbp": 85,
    "dbp": 55,
    "pain": 9
  }'
```
**✅ Expected**: `final_priority: "RED"`, `safety_override: true`, reasons include "O2 saturation below 90%", "Very high respiratory rate", "Low systolic blood pressure", "Severe pain".

#### Test 5.3 — Safety Override Verification
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "chief_complaint": "mild cough",
    "temperature": 98.6,
    "heartrate": 80,
    "resprate": 16,
    "o2sat": 85,
    "sbp": 120,
    "dbp": 80,
    "pain": 2
  }'
```
**✅ Expected**: ML may predict GREEN, but `safety_override: true` due to O₂ < 90%. Final priority = **RED**.

#### Test 5.4 — Green (Routine) Case
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "chief_complaint": "mild headache",
    "temperature": 98.6,
    "heartrate": 72,
    "resprate": 16,
    "o2sat": 99,
    "sbp": 120,
    "dbp": 80,
    "pain": 2
  }'
```
**✅ Expected**: `final_priority: "GREEN"`, `safety_override: false`, no reasons.

#### Test 5.5 — ML Health Check
```bash
curl http://localhost:8000/health
```
**✅ Expected**: `{"status": "ok", "model_loaded": true, "model_name": "triage_vitals_logistic_regression"}`

#### Test 5.6 — Gemini Fallback (Rule-Based Triage)
1. Stop or disconnect from the Gemini API (invalid key).
2. Run `POST /triage/assess` with a visit that has symptoms containing "chest pain".
3. **✅ Expected**: Triage still returns `RED` priority with reasoning: `"(Rule-based assessment — AI model was unavailable)"`.

#### Test 5.7 — RED Alert Auto-Generation
1. After a RED priority triage, check the alerts table:
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/v1/alerts
   ```
2. **✅ Expected**: An alert of type `RED_PRIORITY_PATIENT` was auto-created. Socket event `alert:new` was emitted to staff/doctor rooms.

---

### 🌐 Deployed Production Testing

#### Test 5.1P — Full Triage Assessment
```bash
curl -X POST https://opd-gateway.onrender.com/api/v1/triage/assess \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"visitId": "<VISIT_ID>"}'
```
**✅ Expected**: Gemini-powered triage result with priority, reasoning, and red flags.

> [!IMPORTANT]
> The ML service (`/predict`) runs alongside the Express server locally. On Render's free tier, only the Express server is deployed. The `mlResult` field may be `null` in production if the ML microservice is not separately hosted. The Gemini AI triage and rule-based fallback will still function correctly.

#### Test 5.2P — End-to-End via Patient PWA
1. Login at `https://opd-gateway.vercel.app` as Patient.
2. Complete check-in → Symptoms → Submit.
3. On the **Triage Results** page:
   - Observe color-coded priority badge (🔴 RED / 🟡 YELLOW / 🟢 GREEN).
   - Read the AI reasoning and any red flag alerts.
   - Note recommended department.
4. **✅ Expected**: Priority displayed with confidence score, reasoning text, and suggested next steps.

#### Test 5.3P — View Triage in Staff Portal
1. Login as Doctor at `https://opd-gateway-server.vercel.app`.
2. Go to **Consultation** and click on a patient.
3. **✅ Expected**: Triage assessment section shows priority, red flags, and clinical reasoning.

---

## Feature 6 — Priority Queue Management (Realtime Updates)

### What This Feature Does
- Patients receive queue tokens (e.g., `A-101`) upon visit creation
- Tokens automatically prioritized: **RED → YELLOW → GREEN** (within same priority, sorted by arrival time)
- Staff can update ticket status: `WAITING → CALLED → IN_PROGRESS → COMPLETED / SKIPPED`
- **Socket.io real-time events** push instant updates to all connected clients:
  - `queue:new-ticket` — new patient enters queue
  - `queue:status-updated` — ticket status changed
  - `queue:patient-called` — patient is being called
- Patient PWA receives vibration alerts when called
- Queue auto-created by triage assessment (if no ticket exists yet)

### Code Locations
- **Backend API**: `server/src/routes/queue.routes.ts`
- **Socket.io Server**: `server/src/server.ts` (Socket.io init) + `server/src/utils/socket.ts` (emit helpers)
- **Hospital Web Socket Client**: `hospital-web/src/lib/socket.ts`
- **Patient PWA Socket Client**: `patient-pwa/src/lib/socket.ts`
- **Staff Queue Page**: `hospital-web/src/routes/staff.queue.tsx`
- **Patient Queue Page**: `patient-pwa/src/pages/Queue.tsx`

### 🖥️ Localhost Testing

#### Test 6.1 — View Queue as Staff
1. Login as Staff at `http://localhost:5173/login`.
2. Navigate to **Queue** (`/staff/queue`).
3. **✅ Expected**: Queue board visible, showing tickets sorted by priority (RED first). Each ticket shows token, patient name, department, status, and arrival time.

#### Test 6.2 — Create a Queue Ticket (API)
```bash
curl -X POST http://localhost:5000/api/v1/queue/tickets \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"visitId":"<VISIT_ID>","departmentId":"<DEPT_ID>","priority":"YELLOW"}'
```
**✅ Expected**: Ticket created with token like `A-102`, priority YELLOW, status WAITING.

#### Test 6.3 — Call a Patient
1. On the Staff Queue page, click **Call** on a waiting ticket.
2. **✅ Expected**:
   - Ticket status changes to `CALLED`.
   - Socket event `queue:patient-called` emitted.
   - On the Patient PWA (if open), the patient sees their status update to "CALLED" and device vibrates.

#### Test 6.4 — Real-Time Socket Update (Multi-Browser Test)
1. Open **Browser Tab 1**: Staff queue at `http://localhost:5173/staff/queue`.
2. Open **Browser Tab 2**: Patient queue at `http://localhost:5174/dashboard/queue`.
3. In Tab 1, **Call** a patient.
4. **✅ Expected**: Tab 2 updates in real-time without page refresh. Patient sees "You've been called!" status.

#### Test 6.5 — Priority Ordering
1. Create 3 tickets: one GREEN, one RED, one YELLOW.
2. View the queue list.
3. **✅ Expected**: RED ticket appears first, then YELLOW, then GREEN.

#### Test 6.6 — Patient Self-Check Queue Status
```bash
curl -H "Authorization: Bearer <PATIENT_TOKEN>" http://localhost:5000/api/v1/queue/my-status
```
**✅ Expected**: Returns the patient's active queue tickets with department and status info.

#### Test 6.7 — Update Ticket Status
```bash
curl -X PATCH http://localhost:5000/api/v1/queue/<TICKET_ID>/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```
**✅ Expected**: Ticket status updated, Socket event emitted, audit log created.

---

### 🌐 Deployed Production Testing

#### Test 6.1P — View Queue as Staff
1. Login as Staff at `https://opd-gateway-server.vercel.app/login`.
2. Navigate to **Queue** (`/staff/queue`).
3. **✅ Expected**: Cloud queue displayed with real patient data.

#### Test 6.2P — Real-Time Cross-Device Test
1. Open `https://opd-gateway-server.vercel.app/staff/queue` on a **laptop**.
2. Open `https://opd-gateway.vercel.app/dashboard/queue` on a **smartphone** (logged in as Patient).
3. On the laptop, **Call** the patient.
4. **✅ Expected**: Smartphone updates in real-time — status changes to "CALLED", device vibrates (if supported).

#### Test 6.3P — Patient Queue Status
1. Login as Patient at `https://opd-gateway.vercel.app`.
2. Navigate to **Queue** from the dashboard.
3. **✅ Expected**: Active queue tokens visible with status, department, and token number. Auto-refreshes every 8 seconds + Socket.io live updates.

#### Test 6.4P — API Verification
```bash
curl -H "Authorization: Bearer <PATIENT_TOKEN>" \
  https://opd-gateway.onrender.com/api/v1/queue/my-status
```
**✅ Expected**: Returns the patient's active queue tickets from the cloud database.

---

## Feature 7 — OPD Consultation & Visit Completion

### What This Feature Does
- **Doctor's Queue**: Doctors see patients filtered by their assigned departments
- **Start Consultation**: Doctor picks a patient → visit status changes to `IN_CONSULTATION`, queue ticket to `IN_PROGRESS`
- **Consultation View**: Full patient context — demographics, symptoms, triage assessment, clinical records, prescriptions
- **SOAP Clinical Notes**: Doctors record Subjective, Objective, Assessment, Plan notes
- **Visit Completion**: Doctor completes the visit with diagnosis, disposition (Discharge/Admit/Refer/Follow-up), and notes
- **Queue Auto-Close**: Queue ticket automatically marked `COMPLETED` when visit is completed
- **Patient History**: Doctors can view all past visits for the patient
- **Audit Logging**: All actions (start, notes, complete) logged to `audit_logs`

### Code Locations
- **Backend API**: `server/src/routes/consultation.routes.ts`
- **Doctor Consultation Page**: `hospital-web/src/routes/staff.consultation.tsx`
- **Patient Records Page**: `patient-pwa/src/pages/Records.tsx`

### 🖥️ Localhost Testing

#### Test 7.1 — View Doctor's Queue
1. Login as Doctor at `http://localhost:5173/login`.
2. Navigate to **Consultation** (`/staff/consultation`).
3. **✅ Expected**: Patient queue visible, sorted by priority (RED first). Each entry shows token, patient name, department, symptoms preview, and arrival time.

#### Test 7.2 — Start Consultation
1. On the Consultation page, click **Start Consultation** on a waiting patient.
2. **✅ Expected**:
   - Visit status changes to `IN_CONSULTATION`.
   - Queue ticket status changes to `IN_PROGRESS`.
   - Full consultation view opens with patient details, symptoms, triage results, and clinical notes form.

#### Test 7.3 — View Patient Context
1. After starting consultation, verify the following sections are visible:
   - **Patient Info**: Name, code, DOB, gender, mobile.
   - **Symptoms**: List of reported symptoms with severity and duration.
   - **Triage Assessment**: Priority badge, confidence, reasoning, red flags.
   - **Clinical Records**: Any previous SOAP notes.
2. **✅ Expected**: All sections populated from the database.

#### Test 7.4 — Save SOAP Clinical Notes
1. In the Consultation view, fill in the SOAP notes form:
   - **Subjective**: "Patient complains of persistent headache for 3 days."
   - **Objective**: "BP: 130/85, Temp: 99.2°F, no neurological deficits."
   - **Assessment**: "Tension-type headache, rule out migraine."
   - **Plan**: "Ibuprofen 400mg TDS x 5 days. Follow-up if symptoms worsen."
   - **Diagnosis**: "Tension Headache"
2. Click **Save Notes**.
3. **✅ Expected**: Clinical record saved. Toast notification confirms save. Record visible under the visit.

#### Test 7.5 — Complete Visit
1. Click **Complete Visit** button.
2. Fill in:
   - Diagnosis: "Tension Headache"
   - Disposition: `DISCHARGE`
   - Notes: "Follow-up in 1 week if symptoms persist."
3. Click **Complete**.
4. **✅ Expected**:
   - Visit status → `COMPLETED`.
   - Queue ticket → `COMPLETED`.
   - Socket event emitted — patient sees completion in real-time.
   - Audit log created for `VISIT_COMPLETED`.

#### Test 7.6 — View Patient Visit History
1. On the Consultation page, click **Patient History** for any patient.
2. **✅ Expected**: All past visits shown chronologically with department, diagnosis, disposition, and date.

#### Test 7.7 — API Verification
```bash
# Start consultation
curl -X POST http://localhost:5000/api/v1/consultation/<VISIT_ID>/start \
  -H "Authorization: Bearer <DOCTOR_TOKEN>"

# Get consultation details
curl -H "Authorization: Bearer <DOCTOR_TOKEN>" \
  http://localhost:5000/api/v1/consultation/<VISIT_ID>

# Save clinical notes
curl -X POST http://localhost:5000/api/v1/consultation/<VISIT_ID>/notes \
  -H "Authorization: Bearer <DOCTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "subjectiveNotes": "Headache for 3 days",
    "objectiveNotes": "BP 130/85",
    "assessment": "Tension headache",
    "plan": "Ibuprofen 400mg TDS",
    "diagnosis": "Tension Headache",
    "disposition": "DISCHARGE"
  }'

# Complete visit
curl -X POST http://localhost:5000/api/v1/consultation/<VISIT_ID>/complete \
  -H "Authorization: Bearer <DOCTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"diagnosis":"Tension Headache","disposition":"DISCHARGED","notes":"Follow-up in 1 week"}'
```

---

### 🌐 Deployed Production Testing

#### Test 7.1P — Doctor's Queue
1. Login as Doctor at `https://opd-gateway-server.vercel.app/login`.
2. Navigate to **Consultation** (`/staff/consultation`).
3. **✅ Expected**: Cloud patient queue displayed, sorted by priority.

#### Test 7.2P — Full Consultation Flow
1. Click **Start Consultation** on a patient.
2. Review patient symptoms and triage results.
3. Write SOAP clinical notes and click **Save Notes**.
4. Click **Complete Visit** with diagnosis and disposition.
5. **✅ Expected**: Visit and queue ticket both marked as COMPLETED. Patient sees completion on their PWA.

#### Test 7.3P — Patient Views Records (Patient PWA)
1. Login as Patient at `https://opd-gateway.vercel.app`.
2. Navigate to **Records** from the dashboard.
3. **✅ Expected**: Past visits visible with diagnosis, disposition, and visit date.

#### Test 7.4P — Cross-Device Real-Time Update
1. **Laptop**: Doctor completes a visit at `https://opd-gateway-server.vercel.app/staff/consultation`.
2. **Smartphone**: Patient views queue at `https://opd-gateway.vercel.app/dashboard/queue`.
3. **✅ Expected**: Patient's queue status changes to "COMPLETED" in real-time on the smartphone.

---

## End-to-End Flow Checklist

This checklist follows a single patient's complete journey through all 7 features.

### 🖥️ Localhost E2E Checklist

| Step | Feature | Action | URL | ✅ |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Auth | Patient registers at PWA | `http://localhost:5174/register` | ☐ |
| 2 | Auth | Patient logs in | `http://localhost:5174/login` | ☐ |
| 3 | Registration | Patient starts check-in from dashboard | `http://localhost:5174/dashboard` | ☐ |
| 4 | Symptoms | Patient types symptoms + sets severity | `http://localhost:5174/dashboard/symptoms` | ☐ |
| 5 | AI Understanding | Gemini extracts structured symptoms | *(automatic after step 4)* | ☐ |
| 6 | Triage | Triage assessment runs (Gemini + ML + Safety Rules) | `http://localhost:5174/dashboard/triage` | ☐ |
| 7 | Queue | Queue ticket auto-generated with triage priority | `http://localhost:5174/dashboard/queue` | ☐ |
| 8 | Queue | Staff sees patient in queue (real-time) | `http://localhost:5173/staff/queue` | ☐ |
| 9 | Queue | Staff calls the patient (socket event sent) | `http://localhost:5173/staff/queue` | ☐ |
| 10 | Consultation | Doctor starts consultation | `http://localhost:5173/staff/consultation` | ☐ |
| 11 | Consultation | Doctor reviews symptoms + triage + history | *(within consultation view)* | ☐ |
| 12 | Consultation | Doctor writes SOAP notes | *(within consultation view)* | ☐ |
| 13 | Consultation | Doctor completes visit with diagnosis | *(within consultation view)* | ☐ |
| 14 | Queue | Patient sees "COMPLETED" status in real-time | `http://localhost:5174/dashboard/queue` | ☐ |

### 🌐 Deployed Production E2E Checklist

| Step | Feature | Action | URL | ✅ |
| :--- | :--- | :--- | :--- | :--- |
| 0 | Infra | Wake up Render backend | `https://opd-gateway.onrender.com/health` | ☐ |
| 1 | Auth | Patient registers | `https://opd-gateway.vercel.app/register` | ☐ |
| 2 | Auth | Patient logs in | `https://opd-gateway.vercel.app/login` | ☐ |
| 3 | Registration | Patient starts check-in | `https://opd-gateway.vercel.app/dashboard` | ☐ |
| 4 | Symptoms | Patient enters symptoms | `https://opd-gateway.vercel.app/dashboard/symptoms` | ☐ |
| 5 | AI Understanding | Gemini extracts symptoms (cloud) | *(automatic)* | ☐ |
| 6 | Triage | Triage assessment completes | `https://opd-gateway.vercel.app/dashboard/triage` | ☐ |
| 7 | Queue | Token generated, patient views queue | `https://opd-gateway.vercel.app/dashboard/queue` | ☐ |
| 8 | Queue | Staff views queue on laptop | `https://opd-gateway-server.vercel.app/staff/queue` | ☐ |
| 9 | Queue | Staff calls patient (real-time update) | `https://opd-gateway-server.vercel.app/staff/queue` | ☐ |
| 10 | Consultation | Doctor starts consultation | `https://opd-gateway-server.vercel.app/staff/consultation` | ☐ |
| 11 | Consultation | Doctor reviews patient context | *(within consultation view)* | ☐ |
| 12 | Consultation | Doctor writes SOAP notes | *(within consultation view)* | ☐ |
| 13 | Consultation | Doctor completes visit | *(within consultation view)* | ☐ |
| 14 | Queue | Patient sees "COMPLETED" on phone | `https://opd-gateway.vercel.app/dashboard/queue` | ☐ |

---

> [!TIP]
> **Best Testing Strategy**: Run through the E2E checklist with **two browser windows side-by-side** — one as Patient (PWA) and one as Staff/Doctor (Hospital Web). This lets you verify real-time Socket.io updates between roles at every step.
