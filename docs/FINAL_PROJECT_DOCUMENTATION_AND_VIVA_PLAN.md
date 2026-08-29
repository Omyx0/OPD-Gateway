# FINAL PROJECT DOCUMENTATION AND VIVA PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 14 / 14  
**Purpose:** Final semester documentation, report structure, diagrams, testing evidence, presentation flow and viva preparation  
**Project Type:** Web-based smart OPD management and preliminary AI-assisted triage prototype

---

# 1. PROJECT TITLE

**Design and Development of a Smart Digital OPD Management System with AI-Based Patient Triage**

---

# 2. SHORT PROJECT DESCRIPTION

A web-based OPD management system designed to digitize patient registration, visit management, preliminary symptom-based triage and queue handling. The system combines a secure backend, PostgreSQL database, realtime queue updates, Gemini-based symptom interaction and a custom ML model for preliminary triage support, while keeping final clinical decisions with healthcare professionals.

---

# 3. PROJECT PROBLEM

The current OPD workflow in many settings can involve:

- Manual registration
- Long queues
- Repetitive data entry
- Paper-based or disconnected records
- Limited visibility of queue status
- Delayed preliminary prioritization
- Difficulty coordinating staff and doctors
- Lack of realtime queue updates
- Inconsistent initial symptom collection

The project addresses these workflow problems through one integrated web system.

---

# 4. EXISTING SYSTEM — PROBLEMS

Explain the current limitations point-by-point:

### 4.1 Manual registration

Patients/staff may repeatedly enter the same information.

### 4.2 Long waiting queues

Patients may not know their actual queue status.

### 4.3 Basic first-come-first-served workflow

A purely chronological queue may not adequately support preliminary priority classification.

### 4.4 Repetitive symptom collection

The same basic questions may be asked manually.

### 4.5 Limited realtime coordination

A queue change may not immediately reach every relevant dashboard.

### 4.6 Fragmented information

Patient, visit, triage and queue information can become disconnected.

### 4.7 Limited analytics

Manual systems may provide little structured information about:

- waiting time
- patient volume
- department load
- triage distribution

---

# 5. PROPOSED SYSTEM

The proposed system provides:

```text
Digital Registration
        ↓
OPD Visit Creation
        ↓
Symptom Collection
        ↓
AI-Assisted Structuring
        ↓
Safety Rules
        ↓
ML-Based Preliminary Triage
        ↓
Queue Generation
        ↓
Realtime Staff/Doctor Dashboard
        ↓
Visit Completion
        ↓
Analytics
```

---

# 6. HOW THE PROJECT IMPROVES THE CURRENT SYSTEM

## Current

```text
Registration
 ↓
Manual information collection
 ↓
Waiting
 ↓
Manual prioritization
 ↓
Doctor
```

## Proposed

```text
Digital registration
 ↓
Structured visit
 ↓
AI-assisted symptom collection
 ↓
Safety checks
 ↓
Preliminary ML triage
 ↓
Priority-aware queue
 ↓
Realtime dashboard
 ↓
Doctor
```

The main improvement is not simply "using AI".

The project integrates:

```text
Digital workflow
+
security
+
structured data
+
preliminary triage support
+
queue management
+
realtime communication
+
analytics
```

---

# 7. SYSTEM MODULES

The final application consists of:

1. Authentication
2. Role management
3. Patient registration
4. OPD visit management
5. Symptom collection
6. AI-assisted symptom extraction
7. Preliminary ML triage
8. Safety-rule engine
9. Queue management
10. Realtime updates
11. Alerts
12. Doctor dashboard
13. Staff dashboard
14. Admin dashboard
15. Analytics
16. Optional geospatial functionality

---

# 8. USER ROLES

## STAFF

Responsible for:

- patient registration
- visit creation
- queue operations
- symptom/triage workflow
- operational alerts

## DOCTOR

Responsible for:

- viewing authorized patient/visit information
- viewing queue
- reviewing preliminary triage
- calling patients
- completing visits

## ADMIN

Responsible for:

- users
- doctors
- departments
- system configuration
- analytics

---

# 9. SECURITY ARCHITECTURE

Explain:

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
Business authorization
      ↓
