# API SERVICES AND API KEYS PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Purpose:** Define the external services, API keys and service boundaries for the final semester implementation.

---

# 1. FINAL SERVICE STACK

```text
Supabase
→ Auth + PostgreSQL + PostGIS + RLS

Gemini
→ AI-assisted symptom interaction and structured extraction

Node.js + Express
→ Backend and business logic

Socket.io
→ Primary application realtime

Python + FastAPI + scikit-learn
→ Custom ML inference

Web Speech API
→ Optional browser voice input

Leaflet
→ Optional map UI

Nominatim
→ Optional low-volume geocoding
```

---

# 2. REALTIME DECISION — IMPORTANT

The final project uses:

```text
Socket.io
```

as the **primary application realtime layer**.

It is used for:

```text
Queue updates
Patient called
Alerts
Doctor status
Visit updates
Dashboard updates
```

Supabase Realtime is **not part of the core implementation**.

Do not implement both Socket.io and Supabase Realtime for the same events.

---

# 3. SUPABASE

Supabase provides:

```text
Authentication
PostgreSQL
PostGIS
RLS
Optional Storage
```

It does NOT provide the application's core realtime layer in this architecture.

---

# 4. SUPABASE FRONTEND VARIABLES

If the browser uses the Supabase client for authentication:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

These are not equivalent to the backend service-role credential.

---

# 5. SUPABASE BACKEND VARIABLES

Backend:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

The service-role key is secret and backend-only.

Never use:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=
```

---

# 6. GEMINI

Gemini is used for:

```text
Natural-language symptom interaction
Structured symptom extraction
Follow-up question generation
Multilingual symptom understanding
Optional document/image extraction
```

Gemini is NOT the final clinical decision-maker.

---

# 7. GEMINI KEY

Backend only:

```env
GEMINI_API_KEY=
```

Optional:

```env
GEMINI_TRIAGE_MODEL=
GEMINI_GENERAL_MODEL=
```

Never expose the Gemini key through:

```text
React
Vite public variables
Lovable
browser code
GitHub
```

---

# 8. GEMINI FLOW

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
ML model
```

---

# 9. GEMINI FAILURE FALLBACK

If Gemini is unavailable:

```text
Gemini failure
 ↓
Manual structured symptom form
 ↓
Safety rules
 ↓
ML / staff review
```

The OPD workflow should not depend completely on Gemini availability.

---

# 10. SOCKET.IO

Socket.io is a Node.js library, not a separate paid cloud API.

Use:

```text
socket.io
socket.io-client
```

Architecture:

```text
React
 ↕
Socket.io
 ↕
Express/Node
 ↕
PostgreSQL
```

Database state remains authoritative.

---

# 11. SOCKET.IO AUTH

Use the authenticated Supabase JWT during the socket handshake.

```text
JWT
 ↓
Socket handshake
 ↓
Verify
 ↓
Load role
 ↓
Authorize rooms
```

---

# 12. PYTHON ML SERVICE

Use:

```text
Python
FastAPI
pandas
numpy
scikit-learn
joblib
```

Architecture:

```text
Express
 ↓
FastAPI
 ↓
ML model
 ↓
Prediction
 ↓
Express
```

No paid ML API is required.

---

# 13. WEB SPEECH API

Optional browser feature:

```text
Microphone
 ↓
Web Speech API
 ↓
Text
 ↓
Normal triage pipeline
```

If browser support is unavailable:

```text
Text input
```

remains available.

---

# 14. LEAFLET

Optional map rendering:

```text
Leaflet
```

is open-source.

Map tile usage must follow the selected tile provider's current usage policy.

---

# 15. NOMINATIM

Optional development geocoding:

```text
OpenStreetMap Nominatim
```

If used:

- follow the current usage policy
- respect rate limits
- avoid high-volume automated requests
- cache appropriate results

If maps are not required by the MVP, do not add geocoding.

---

# 16. SERVICES WE ARE NOT USING

Do not add these to the final architecture unless a new requirement explicitly justifies them:

```text
Firebase
MongoDB
Twilio
MSG91
Paid OCR APIs
Paid speech APIs
Paid notification APIs
Supabase Realtime
```

---

# 17. ENVIRONMENT VARIABLE MATRIX

Frontend:

```env
VITE_API_BASE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Backend:

```env
NODE_ENV=development
PORT=
CLIENT_URL=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
GEMINI_TRIAGE_MODEL=

ML_SERVICE_URL=
```

---

# 18. API KEY RULE

All secret keys must:

```text
Live in environment variables
Never be committed
Never be sent to the browser
Never be printed in logs
```

If a secret is exposed:

```text
Revoke
 ↓
Rotate
 ↓
Update environment
 ↓
Restart service
 ↓
Check repository/history
```

---

# 19. EXTERNAL SERVICE ARCHITECTURE

```text
                       React
                         │
                         ▼
                    Express API
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     Supabase          Gemini           FastAPI
      Auth               AI                ML
        │                                  │
        └──────────────┬───────────────────┘
                       ▼
                PostgreSQL
                 + PostGIS
                       │
                       ▼
                  Socket.io
                       │
                       ▼
             Staff/Doctor/Admin UI
```

---

# 20. FINAL REALTIME RULE

There is exactly one primary realtime architecture for the OPD workflow:

```text
Socket.io
```

Supabase Realtime is not implemented in the semester MVP.

This prevents duplicated event handling, inconsistent state updates and unnecessary architectural complexity.
