# GEMINI API AND FREE SERVICES PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 12 / 14  
**Purpose:** API/service selection, free-tier strategy, API-key setup, backend integration, quotas, fallback design and security  
**Frontend:** React + Vite  
**Backend:** Node.js + Express  
**Database:** Supabase PostgreSQL + PostGIS  
**Authentication:** Supabase Auth  
**Realtime:** Socket.io  
**AI:** Gemini API  
**ML:** Python FastAPI + scikit-learn  
**Status:** API/service implementation blueprint

---

# 1. IMPORTANT: FREE SERVICE POLICY

The project is being developed as a student/semester project.

Therefore the API stack should prioritize:

```text
Free
+
Student-friendly
+
No unnecessary billing
+
Easy to replace
+
No credit-card dependency where possible
```

However:

> "Free" does not mean unlimited.

Every service must be checked against its current official quota, terms and eligibility before production use.

The project should also have fallbacks so that a quota limit does not break the OPD workflow.

---

# 2. FINAL SERVICE STACK

Recommended core services:

```text
1. Gemini API
   → conversational AI / structured symptom extraction

2. Supabase
   → Auth + PostgreSQL + PostGIS

3. Socket.io
   → application realtime

4. Python FastAPI
   → local ML inference

5. Browser Web Speech API
   → optional speech-to-text

6. Browser Geolocation API
   → optional location input

7. OpenStreetMap + Nominatim
   → optional geocoding/map support

8. Leaflet
   → map rendering
```

The application should avoid adding external services unless they solve a real requirement.

---

# 3. GEMINI API

## Primary purpose

Gemini is the project's conversational AI layer.

Use it for:

- symptom conversation
- symptom extraction
- structured output
- multilingual interaction
- missing-information questions
- medical-information retrieval assistance where appropriate
- image/document understanding if required

Do NOT use it as the only triage decision-maker.

---

# 4. GEMINI ARCHITECTURE

```text
React
 ↓
Express
 ↓
Gemini API
 ↓
Structured JSON
 ↓
Schema validation
 ↓
Safety rules
 ↓
ML triage
```

The API key exists only on the backend.

---

# 5. GEMINI API KEY CREATION

Use Google's official Gemini developer/API platform.

General process:

```text
1. Sign in with Google account
2. Open Gemini API / Google AI Studio
3. Create/select a project if prompted
4. Generate an API key
5. Copy the key once
6. Store it in backend environment variables
```

Do not put the key into Lovable frontend code.

Do not commit it to GitHub.

---

# 6. GEMINI ENVIRONMENT VARIABLE

Backend:

```env
GEMINI_API_KEY=
```

Optional model configuration:

```env
GEMINI_TRIAGE_MODEL=
GEMINI_GENERAL_MODEL=
```

Do not expose:

```env
VITE_GEMINI_API_KEY=
```

There should be no Gemini API key in frontend environment variables.

---

# 7. GEMINI SDK

Use the official Google Gemini SDK/API supported by the selected implementation.

Keep Gemini-specific code inside:

```text
server/src/services/ai.service.js
```

Do not scatter Gemini calls throughout controllers/components.

---

# 8. GEMINI MODEL STRATEGY

Do not hard-code the model name everywhere.

Use:

```env
GEMINI_TRIAGE_MODEL=
```

Then the model can be changed without modifying the whole application.

Choose the currently available free/low-cost model according to the official Gemini API quota and model documentation at implementation time.

The exact free quota can change and must be verified before deployment.

---

# 9. GEMINI USE CASE 01 — SYMPTOM EXTRACTION

Input:

```text
"I've had fever for two days and severe weakness."
```

Expected structured result:

```json
{
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
  "missingInformation": []
}
```

The backend validates this JSON before storing/using it.

---

# 10. GEMINI USE CASE 02 — FOLLOW-UP QUESTIONS

Example:

```text
Patient:
"I have chest discomfort."
```

Gemini can identify missing information:

```text
duration
severity
associated symptoms
```

Then ask a controlled follow-up question.

The backend must control the maximum interaction depth.

Do not allow an infinite AI conversation.

---

# 11. GEMINI USE CASE 03 — MULTILINGUAL INPUT

The frontend can support:

```text
English
Hindi
Hinglish
```

Example:

```text
"Mujhe 2 din se fever hai aur body pain bhi hai."
```

Gemini can convert the information into a common structured representation.

The ML pipeline should consume normalized structured features rather than relying on raw multilingual text alone.

---

# 12. GEMINI USE CASE 04 — OCR / DOCUMENT EXTRACTION

If document extraction is included:

```text
Image
 ↓
Express
 ↓
Gemini vision-capable model
 ↓
Structured fields
 ↓
Validation
 ↓
User confirmation
```

Do not treat extracted values as automatically correct.