PostgreSQL RLS
```

Important explanation:

> Authentication identifies the user, RBAC determines what the user can do, and RLS provides an additional database-level access-control layer.

---

# 10. WHY JWT?

JWT provides an authenticated identity token for communication between the frontend and backend.

Flow:

```text
Supabase Auth
 ↓
JWT
 ↓
React
 ↓
Express
 ↓
Verify JWT
```

The backend does not trust arbitrary user IDs sent by the frontend.

---

# 11. WHY RBAC?

Different users require different permissions.

Example:

```text
STAFF
→ operational workflow

DOCTOR
→ clinical/visit workflow

ADMIN
→ administration
```

RBAC prevents a normal staff account from accessing administrative operations.

---

# 12. WHY RLS?

RLS provides database-level defense in depth.

Even if an application-level mistake occurs, PostgreSQL can still restrict which rows are accessible according to the configured policies.

---

# 13. WHY BCRYPT?

Important viva clarification:

> We use Supabase Auth for normal user password management, so we do not duplicate Supabase passwords with our own bcrypt password table.

bcrypt would only be used if the application independently owned a separate credential.

This demonstrates understanding rather than adding bcrypt unnecessarily.

---

# 14. DATABASE

Primary database:

**Supabase PostgreSQL**

Advantages for this project:

- Relational data
- Foreign keys
- Constraints
- Transactions
- SQL querying
- RLS
- Easy backend integration
- PostGIS support

---

# 15. WHY POSTGRESQL INSTEAD OF MONGODB?

The application has strongly related entities:

```text
Patient
 ↓
Visit
 ↓
Symptoms
 ↓
Triage
 ↓
Queue
 ↓
Alerts
```

A relational database is therefore suitable for:

- relationships
- integrity
- constraints
- transactions
- structured reporting

---

# 16. WHY POSTGIS?

PostGIS extends PostgreSQL with geospatial capabilities.

Potential uses:

```text
Hospital coordinates
Department coordinates
Nearby facility search
Distance calculation
```

It is not being used for continuous patient tracking.

---

# 17. CORE DATABASE TABLES

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

# 18. DATABASE RELATIONSHIP

```text
Hospital
   ↓
Departments
   ↓
Doctors

Patient
   ↓
Visits
   ├── Symptoms
   ├── Triage
   └── Queue
          ↓
        Alerts

User
 ├── Roles
 ├── Notifications
 └── Audit logs
```

---

# 19. AI ARCHITECTURE

Gemini is used for conversational/structuring tasks.

```text
Patient message
 ↓
Express
 ↓
Gemini
 ↓
Structured symptom information
 ↓
Validation
 ↓
Safety rules
 ↓
ML model
```

Gemini is not the sole clinical decision-maker.

---

# 20. WHY USE GEMINI?

It can help with:

- natural-language symptom input
- multilingual interaction
- structured extraction
- identifying missing information
- conversational follow-up

Example:

```text
"Mujhe do din se fever hai aur body pain bhi hai."
```

can be transformed into structured symptom information.

---

# 21. WHY NOT USE GEMINI ALONE FOR TRIAGE?

Because the project should demonstrate a controlled and explainable workflow.

The architecture separates:

```text
Gemini
→ language understanding

Custom ML model
→ task-specific preliminary classification

Safety rules
→ deterministic override

Doctor
→ final clinical decision
```

This is a stronger engineering design than simply asking an LLM:

> "What is the patient's priority?"

---

# 22. CUSTOM ML MODEL

The ML model provides preliminary priority classification.

Example:

```text
RED
YELLOW
GREEN
```

The model is trained using an appropriate dataset and evaluated using standard classification metrics.

---

# 23. ML PIPELINE

```text
Dataset
 ↓
Data understanding
 ↓
Cleaning
 ↓
Feature engineering
 ↓
Train/test split
 ↓
Model training
 ↓
Evaluation
 ↓
Model serialization
 ↓
FastAPI inference
 ↓
