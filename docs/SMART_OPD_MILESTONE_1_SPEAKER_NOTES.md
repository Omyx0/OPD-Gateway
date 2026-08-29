# Smart Digital OPD Management System with AI-Based Patient Triage
## Milestone 1 — Initial Progress Review — Speaker Notes

These notes give 2–5 talking points per slide so the presenter can explain each
slide naturally. Keep the framing consistent: this is a *foundation / progress*
review, not a finished product. Be careful to distinguish what has been **done**
(architecture, minimal prototype, exploration/research) from what is **planned**.

---

### Slide 1 — Title
- Introduce the project: a web-based Smart Digital OPD Management System with AI-assisted patient triage.
- State clearly that this is a **Milestone 1 / Initial Progress Review**, not a final defense.
- Mention the team, department, institution and academic year (fill in on the slide).
- Set expectations: today we present the foundation and the direction, not a completed system.

### Slide 2 — Project Introduction
- We are building a web application that improves the outpatient (OPD) workflow end to end.
- It covers digital registration, OPD visit management and structured symptom collection.
- On top of that we add AI-assisted symptom understanding, preliminary ML-based triage, safety rules and a priority-aware queue with realtime coordination between staff and doctors.
- Walk the audience along the simple flow: Patient → Registration → Visit → Symptoms → AI understanding → Preliminary triage → Priority queue → Doctor.
- Emphasise "assisted" and "preliminary" — the system supports staff, it does not replace clinical judgement.

### Slide 3 — Existing System & Problem
- Digital OPD is not new: national ecosystems such as India's ORS / eHospital already provide substantial digital capability — registration, appointments, patient records, digital OPD slips, prescriptions, lab reports, administration and reporting dashboards.
- So the problem is **not** "hospitals are fully manual." Be explicit about this so the panel sees we did our homework.
- The opportunity we target: existing systems digitise *administration and records* very well, but there is room for a more integrated, intelligent OPD workflow.
- Our focus adds AI-assisted symptom understanding, preliminary ML triage, deterministic safety rules, priority-aware live queues and realtime coordination on top of that digital foundation.
- Avoid any claim of being "the first" or that no hospital has digital/AI systems.

### Slide 4 — Objectives
- Read the objectives as a set of intentions for the full project, not all achieved yet.
- Group them mentally: (1–2) digitise and structure OPD data; (3–5) the intelligence layer — AI symptom interaction, prototype ML triage, safety rules; (6) queue and realtime coordination; (7) security and RBAC; (8) foundation for future patient-facing services.
- Stress that the ML triage is a *prototype* and safety rules run *before* prioritisation.

### Slide 5 — Proposed Smart OPD Workflow
- This is the complete conceptual workflow the full system is designed around.
- Point out the ordering: AI structures the symptoms first, then deterministic **safety rules** are evaluated, then the ML model produces a **preliminary** triage priority.
- Safety rules take precedence over the model — a red-flag symptom forces high priority regardless of the model.
- Restate the key boundary: AI does **not** diagnose. It produces preliminary triage / decision support; the final clinical decision stays with the authorised healthcare professional.

### Slide 6 — System Architecture
- High-level only: React front end talks to a Node.js + Express backend.
- The backend coordinates three services: Supabase PostgreSQL (with PostGIS) for data, Gemini for AI language tasks, and a Python FastAPI service running scikit-learn for the custom ML triage model.
- Security spans the stack: Supabase Auth → JWT → RBAC → Row-Level Security in PostgreSQL.
- Realtime is handled by **Socket.io** — this is the single realtime layer for live queue/status updates.
- If asked: no Firebase, no MongoDB, no separate realtime service — one relational source of truth and one realtime layer keeps the design consistent.

### Slide 7 — Milestone 1: Initial System Foundation
- This is the core "what have you actually done" slide — be precise and honest.
- (1) Architecture: the overall Smart OPD workflow, components and data flow are defined.
- (2) Minimal frontend: an initial clickable prototype of the OPD workflow and interface structure exists — describe it as an **initial/minimal prototype driven by mock data**, not the final UI.
- (3) Initial backend foundation: early server-side groundwork is in place to support future OPD APIs — the complete backend is **not** finished.
- (4) AI/ML approach: the AI-assisted symptom workflow, the preliminary ML triage approach and the safety-rule layer have been explored and defined.
- (5) Dataset exploration: relevant healthcare/symptom datasets have been examined for suitability — no final model has been trained.
- (6) Existing-system research: digital OPD ecosystems (ORS/eHospital) were studied to identify the project's gap and differentiation.

### Slide 8 — AI/ML & Dataset Exploration
- We have already begun the intelligent-system research, not just the UI.
- Explain the pipeline: candidate datasets → feature/label analysis → preprocessing strategy → candidate models → a preliminary triage model.
- Name only datasets we genuinely examined (e.g. MIMIC-IV-ED and its demo subset, Symptom2Disease; others considered as optional/supporting).
- The triage target is an operational priority (RED / YELLOW / GREEN), mapped from dataset acuity — this is an operational prioritisation label, not a medical diagnosis.
- Candidate models under consideration: TF-IDF + Logistic Regression as a baseline, then Random Forest / XGBoost.
- Be explicit: **no accuracy or performance numbers yet** — the model has not been trained; any figures in the plans are placeholders.

### Slide 9 — Current Status & Next Steps
- Left column = achieved: architecture defined, minimal frontend prototype, initial backend foundation, AI/ML workflow explored, datasets explored, existing systems researched, direction established.
- Right column = next milestone (future work): complete the database, implement auth/authorisation, build the full backend APIs, integrate the AI symptom pipeline, prepare/preprocess the dataset, train and evaluate the ML model, implement the safety-rule engine, build realtime queue management, integrate front end with backend, then testing and validation.
- Keep the two columns clearly separated — do not let the panel think the "next" items are done.

### Slide 10 — Project Direction (Conclusion)
- Tie it together: existing digital OPD systems already handle registration, appointments, records and operations well.
- Our contribution is to integrate AI-assisted symptom understanding, preliminary ML triage, safety-rule evaluation and a realtime priority-aware queue into one focused OPD workflow.
- Close with the honest positioning: a secure, intelligent, realtime OPD workflow built as a semester-level **prototype** — decision support for staff, not autonomous diagnosis or a doctor replacement.
- Invite questions.