For the semester MVP, OCR should be optional and should not delay core OPD functionality.

---

# 13. GEMINI OUTPUT SCHEMA

Use a strict schema such as:

```json
{
  "symptoms": [],
  "duration": [],
  "severity": null,
  "redFlags": [],
  "missingInformation": [],
  "summary": ""
}
```

The backend should reject malformed responses.

---

# 14. GEMINI PROMPT SECURITY

System instructions belong on the backend.

Structure:

```text
System instructions
+
Application rules
+
Current structured context
+
Patient message
```

Do not let the patient input replace system instructions.

Protect against prompt injection.

---

# 15. GEMINI RATE/LIMIT STRATEGY

Because free quotas can be limited:

Use:

```text
Short prompts
+
Structured context
+
Limited follow-up questions
+
No unnecessary repeated calls
```

Avoid:

```text
Gemini call on every keystroke
```

Call Gemini only when a meaningful user message is submitted.

---

# 16. GEMINI RETRY POLICY

Use a limited retry policy.

Example:

```text
First request
 ↓
temporary failure?
 ↓
retry once with short delay
 ↓
still fails
 ↓
fallback
```

Do not retry indefinitely.

---

# 17. GEMINI FALLBACK

If Gemini is unavailable:

```text
Gemini unavailable
 ↓
Manual structured symptom form
 ↓
Safety rules
 ↓
ML triage
 ↓
Staff review if needed
```

The application should remain usable.

---

# 18. GEMINI DATA PRIVACY

Do not send unnecessary patient information to Gemini.

Only send what is required for the current AI task.

Never send:

```text
passwords
JWTs
API keys
service credentials
```

Avoid sending full identity information when it is not required.

During semester development, use synthetic/de-identified data.

---

# 19. SUPABASE

Supabase is used for:

```text
Authentication
PostgreSQL
PostGIS
RLS
Optional Storage
```

It is the primary database/backend platform.

---

# 20. SUPABASE FREE-TIER STRATEGY

Use Supabase's currently available free/student-appropriate plan for development where eligible.

Keep usage controlled:

```text
Small development dataset
+
Synthetic seed data
+
Limited storage
+
No unnecessary file uploads
```

The exact quotas and plan restrictions can change.

Verify them in the official Supabase pricing/documentation before deployment.

---

# 21. SUPABASE API KEYS

Frontend may use the public/publishable key needed by Supabase Auth:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Backend:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

The service-role key is backend-only.

---

# 22. SUPABASE KEY RULE

Public/anon/publishable key:

```text
Can be present in frontend
```

Service-role key:

```text
Backend ONLY
```

Never:

```text
VITE_SUPABASE_SERVICE_ROLE_KEY
```

---

# 23. SUPABASE AUTH

Use:

```text
Email + Password
```

for the MVP.

Supabase Auth manages:

- password storage
- sessions
- access tokens
- refresh/session lifecycle
- password reset

Do not create a second password system.

---

# 24. POSTGRESQL

Use Supabase PostgreSQL for:

```text
patients
visits
symptoms
triage
queue
alerts
doctors
departments
notifications
audit logs
AI metadata
```

PostgreSQL is the source of truth.

---

# 25. POSTGIS

Use PostGIS only where location features are useful.

Possible:

```text
hospital location
department location
nearby hospital search
distance calculation
```

Avoid continuous patient tracking.

---

# 26. SOCKET.IO

Socket.io does not require a separate paid cloud service.

It is a Node.js library running with our backend.

Use it for:

```text
queue updates
patient called
emergency alerts
doctor status
dashboard updates
```

---

# 27. SOCKET.IO ARCHITECTURE

```text
React
  ↕
Socket.io
  ↕
Express/Node
  ↕
PostgreSQL
```

The database remains authoritative.

---

# 28. SOCKET.IO AUTHENTICATION

Use Supabase JWT during the socket handshake.

```text
Client
 ↓
JWT
 ↓
Socket.io handshake
 ↓
Verify token
 ↓
Load role
 ↓
Authorize rooms
```

Do not allow anonymous access to staff rooms.

---

# 29. PYTHON FASTAPI

FastAPI is used for the project's custom ML model.

It is open-source and does not require a paid API.

Architecture:

```text
Express
 ↓
FastAPI
 ↓
scikit-learn model
 ↓
Prediction
 ↓
Express
```

---

# 30. LOCAL ML SERVICE

During development:

```text
Node.js
localhost:5000
      ↓
Python
localhost:8000
```

Example:

```http
POST http://localhost:8000/predict
```

Production can deploy the service separately if required.

---

# 31. SCIKIT-LEARN

Use scikit-learn for:

```text
TF-IDF
Logistic Regression
Random Forest
Evaluation metrics
Train/test pipeline
```