Express
```

---

# 24. POSSIBLE ML MODELS

Candidate baseline models:

```text
Logistic Regression
Random Forest
```

Model selection should be based on evaluation results rather than choosing the most complex model.

---

# 25. DATASET EXPLANATION

When presenting the dataset, explain four things:

1. Where it came from
2. What information it contains
3. Which columns/features are used
4. Why it is suitable for the prototype

Do not claim clinical validity unless the source and evidence support that claim.

---

# 26. DATASET USAGE

The dataset is used to:

```text
Train
 ↓
Validate
 ↓
Evaluate
```

It should not automatically be treated as real-world hospital data.

For development/demo:

```text
Synthetic/de-identified data
```

should be preferred.

---

# 27. DATA PREPROCESSING

Possible preprocessing:

- Remove irrelevant columns
- Handle missing values
- Normalize categorical labels
- Encode categorical variables
- Scale numerical features where required
- Remove duplicates where appropriate
- Separate target variable
- Prevent data leakage

---

# 28. TRAIN/TEST SPLIT

Keep a clear separation between:

```text
Training data
Validation data if used
Test data
```

Do not repeatedly tune the model against the final test set.

For imbalanced classification, use stratification where appropriate.

---

# 29. ML EVALUATION

Report:

```text
Accuracy
Precision
Recall
F1-score
Confusion Matrix
```

For triage, pay particular attention to:

```text
Recall
```

for high-priority classes.

A model that misses high-priority cases can be more concerning than one that produces extra reviews.

---

# 30. ML LIMITATION

The model should be described as:

> A prototype decision-support model for preliminary OPD prioritization.

Do not describe it as:

```text
clinically validated
diagnostic
doctor replacement
fully autonomous medical triage
```

unless separate clinical validation actually exists.

---

# 31. SAFETY ENGINE

The deterministic safety layer is separate from the ML model.

Example:

```text
ML:
GREEN

Safety rule:
configured red flag detected

Final:
RED / urgent staff review
```

This prevents a simple model prediction from automatically overriding a known safety condition.

---

# 32. LOW CONFIDENCE HANDLING

If model confidence is below the configured threshold:

```text
Prediction
 ↓
Low confidence
 ↓
Manual staff review
```

The threshold should be determined from model validation and documented.

---

# 33. QUEUE SYSTEM

The queue is controlled by the backend.

Basic priority:

```text
RED
 ↓
YELLOW
 ↓
GREEN
```

Within a priority level:

```text
arrival time
```

can be used.

The exact policy should be documented clearly.

---

# 34. WHY REALTIME?

Socket.io provides immediate operational updates.

Example:

```text
Doctor calls patient
 ↓
Database update
 ↓
Socket.io event
 ↓
Staff dashboard updates
```

This avoids requiring every dashboard to constantly refresh.

---

# 35. SOCKET.IO SECURITY

```text
JWT
 ↓
Socket handshake
 ↓
Authentication
 ↓
RBAC
 ↓
Room authorization
```

Clients do not directly control authoritative queue state.

---

# 36. FAILURE HANDLING

## Gemini unavailable

Use:

```text
manual structured symptom form
```

## ML unavailable

Use:

```text
manual staff review
```

## Socket.io unavailable

Use:

```text
refresh/poll fallback
```

## Invalid AI output

Use:

```text
reject + fallback
```

This demonstrates resilience.

---

# 37. API ARCHITECTURE

Base path:

```text
/api/v1
```

Main groups:

```text
/auth
/patients
/visits
/triage
/queue
/alerts
/departments
/doctors
/notifications
/analytics
/admin
```

---

# 38. FRONTEND ARCHITECTURE

```text
Pages
 ↓
Components
 ↓
Hooks
 ↓
Service layer
 ↓
REST API
```

Realtime:

```text
Socket.io client
 ↓
authenticated connection
 ↓
event
 ↓
refresh/update relevant UI
```

---

# 39. BACKEND ARCHITECTURE

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Database / external service
```

Cross-cutting middleware:

```text
Authentication
Authorization
Validation
Rate limiting
Error handling
```

---

# 40. PROJECT DEVELOPMENT APPROACH

The project is developed incrementally.

### Stage 1

Frontend prototype in Lovable.

### Stage 2

Frontend cleanup/refinement in Antigravity.

### Stage 3

Backend and Supabase integration.

### Stage 4

AI and ML integration.