It is free and open-source.

---

# 32. PYTHON ML DEPENDENCIES

Possible:

```text
pandas
numpy
scikit-learn
joblib
fastapi
uvicorn
pydantic
```

Only install packages actually required.

---

# 33. WEB SPEECH API

For optional voice symptom input, use the browser's Web Speech API where supported.

Architecture:

```text
Microphone
 ↓
Browser Web Speech API
 ↓
Text
 ↓
Express
 ↓
Gemini
```

This avoids paying for a separate speech-to-text API.

---

# 34. WEB SPEECH API LIMITATION

Browser speech recognition support varies by browser/platform.

Therefore:

```text
Voice available
→ use voice

Voice unavailable
→ show text input
```

Never make voice input a hard dependency.

---

# 35. GELOCATION API

If location is needed:

```text
Browser Geolocation API
```

can provide approximate coordinates with user permission.

Do not continuously track the patient.

Use location only when needed.

---

# 36. MAP LIBRARY

For optional map UI:

```text
Leaflet
```

is open-source.

Map tiles must follow their provider's usage policy.

Do not assume that every OpenStreetMap tile endpoint can be used as an unlimited production tile server.

---

# 37. GEOCODING

For a simple development/demo map:

```text
OpenStreetMap Nominatim
```

can be considered.

Important:

- Follow the current usage policy.
- Respect rate limits.
- Identify the application where required.
- Do not send high-volume automated requests.

For a semester demo, cache results where appropriate.

---

# 38. OPTIONAL MAP ALTERNATIVE

If the project does not actually require map functionality:

```text
Do not add a map API.
```

PostGIS can remain part of the architecture for future location-aware features.

Avoid unnecessary API dependencies.

---

# 39. WHAT WE ARE NOT USING

Do not add these unless a concrete requirement appears:

```text
Firebase
MongoDB
Twilio
MSG91
paid OCR APIs
paid speech APIs
paid map APIs
paid notification services
```

The project architecture does not require them.

---

# 40. NOTIFICATION STRATEGY

For the MVP:

```text
Socket.io
+
in-app notifications
```

is sufficient.

Example:

```text
Patient called
Emergency alert
Queue changed
Doctor status changed
```

External SMS/WhatsApp services are not necessary for the semester MVP.

---

# 41. EMAIL STRATEGY

Email is not required for the core OPD workflow.

Supabase Auth may handle authentication-related email functionality according to the selected configuration.

Do not add a separate email provider unless the project genuinely requires custom transactional emails.

---

# 42. API KEY STORAGE MATRIX

| Service | Frontend key | Backend key | Secret? |
|---|---|---|---|
| Supabase Auth | Public client config | Service role key | Service role = YES |
| Gemini | NO | API key | YES |
| Socket.io | No API key | Backend service | Protected connection |
| FastAPI | No | Internal service | Protect if remotely deployed |
| Web Speech | Browser API | No | No |
| Geolocation | Browser API | No | No |
| Leaflet | No API key | No | No |
| Nominatim | No API key | Request policy applies | No |

---

# 43. ENVIRONMENT FILES

Backend:

```env
NODE_ENV=development
PORT=5000

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
GEMINI_TRIAGE_MODEL=

ML_SERVICE_URL=http://localhost:8000

CLIENT_URL=http://localhost:5173
```

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

No Gemini secret belongs in frontend `.env`.

---

# 44. KEY ROTATION

If an API key is exposed:

```text
1. Revoke old key
2. Generate new key
3. Update deployment secret
4. Restart service
5. Search repository/history
6. Verify old key no longer works
```

Never simply delete the visible key from source and assume it is safe if it was committed to Git history.

---

# 45. API SERVICE ABSTRACTION

Create backend services:

```text
ai.service.js
supabase.service.js
ml.service.js
geocoding.service.js
```

Controllers should not contain raw third-party API calls.

Example:

```text
triage.controller
       ↓
triage.service
       ↓
ai.service
       ↓
Gemini
```

---

# 46. SERVICE TIMEOUTS

Every external dependency should have a timeout.

Examples:

```text
Gemini
ML service
Geocoding
```

A slow third-party API must not hold an HTTP request indefinitely.

---

# 47. EXTERNAL SERVICE FAILURE MATRIX

| Service | Failure | Fallback |
|---|---|---|
| Gemini | unavailable | manual symptom form |
| ML | unavailable | staff review |
| Socket.io | unavailable | refresh/poll |
| Geocoding | unavailable | manual location |
| Web Speech | unsupported | text input |
| Supabase | unavailable | application unavailable/controlled error |

---

# 48. API COST CONTROL

Use:

```text
Short prompts
Limited AI calls
No calls on every keystroke
Caching where appropriate
Synthetic development data
Rate limiting
```

For ML:

```text
Local inference
```

instead of paid prediction APIs.

---

# 49. GEMINI REQUEST BUDGET

A single triage session should not generate unlimited requests.

Example policy:

```text
Initial extraction: 1 call
Follow-up questions: limited
Final structured assessment: 1 call if required
```

The exact count can be tuned after testing.

---

# 50. API MONITORING

Track internally:

```text
request count
success/failure
latency
HTTP status
provider
model
operation
```

For AI:

```text
Gemini calls
ML predictions
average latency
error count
```

Do not log secrets.

---

# 51. SERVICE IMPLEMENTATION ORDER

Implement external services in this order:

```text
1. Supabase Auth
       ↓
2. Supabase PostgreSQL
       ↓
3. Express API
       ↓
4. Socket.io
       ↓
5. Python ML service
       ↓
6. Gemini
       ↓
7. Optional Web Speech
       ↓
8. Optional PostGIS/maps
```

This prevents AI integration from blocking the core OPD system.

---

# 52. DEVELOPMENT PRIORITY

## MUST HAVE

```text
Supabase Auth
Supabase PostgreSQL
Express
JWT
RBAC
RLS
Socket.io
Gemini
Python ML
```

## OPTIONAL

```text
Web Speech
PostGIS map UI
Nominatim
OCR
```

Optional features should never delay:

```text
registration
triage
queue
staff dashboard
```

---

# 53. GEMINI INTEGRATION CHECKLIST

- [ ] Create API key
- [ ] Store key backend-only
- [ ] Select currently available model
- [ ] Build ai.service.js
- [ ] Create system prompt
- [ ] Create structured schema
- [ ] Validate response
- [ ] Add timeout
- [ ] Add limited retry
- [ ] Add rate limiting
- [ ] Add fallback
- [ ] Test multilingual input
- [ ] Test prompt injection
- [ ] Test malformed output

---

# 54. SUPABASE CHECKLIST

- [ ] Create project
- [ ] Configure Auth
- [ ] Enable PostgreSQL
- [ ] Enable PostGIS
- [ ] Run migrations
- [ ] Add constraints
- [ ] Add indexes
- [ ] Enable RLS
- [ ] Create policies
- [ ] Seed synthetic data
- [ ] Test roles
- [ ] Verify service-role key is backend-only

---

# 55. SOCKET.IO CHECKLIST

- [ ] Install server package
- [ ] Install client package
- [ ] Authenticate socket handshake
- [ ] Verify JWT
- [ ] Load role
- [ ] Authorize rooms
- [ ] Define events
- [ ] Emit only after DB changes
- [ ] Test unauthorized connections
- [ ] Add reconnect handling

---

# 56. ML SERVICE CHECKLIST

- [ ] Prepare dataset
- [ ] Preprocess
- [ ] Train baseline
- [ ] Evaluate
- [ ] Save model
- [ ] Save vectorizer
- [ ] Add metadata
- [ ] Create FastAPI endpoint
- [ ] Validate input
- [ ] Validate output
- [ ] Connect Express
- [ ] Add timeout/fallback

---

# 57. FREE-SERVICE DECISION

The recommended semester stack is:

```text
Gemini
→ AI

Supabase
→ Auth + PostgreSQL + PostGIS

Node.js + Express
→ backend

Socket.io
→ realtime

Python + FastAPI + scikit-learn
→ ML

Web Speech API
→ optional voice

Leaflet
→ optional maps

Nominatim
→ optional low-volume geocoding
```

This minimizes paid dependencies.

---

# 58. IMPORTANT QUOTA RULE

Before implementation, verify the current official quotas for:

```text
Gemini API
Supabase
Nominatim
```

because free-tier limits and eligibility can change.

Do not write a project report claiming a permanent "unlimited free" API.

Instead write:

> "The development stack uses services/APIs with free or open-source options suitable for the semester prototype, subject to their current usage limits and terms."

---

# 59. FINAL SERVICE ARCHITECTURE

```text
                         REACT
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
             Supabase Auth      Browser APIs
                  │             │
                 JWT        Speech/Location
                  │
                  ▼
             EXPRESS BACKEND
                  │
       ┌──────────┼───────────┐
       ▼          ▼           ▼
   Supabase     Gemini      FastAPI
   PostgreSQL     API          ML
   + PostGIS
       │
       ▼
   Database State
       │
       ▼
   Socket.io
       │
       ▼
 Authorized Dashboards
```

---

# 60. FINAL RULE

Do not add an API just because it looks impressive.

Every external service must answer:

```text
What problem does it solve?
Why can't our existing stack solve it?
Is it free/open-source for this prototype?
What happens if it fails?
```

If those questions do not have good answers:

```text
Do not add the service.
```

The goal is a reliable semester project, not a collection of APIs.