### Stage 5

Realtime and advanced features.

### Stage 6

Testing and deployment.

---

# 41. LOVABLE EXPLANATION

If asked why Lovable was used:

> Lovable was used to rapidly establish the frontend visual structure and user experience. Backend services were intentionally not delegated to Lovable because the project required a controlled architecture using Express, Supabase PostgreSQL, JWT, RBAC, RLS, Socket.io and a separate ML service.

---

# 42. ANTIGRAVITY EXPLANATION

If asked why Antigravity:

> Antigravity is used as the main development environment for integrating and refining the frontend with the actual backend, database, security, AI, ML and realtime architecture.

---

# 43. TESTING LEVELS

## Unit testing

Test:

- utility functions
- validators
- services
- ML preprocessing

## Integration testing

Test:

```text
API
+
database
+
authentication
```

## AI integration testing

Test:

```text
Gemini request
response validation
fallback
```

## End-to-end testing

Test:

```text
patient registration
→ visit
→ triage
→ queue
→ doctor
→ completion
```

---

# 44. TESTING TABLE FOR REPORT

Include a table such as:

| Test Case | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| Login | Valid credentials | Dashboard opens | Dashboard opens | Pass |
| Unauthorized API | No JWT | 401 | 401 | Pass |
| Staff admin access | STAFF | 403 | 403 | Pass |
| Patient registration | Valid data | Patient created | Created | Pass |
| Triage | Valid symptoms | Priority generated | Generated | Pass |
| Low confidence | Uncertain input | Staff review | Review | Pass |
| Queue update | Status change | Dashboard updates | Updated | Pass |

Only include results that were actually tested.

---

# 45. PERFORMANCE EVIDENCE

If measurements are collected, document:

```text
API latency
Database query time
ML inference time
Gemini response time
Socket event latency
```

Do not invent performance numbers.

---

# 46. SECURITY EVIDENCE

Document tests for:

```text
JWT verification
RBAC
RLS
CORS
rate limiting
input validation
secret protection
Socket authentication
IDOR/resource authorization
```

Screenshots can be included in the report where useful.

---

# 47. REPORT STRUCTURE

Recommended semester report:

```text
1. Abstract
2. Introduction
3. Problem Statement
4. Existing System
5. Proposed System
6. Objectives
7. Scope
8. Requirements
9. System Architecture
10. Technology Stack
11. Database Design
12. API Design
13. AI Architecture
14. ML Methodology
15. Dataset
16. Implementation
17. Security
18. Testing
19. Results
20. Limitations
21. Future Scope
22. Conclusion
23. References
```

---

# 48. ABSTRACT CONTENT

The abstract should briefly cover:

```text
Problem
 ↓
Proposed solution
 ↓
Technology
 ↓
AI/ML contribution
 ↓
Expected improvement
```

Do not make unsupported claims such as:

```text
reduces waiting time by 70%
```

unless actual measurements support it.

---

# 49. INTRODUCTION

Explain:

- OPD workflow
- challenges
- digital transformation
- preliminary triage
- queue management
- need for integrated systems

Keep the introduction focused on the project problem.

---

# 50. OBJECTIVES

Recommended objectives:

1. Digitize OPD registration and visit management.
2. Structure patient symptom information.
3. Provide AI-assisted preliminary symptom interaction.
4. Develop a prototype ML-based triage classifier.
5. Improve queue prioritization workflow.
6. Provide realtime staff/doctor updates.
7. Implement secure role-based access.
8. Store structured operational data.
9. Provide basic analytics.
10. Establish a foundation for future intelligent OPD systems.

---

# 51. SCOPE

## Included

```text
Web application
Patient registration
OPD visits
Symptom collection
AI-assisted extraction
ML triage prototype
Queue
Realtime updates
Staff/doctor/admin roles
Analytics
Security
```

## Not included

```text
Autonomous diagnosis
Prescription generation
Clinical decision replacement
Production hospital certification
Continuous patient tracking
```

---

# 52. SYSTEM ARCHITECTURE DIAGRAM

Use a diagram with:

```text
Frontend
 ↓
Authentication
 ↓
Backend
 ↓
Security
 ↓
Database
 ↓
AI/ML
 ↓
Realtime
```

Recommended visual grouping:

```text
Presentation Layer
Application Layer
Security Layer
Intelligence Layer
Data Layer
Realtime Layer
```

---

# 53. DATA FLOW DIAGRAM

Level 0:

```text
Patient/Staff/Doctor
        ↓
Smart OPD System
        ↓
Database
```

Level 1:

```text
User
 ↓
Authentication
 ↓
Registration
 ↓
Visit
 ↓
Triage
 ↓
Queue
 ↓
Doctor
 ↓
Completion
```

---

# 54. ER DIAGRAM

Include:

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

Show the major foreign-key relationships.

---

# 55. SEQUENCE DIAGRAM

Main sequence:

```text
Patient
 ↓
Frontend
 ↓
Express
 ↓
Gemini
 ↓
Safety Engine
 ↓
ML Service
 ↓
PostgreSQL
 ↓
Queue
 ↓
Socket.io
 ↓
Dashboard
```

This is one of the most useful diagrams for explaining the project.

---

# 56. USE CASE DIAGRAM

Actors:

```text
Patient
Staff
Doctor
Admin
```

Major use cases:

```text
Login
Register patient
Create visit
Enter symptoms
Perform triage
View queue
Manage queue
Call patient
Complete visit
Manage doctors
Manage departments
View analytics
```

---

# 57. UI SCREENSHOT DOCUMENTATION

Capture final screenshots of:

1. Login
2. Staff dashboard
3. Patient registration
4. Patient profile
5. Visit creation
6. Symptom/triage interface
7. Triage result
8. Queue dashboard
9. Doctor dashboard
10. Alert panel
11. Admin dashboard
12. Analytics

Only use screenshots from the actual implemented application.

---

# 58. AI SCREENSHOT EVIDENCE

Show:

```text
Patient message
 ↓
AI structured information
 ↓
Triage result
```

Avoid displaying real patient information.

Use synthetic demo data.

---

# 59. ML RESULT EVIDENCE

Include:

```text
Model
Dataset size
Features
Train/test strategy
Metrics
Confusion matrix
Example prediction
```

Only include actual values from your experiments.

---

# 60. DATASET DOCUMENTATION

For each dataset used, record:

```text
Dataset name
Source
URL/reference
License/usage terms
Number of records
Features
Target
Preprocessing
Why selected
Limitations
```

Do not claim a dataset is medically validated unless its source establishes that.

---

# 61. API DOCUMENTATION

Include a concise API table:

| Module | Method | Endpoint | Purpose |
|---|---|---|---|
| Auth | GET | /auth/me | Current user |
| Patient | POST | /patients | Create patient |
| Patient | GET | /patients | Search patients |
| Visit | POST | /visits | Create visit |
| Triage | POST | /triage/extract | Extract symptoms |
| Triage | POST | /triage/assess | Generate preliminary assessment |
| Queue | GET | /queue | View queue |
| Queue | POST | /queue/:id/call | Call patient |
| Alerts | POST | /alerts/:id/acknowledge | Acknowledge alert |

Update this table to match the final implemented API.

---

# 62. TECHNOLOGY STACK TABLE

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| UI | Tailwind + shadcn/ui |
| Backend | Node.js + Express |
| Authentication | Supabase Auth |
| Token | JWT |
| Authorization | RBAC |
| Database | PostgreSQL |
| Geospatial | PostGIS |
| Security | RLS + Helmet + CORS + Rate limiting |
| Realtime | Socket.io |
| AI | Gemini |
| ML | Python + scikit-learn |
| ML API | FastAPI |

---

# 63. RESULTS SECTION

The results should demonstrate:

```text
Functional workflow
+
Security
+
AI integration
+
ML performance
+
Realtime updates
+
Database consistency
```

Use measured results wherever possible.

---

# 64. LIMITATIONS

Be honest about limitations.

Examples:

- ML model is a prototype.
- Dataset may not represent all patient populations.
- No clinical validation.
- AI output may be imperfect.
- Free API quotas may limit usage.
- Browser voice support may vary.
- Realtime behavior depends on network connectivity.
- Production healthcare deployment requires additional compliance/security work.

---

# 65. FUTURE SCOPE

Potential future features:

```text
Hospital information-system integration
Electronic health records integration
Advanced clinical validation
More robust multilingual support
Improved ML models
Federated/privacy-preserving learning
Predictive waiting-time estimation
Doctor workload prediction
Appointment scheduling
SMS/WhatsApp notifications
Advanced analytics
Mobile application
Medical-device integration
```

Future scope should be presented as future work, not existing functionality.

---

# 66. CONCLUSION

The conclusion should state that the project demonstrates a unified digital OPD workflow combining:

```text
secure authentication
+
role-based access
+
structured patient workflow
+
AI-assisted symptom interaction
+
prototype ML triage
+
priority-aware queue
+
realtime communication
+
PostgreSQL data management
```

The system is intended as a semester prototype and decision-support workflow, not a replacement for clinical professionals.

---

# 67. VIVA — BASIC QUESTIONS

### Q1. What is OPD?

**Answer:**

> OPD stands for Outpatient Department, where patients receive consultation and treatment without being admitted to the hospital.

### Q2. What problem does your project solve?

> It digitizes OPD registration, visit management, preliminary symptom triage and queue coordination to improve organization and reduce manual workflow issues.

### Q3. Why is it called smart?

> Because it combines structured digital workflow with AI-assisted symptom interaction, ML-based preliminary prioritization, safety rules and realtime queue management.

---

# 68. VIVA — DATABASE

### Why PostgreSQL?

> The system contains strongly related entities such as patients, visits, symptoms, triage assessments and queue tickets, so a relational database provides strong integrity and transaction support.

### Why Supabase?

> Supabase provides PostgreSQL, authentication, RLS and a convenient development platform that fits the project architecture.

### Why PostGIS?

> PostGIS provides geospatial capabilities for location-aware features such as nearby hospitals or departments.

---

# 69. VIVA — AUTHENTICATION

### Why Supabase Auth?

> It provides authentication and session management without requiring us to implement password storage ourselves.

### Why JWT?

> The authenticated session provides a JWT that the backend verifies before allowing protected operations.

### Why RBAC?

> Different users have different responsibilities, so RBAC limits operations according to their role.

---

# 70. VIVA — SECURITY

### Why RLS?

> RLS adds database-level access control as defense in depth.

### Why not trust the frontend?

> Frontend code can be modified or bypassed, so all important authorization must be enforced on the backend and database.

### Where is the Gemini API key?

> Only on the backend. It is never exposed to the React application.

---

# 71. VIVA — AI

### Why Gemini?

> It is useful for natural-language symptom interaction and converting patient language into structured information.

### Why not use Gemini for everything?

> We separate language understanding from task-specific ML classification and deterministic safety rules to make the architecture more controlled and explainable.

### Can AI diagnose the patient?

> No. The system is a preliminary triage-support prototype. Final clinical decisions remain with healthcare professionals.

---

# 72. VIVA — ML

### Why build a custom ML model?

> It demonstrates an actual machine-learning pipeline including dataset preparation, preprocessing, training, evaluation and inference rather than relying entirely on an external AI API.

### What does the model predict?

> A preliminary priority category such as RED, YELLOW or GREEN.

### What metrics do you use?

> Accuracy, precision, recall, F1-score and confusion matrix, with special attention to recall for higher-priority classes.

---

# 73. VIVA — SOCKET.IO

### Why Socket.io?

> It provides realtime bidirectional communication so queue changes, patient calls and alerts can appear on authorized dashboards without requiring constant manual refreshes.

### Can the client change the queue directly through Socket.io?

> No. The backend updates the database first and then emits the realtime event.

---

# 74. VIVA — BCRYPT

### Are you using bcrypt?

Best answer:

> We understand bcrypt as a password-hashing mechanism, but our normal user authentication is managed by Supabase Auth. We therefore do not duplicate those passwords in our own database. bcrypt would only be used for an independently application-managed credential if one were introduced.

---

# 75. VIVA — FAILURE HANDLING

### What happens if Gemini stops working?

> The system can fall back to structured manual symptom entry and staff review rather than making the OPD workflow completely dependent on AI.

### What if the ML service fails?

> The case can be routed for manual staff review.

### What if Socket.io fails?

> The database remains authoritative, and the frontend can refresh or use a fallback mechanism.

---

# 76. VIVA — ARCHITECTURE

### Explain the whole architecture in 30 seconds.

> The frontend is built with React and communicates with a Node.js Express backend. Supabase Auth handles authentication and provides JWTs, while Express handles RBAC and business logic. PostgreSQL with PostGIS stores the application data, with RLS providing database-level protection. Gemini handles conversational symptom structuring, while a separate Python FastAPI service runs the custom ML triage model. Socket.io provides realtime queue and alert updates.

---

# 77. VIVA — WHY NOT FIREBASE?

Answer:

> Firebase is not part of our final architecture. We selected Supabase PostgreSQL because our data is relational, we need PostgreSQL features and PostGIS, and Supabase also provides authentication and RLS.

---

# 78. VIVA — WHY NOT MONGODB?

Answer:

> The project has structured relationships between patients, visits, symptoms, triage and queue records. PostgreSQL gives us relational integrity, foreign keys, transactions and strong querying capabilities.

---

# 79. VIVA — WHY LOVABLE?

Answer:

> Lovable was used only for rapidly creating the initial frontend UI. We deliberately separated it from the backend because the final architecture requires controlled implementation of authentication, database, security, AI, ML and realtime services.

---

# 80. VIVA — WHY ANTIGRAVITY?

Answer:

> Antigravity is used as the main implementation environment where the Lovable frontend is refined and connected to the actual Express, Supabase, AI, ML and Socket.io architecture.

---

# 81. MOST IMPORTANT VIVA POINT

Never say:

> "The AI decides which patient should be treated first."

Say:

> "The system generates a preliminary triage-support recommendation using structured AI input, a prototype ML classifier and deterministic safety rules. The final clinical decision remains with authorized healthcare professionals."

This distinction is important.

---

# 82. PROJECT DEMO ORDER

Use this order during presentation:

```text
1. Login
2. Staff dashboard
3. Register patient
4. Create OPD visit
5. Enter symptoms
6. AI interaction
7. Structured symptom output
8. Preliminary triage
9. Queue ticket
10. Realtime queue update
11. Doctor dashboard
12. Patient call
13. Visit completion
14. Analytics
15. Security/admin demonstration
```

---

# 83. DEMO DATA

Always use:

```text
Synthetic patient
Synthetic phone
Synthetic symptoms
Synthetic staff
Synthetic doctor
```

Never demonstrate with real patient information.

---

# 84. FINAL PRESENTATION STRUCTURE

Recommended 10–12 slides:

```text
1. Title
2. Problem
3. Existing System Limitations
4. Proposed Solution
5. Objectives
6. System Architecture
7. AI + ML Pipeline
8. Database + Security
9. Main Workflow/UI
10. Results/Testing
11. Future Scope
12. Conclusion
```

---

# 85. SLIDE — PROBLEM

Keep it concise:

```text
Manual registration
Long queues
Fragmented records
Limited realtime visibility
Repetitive symptom collection
Limited preliminary prioritization
```

---

# 86. SLIDE — SOLUTION

```text
Digital OPD
+
AI-assisted symptom interaction
+
ML preliminary triage
+
Priority-aware queue
+
Realtime dashboards
+
Secure role-based access
```

---

# 87. SLIDE — AI/ML

Show:

```text
Patient language
 ↓
Gemini
 ↓
Structured symptoms
 ↓
Safety rules
 ↓
ML model
 ↓
RED / YELLOW / GREEN
 ↓
Staff review
```

---

# 88. SLIDE — SECURITY

Show:

```text
Supabase Auth
 ↓
JWT
 ↓
RBAC
 ↓
Express
 ↓
RLS
 ↓
PostgreSQL
```

Mention:

```text
API keys backend-only
audit logs
input validation
rate limiting
Socket authentication
```

---

# 89. SLIDE — EXPECTED/MEASURED BENEFITS

Do not invent percentages.

Describe measurable goals:

```text
Reduced manual data entry
Better queue visibility
Structured symptom information
Faster operational coordination
Centralized records
Realtime dashboard updates
Preliminary prioritization support
```

If actual experiments provide numbers, replace qualitative statements with measured results.

---

# 90. FINAL PROJECT STATEMENT

Use this as the final one-line explanation:

> We are developing a secure web-based OPD management system that digitizes patient and visit workflows, uses AI to structure symptom information, applies a prototype ML model for preliminary triage support, and provides priority-aware realtime queue management for staff and doctors.

---

# 91. FINAL TECHNICAL STATEMENT

```text
Frontend:
React + Vite + Tailwind

Backend:
Node.js + Express

Authentication:
Supabase Auth

Security:
JWT + RBAC + RLS

Database:
Supabase PostgreSQL + PostGIS

AI:
Gemini

ML:
Python + FastAPI + scikit-learn

Realtime:
Socket.io
```

---

# 92. FINAL PROJECT BOUNDARY

This project is:

```text
A semester-level web prototype
```

It is not:

```text
A clinically validated medical device
A diagnostic system
A hospital production HIS/EMR replacement
A substitute for doctors
```

Any future production deployment would require additional:

```text
clinical validation
privacy/compliance review
security assessment
penetration testing
institutional approval
operational monitoring
```

---

# 93. FINAL 14-DOCUMENT ARCHITECTURE

The complete planning set is now:

```text
01. MASTER PROJECT PLAN
02. PROJECT REQUIREMENTS / FUNCTIONAL PLAN
03. LOVABLE FRONTEND-ONLY PLAN
04. UI/UX + FRONTEND IMPLEMENTATION PLAN
05. DATABASE / SUPABASE ARCHITECTURE PLAN
06. DATASET + AI/ML STRATEGY
07. AI MODEL DEVELOPMENT PLAN
08. BACKEND DEVELOPMENT PLAN
09. SECURITY AND RBAC PLAN
10. API ENDPOINTS AND DATABASE SCHEMA PLAN
11. SUPABASE IMPLEMENTATION PLAN
12. GEMINI API AND FREE SERVICES PLAN
13. ANTIGRAVITY FULL BUILD PLAN
14. FINAL PROJECT DOCUMENTATION AND VIVA PLAN
```

The exact filenames can differ from the original planning set if earlier files were named differently; the architectural responsibilities remain the same.

---

# 94. FINAL MASTER FLOW

```text
                    LOVABLE
                       │
                FRONTEND ONLY
                       │
                       ▼
                 ANTIGRAVITY
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     FRONTEND       EXPRESS       SUPABASE
                       │              │
                       │          PostgreSQL
                       │          + PostGIS
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
            GEMINI    ML      SOCKET.IO
                      │
                  FastAPI
                      │
                      ▼
                TRIAGE RESULT
                      │
                      ▼
                    QUEUE
                      │
                      ▼
                STAFF/DOCTOR
                      │
                      ▼
                  COMPLETION
                      │
                      ▼
                  ANALYTICS
```

---

# 95. FINAL SUCCESS CRITERIA

The project should be considered complete only when:

- [ ] Frontend works responsively
- [ ] Supabase Auth works
- [ ] JWT verification works
- [ ] RBAC works
- [ ] RLS policies work
- [ ] Patient registration works
- [ ] Visit creation works
- [ ] Symptom collection works
- [ ] Gemini integration works
- [ ] AI output validation works
- [ ] Dataset pipeline works
- [ ] ML model is evaluated
- [ ] FastAPI inference works
- [ ] Safety engine works
- [ ] Queue works
- [ ] Socket.io works
- [ ] Alerts work
- [ ] Doctor workflow works
- [ ] Admin workflow works
- [ ] Analytics work
- [ ] Audit logging works
- [ ] Failure fallbacks work
- [ ] Security tests pass
- [ ] End-to-end workflow passes
- [ ] Documentation is updated
- [ ] Demo uses synthetic data

---

# 96. FINAL RULE

Do not optimize the project for the number of technologies used.

Optimize it for:

```text
Correct architecture
+
Working workflow
+
Security
+
Explainability
+
Testability
+
Maintainability
```

The strongest semester project is not the one with the most APIs.

It is the one where every technology has a clear purpose and the complete system works end-to-end.
