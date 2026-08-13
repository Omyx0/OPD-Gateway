# AI MODEL DEVELOPMENT PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 07 / 14  
**Purpose:** Complete AI/ML development, evaluation, deployment and integration plan  
**AI architecture:** Hybrid ML + Gemini + deterministic safety rules + human review  
**Primary research dataset:** MIMIC-IV-ED / MIMIC-IV-ED Demo  
**Supporting dataset:** Symptom2Disease  
**Application data:** Synthetic data  
**Backend:** Node.js + Express  
**Database:** Supabase PostgreSQL + PostGIS  
**Authentication:** Supabase Auth + JWT verification  
**Authorization:** RBAC  
**Realtime:** Socket.io  
**AI API:** Gemini  
**ML runtime:** Python service  
**Status:** Development blueprint

---

# 1. CORE AI DECISION

We are **not building one giant AI model**.

The application will use a hybrid architecture:

```text
Patient
   ↓
Frontend symptom collection
   ↓
Backend
   ↓
Gemini conversational layer
   ↓
Structured symptom information
   ↓
Safety rule engine
   ↓
Task-specific ML triage model
   ↓
Confidence / risk checks
   ↓
Final triage recommendation
   ↓
Human staff escalation where required
   ↓
Queue priority
```

This is more realistic, explainable and implementable than attempting to train an LLM from scratch.

---

# 2. WHAT EXACTLY ARE WE BUILDING?

The AI component has three related jobs:

## A. Symptom understanding

Convert free-form patient input into structured information.

Example:

```text
"I have fever since two days and I feel very weak."
```

becomes:

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
  ]
}
```

---

## B. Preliminary triage classification

Estimate an operational urgency level:

```text
RED
YELLOW
GREEN
```

where:

```text
RED
→ emergency / immediate staff attention

YELLOW
→ priority clinical review

GREEN
→ routine OPD queue
```

These labels are **project-defined operational categories**, not universal clinical standards.

---

## C. Safety escalation

Detect configured high-risk signals and prevent the model from silently assigning a routine priority.

Example:

```text
Red-flag symptom detected
        ↓
Immediate escalation
        ↓
Staff alert
```

---

# 3. IMPORTANT: AI IS NOT DIAGNOSIS

The model must not be presented as:

```text
Patient symptoms
      ↓
Disease diagnosis
```

Instead:

```text
Patient symptoms
      ↓
Urgency assessment
      ↓
Staff review
```

The application should explicitly state:

> AI-assisted preliminary triage does not replace a healthcare professional.

---

# 4. WHY A HYBRID MODEL?

A pure LLM approach creates problems:

- difficult to evaluate consistently
- potentially inconsistent outputs
- harder to explain academically
- unnecessary API usage
- harder to guarantee valid labels

A pure classical ML approach has different limitations:

- weaker conversational understanding
- poor handling of free-form language
- less useful for multilingual interaction
- harder to conduct adaptive questioning

Therefore:

```text
Gemini
→ understands/converses

ML model
→ provides reproducible triage baseline

Rules
→ enforce configured safety conditions

Human
→ final clinical authority
```

---

# 5. MODEL 01 — TRIAGE CLASSIFIER

## Recommended baseline

Start with:

```text
TF-IDF
+
Logistic Regression
```

for text-based experiments.

Then build a multimodal/tabular classifier:

```text
Chief complaint / symptom text
+
Vital signs
+
Pain
+
Relevant context
        ↓
Feature vector
        ↓
Classifier
        ↓
RED / YELLOW / GREEN
```

Candidate models:

1. Logistic Regression
2. Random Forest
3. XGBoost, if available and useful

Do not train all models blindly. Establish a baseline first and compare only a small number of meaningful candidates.

---

# 6. WHY LOGISTIC REGRESSION FIRST?

It is:

- fast
- interpretable
- easy to debug
- suitable for TF-IDF
- suitable for multiclass classification
- easy to deploy
- easy to explain in a viva

The first milestone is not "highest possible AI accuracy."

The first milestone is:

> A reproducible, measurable baseline.

---

# 7. TRIAGE INPUT FEATURES

Potential inputs:

## Text

```text
chief complaint
patient symptom description
```

## Vital signs

```text
temperature
heart rate
respiratory rate
oxygen saturation
systolic blood pressure
diastolic blood pressure
```

## Patient-reported information

```text
pain score
symptom duration
```

## Optional context

Only use demographic/context variables if they improve performance without creating inappropriate bias.

Do not collect variables simply because they exist in a dataset.

---

# 8. LABEL SOURCE

MIMIC-IV-ED provides emergency-department acuity values from 1 to 5, where 1 represents the highest severity and 5 the lowest. citeturn1search3

For the project, define:

```text
Acuity 1–2 → RED
Acuity 3   → YELLOW
Acuity 4–5 → GREEN
```

This is a **project-specific mapping**.

It must be documented as such and not claimed to be a universal clinical triage standard.

---

# 9. DATA PREPROCESSING

Create a dedicated Python preprocessing pipeline.

```text
Raw dataset
    ↓
Schema validation
    ↓
Select relevant fields
    ↓
Remove invalid records
    ↓
Handle missing values
    ↓
Normalize units
    ↓
Normalize text
    ↓
Create target labels
    ↓
Feature engineering
    ↓
Patient/encounter-aware split
```

---

# 10. MISSING VALUES

Clinical data will contain missing values.

Do not simply delete every row.

For each feature, decide:

```text
Drop
Impute
Mark as missing
Use model-native handling
```

Example:

```text
Missing temperature
→ retain record
→ add missing indicator
```

The strategy must be documented.

---

# 11. TEXT PROCESSING

For the first baseline:

```text
Raw complaint
 ↓
Normalize whitespace
 ↓
Lowercase where appropriate
 ↓
TF-IDF
 ↓
Sparse feature matrix
```

Do not remove clinically meaningful words merely because they are common.

The preprocessing pipeline used during training must be identical to the pipeline used during inference.

---

# 12. FEATURE ENGINEERING

Potential derived features:

```text
fever_present
tachycardia_indicator
hypoxia_indicator
severe_pain_indicator
symptom_duration_numeric
```

However, these indicators should be introduced carefully and documented.

Do not hard-code clinical thresholds as if they were universally valid medical rules without qualified review.

---

# 13. DATA SPLITTING

Recommended initial split:

```text
70% Training
15% Validation
15% Test
```

Use a patient/encounter-aware strategy where applicable.

The test set must remain untouched during model selection.

---

# 14. DATA LEAKAGE PREVENTION

Check for:

- same patient across train/test
- duplicated encounters
- duplicate symptom narratives
- post-outcome variables
- features that would not be available at triage time

Do not use information generated after the triage decision as an input to predict that same decision.

This is one of the most important parts of the ML methodology.

---

# 15. CLASS IMBALANCE

Inspect:

```text
RED count
YELLOW count
GREEN count
```

If classes are imbalanced:

- use class weights
- use stratified sampling
- evaluate per class

Avoid blindly oversampling the test set.

---

# 16. MODEL TRAINING

Pipeline:

```text
Training data
      ↓
TF-IDF/vectorizer
      ↓
Feature matrix
      ↓
Classifier
      ↓
Validation
      ↓
Hyperparameter tuning
      ↓
Final model
```

Keep the vectorizer and classifier together.

---

# 17. BASELINE EXPERIMENTS

Run a small controlled experiment set.

### Experiment A

```text
Text only
↓
TF-IDF + Logistic Regression
```

### Experiment B

```text
Vital signs only
↓
Logistic Regression / Random Forest
```

### Experiment C

```text
Text + vitals + pain
↓
Classifier
```

### Experiment D

```text
Best feature set
+
best candidate classifier
```

Compare them using the same test protocol.

---

# 18. MODEL EVALUATION

Do not report accuracy alone.

Report:

```text
Accuracy
Precision
Recall
F1-score
Macro F1
Confusion matrix
```

For triage, emphasize:

```text
Recall for RED
```

because a false-negative emergency classification is particularly important.

Also inspect:

```text
RED → GREEN
RED → YELLOW
```

errors separately.

---

# 19. CONFIDENCE

If the model supports probabilities, expose a confidence value internally.

Example:

```json
{
  "red": 0.08,
  "yellow": 0.84,
  "green": 0.08
}
```

Do not present:

```text
84% medically certain
```

Instead:

```text
Model confidence: 0.84
```

and treat it as a model score, not clinical certainty.

---

# 20. LOW-CONFIDENCE HANDLING

Example:

```text
Model confidence
       ↓
< configured threshold?
       ↓
YES
       ↓
STAFF REVIEW
```

Do not force uncertain cases into a confident-looking category.

The threshold should be selected using validation data and documented.

---

# 21. SAFETY RULE ENGINE

The safety layer sits outside the ML model.

```text
Structured symptoms
       ↓
Safety rules
       ↓
ML triage
```

Potential project red-flag examples may include:

- severe breathing difficulty
- severe chest pain
- loss of consciousness
- severe uncontrolled bleeding

These are examples for system design only.

Any final clinical rule set must be reviewed by an appropriately qualified medical/domain advisor.

---

# 22. RULE PRIORITY

A simplified decision structure:

```text
IF configured emergency red flag
    → emergency escalation

ELSE IF model confidence is too low
    → staff review

ELSE
    → use model recommendation
```

This prevents the AI from overriding explicit safety conditions.

---

# 23. GEMINI'S ROLE

Gemini is not the trained triage classifier.

Gemini is used for:

- conversational questioning
- symptom extraction
- multilingual interaction
- structured summarization
- image/document understanding
- OCR-style extraction

Example:

```text
Patient:
"I've had fever and weakness since yesterday."

Gemini
↓
Structured symptom JSON
↓
Our backend
↓
ML/rules
```

---

# 24. GEMINI STRUCTURED OUTPUT

Request a constrained JSON structure.

Example:

```json
{
  "symptoms": [
    {
      "name": "fever",
      "duration": "1 day"
    }
  ],
  "severity": "moderate",
  "redFlags": [],
  "missingInformation": [
    "temperature"
  ]
}
```

The backend must validate this response before using it.

Structured output guarantees format, not correctness.

---

# 25. ADAPTIVE QUESTIONS

Gemini can identify missing information.

Example:

```text
Patient:
"I have chest discomfort."

Missing:
- duration
- severity
- associated symptoms
```

Gemini asks:

```text
"How severe is the discomfort from 0 to 10?"
```

Then:

```text
Patient answer
 ↓
Structured context
 ↓
Triage
```

Limit the number of questions to avoid making the kiosk interaction unnecessarily long.

---

# 26. AI CONVERSATION GUARDRAILS

The AI should not:

- diagnose diseases
- prescribe medication
- give treatment plans
- override staff
- hide emergency warnings
- claim certainty
- fabricate patient information

It should:

- collect information
- clarify symptoms
- summarize information
- identify configured red flags
- support preliminary triage

---

# 27. AI PROMPT STRUCTURE

The backend should maintain versioned prompts.

Example:

```text
SYSTEM ROLE
You are an OPD symptom-intake assistant.

PURPOSE
Collect relevant symptom information.

RESTRICTIONS
Do not diagnose.
Do not prescribe.
Do not claim certainty.

OUTPUT
Return only the defined JSON structure.

ESCALATION
If configured emergency indicators are present,
mark the case for immediate staff review.
```

Do not place this system prompt in frontend code.

---

# 28. MODEL + GEMINI COMBINATION

Recommended:

```text
Patient speech/text
       ↓
Gemini
       ↓
Structured symptoms
       ↓
Safety rule engine
       ↓
ML triage classifier
       ↓
Confidence
       ↓
Final recommendation
```

This makes the ML component measurable while allowing Gemini to handle natural conversation.

---

# 29. OPTIONAL GEMINI-ONLY FALLBACK

If the local ML model is unavailable:

```text
ML unavailable
      ↓
Do not silently substitute an unvalidated AI decision
      ↓
Manual staff review
```

Do not make Gemini an invisible replacement for the evaluated ML model.

For the semester demo, it is safer to show:

```text
AI assistance unavailable
→ Continue with manual triage
```

---

# 30. ML MODEL DEPLOYMENT

Recommended architecture:

```text
Node.js + Express
        ↓
ML inference service
        ↓
Python FastAPI
        ↓
Loaded model
        ↓
Prediction
        ↓
JSON
        ↓
Express
```

Example:

```http
POST /predict-triage
```

Input:

```json
{
  "chiefComplaint": "fever and weakness",
  "temperature": 38.4,
  "heartRate": 96,
  "respiratoryRate": 19,
  "oxygenSaturation": 97,
  "pain": 3
}
```

Output:

```json
{
  "priority": "YELLOW",
  "confidence": 0.84,
  "modelVersion": "triage-v1"
}
```

---

# 31. WHY A PYTHON ML SERVICE?

The main application is Node.js, but Python is preferable for:

- pandas
- scikit-learn
- model experimentation
- evaluation
- serialization
- reproducible ML pipelines

Therefore:

```text
Node.js
→ application/backend

Python
→ ML inference
```

Keep the boundary clean.

---

# 32. ML SERVICE SECURITY

The Python service must not be publicly exposed without protection.

Preferred:

```text
Internet
 ↓
Express
 ↓
Internal ML service
```

Not:

```text
Internet
 ↓
Public FastAPI prediction endpoint
```

Validate all inputs.

---

# 33. MODEL ARTIFACTS

Store:

```text
model
vectorizer
feature configuration
label mapping
metadata
```

Example:

```text
models/
└── triage-v1/
    ├── model.joblib
    ├── vectorizer.joblib
    ├── labels.json
    └── metadata.json
```

Do not load untrusted serialized model files.

---

# 34. MODEL METADATA

Example:

```json
{
  "modelVersion": "triage-v1",
  "dataset": "MIMIC-IV-ED",
  "features": [
    "chief_complaint",
    "temperature",
    "heart_rate",
    "respiratory_rate",
    "oxygen_saturation",
    "pain"
  ],
  "labels": [
    "RED",
    "YELLOW",
    "GREEN"
  ]
}
```

Performance values should be added only after actual evaluation.

---

# 35. DATABASE STORAGE OF AI RESULTS

Store structured results in Supabase PostgreSQL.

Example:

```text
triage_assessments
```

Fields can include:

```text
visit_id
urgency
confidence
recommended_action
red_flags
model_name
model_version
created_at
```

Do not store chain-of-thought.

---

# 36. AI INTERACTION LOGGING

Store metadata:

```text
provider
model
operation
latency
success
model_version
timestamp
```

Avoid storing full sensitive conversations unless explicitly required.

---

# 37. API SECURITY

The AI endpoints are protected by:

```text
Supabase Auth
 ↓
JWT
 ↓
Express
 ↓
RBAC
 ↓
Input validation
 ↓
Rate limiting
 ↓
AI service
```

Example:

```text
POST /api/triage
```

requires authentication for staff-side operations.

Patient kiosk endpoints should have carefully scoped permissions and should not expose privileged staff operations.

---

# 38. RATE LIMITING

Protect:

```text
/api/triage
/api/symptoms
/api/ocr
```

from abuse.

Possible strategy:

```text
Per IP
+
Per authenticated user
+
Per visit/session
```

Do not retry AI requests indefinitely.

---

# 39. AI FAILURE STATES

If Gemini fails:

```text
Gemini unavailable
 ↓
Fallback to manual symptom entry/review
```

If ML service fails:

```text
ML unavailable
 ↓
Manual staff triage
```

If both fail:

```text
Human staff
 ↓
Manual process
```

The OPD must not become unusable because AI is unavailable.

---

# 40. MODEL MONITORING

During the project, record:

```text
prediction count
class distribution
confidence distribution
error count
latency
model version
```

Do not automatically retrain from live patient data.

Any future retraining process should use an approved dataset and controlled evaluation.

---

# 41. BIAS / FAIRNESS CHECK

Where feasible, compare performance across relevant groups available in the dataset.

Examples:

```text
age groups
sex/gender categories
language groups
```

Do not use protected attributes unnecessarily.

If a group has too little data, explicitly report that the evaluation is inconclusive.

---

# 42. TEST CASES

Create test categories:

### Routine

```text
Mild symptoms
Stable vitals
No red flags
```

### Priority

```text
Moderate symptoms
Potential concerning features
```

### Emergency

```text
Configured red flags
```

### Ambiguous

```text
Incomplete information
```

### Missing data

```text
No vital signs
```

### Language variation

```text
English
Hindi
Mixed-language input
```

The expected result must be defined before testing.

---

# 43. END-TO-END AI FLOW

```text
Patient speaks/types
        ↓
Web Speech API / text
        ↓
Express
        ↓
Gemini symptom extraction
        ↓
Structured JSON validation
        ↓
Safety rules
        ↓
ML triage service
        ↓
Confidence evaluation
        ↓
Triage recommendation
        ↓
Store assessment
        ↓
Create queue ticket
        ↓
Socket.io event
        ↓
Staff dashboard
```

---

# 44. EXAMPLE END-TO-END REQUEST

Patient:

```text
"I have fever for two days and feel weak."
```

Gemini:

```json
{
  "symptoms": [
    {"name": "fever", "duration": "2 days"},
    {"name": "weakness", "duration": "2 days"}
  ],
  "redFlags": [],
  "missingInformation": [
    "temperature"
  ]
}
```

System asks:

```text
"What is your temperature, if you know it?"
```

Patient:

```text
"38.4"
```

Backend builds:

```json
{
  "chiefComplaint": "fever and weakness",
  "temperature": 38.4,
  "heartRate": null,
  "respiratoryRate": null,
  "oxygenSaturation": null,
  "pain": null
}
```

ML:

```json
{
  "priority": "YELLOW",
  "confidence": 0.84
}
```

Safety layer:

```text
No configured emergency red flag.
```

Final:

```text
YELLOW
→ Priority review
→ Queue ticket generated
```

The numerical confidence above is an example only. Never present it as an actual model result before training.

---

# 45. WHAT HAPPENS IF AI SAYS GREEN BUT RULE SAYS RED?

The rule wins.

```text
AI:
GREEN

Safety rule:
RED FLAG

Final:
RED / IMMEDIATE STAFF REVIEW
```

This is an explicit safety invariant.

---

# 46. WHAT HAPPENS IF MODEL CONFIDENCE IS LOW?

Example:

```text
RED: 0.32
YELLOW: 0.35
GREEN: 0.33
```

This is uncertain.

System:

```text
LOW CONFIDENCE
 ↓
STAFF REVIEW
```

Do not force the result into the queue as if it were reliable.

---

# 47. WHAT HAPPENS IF GEMINI OUTPUT IS INVALID?

Example:

```text
Expected JSON
Received malformed response
```

Backend:

```text
Validate
 ↓
Invalid
 ↓
Do not use output
 ↓
Retry once if appropriate
 ↓
Otherwise manual review
```

Never blindly parse arbitrary AI text into clinical fields.

---

# 48. MODEL DEVELOPMENT MILESTONES

## Milestone 1

Load MIMIC-IV-ED Demo.

## Milestone 2

Clean and preprocess.

## Milestone 3

Create triage labels.

## Milestone 4

Train TF-IDF + Logistic Regression.

## Milestone 5

Evaluate baseline.

## Milestone 6

Add vital signs.

## Milestone 7

Compare candidate models.

## Milestone 8

Freeze model version.

## Milestone 9

Create Python inference API.

## Milestone 10

Connect Express.

## Milestone 11

Integrate Gemini.

## Milestone 12

Add safety rules.

## Milestone 13

Connect Supabase.

## Milestone 14

Connect Socket.io.

## Milestone 15

Run end-to-end evaluation.

---

# 49. SUCCESS CRITERIA

The AI portion is considered successful when:

- Dataset pipeline is reproducible.
- Model training is reproducible.
- Test set remains isolated.
- Metrics are documented.
- RED recall is explicitly reported.
- Model version is recorded.
- Gemini output is schema-validated.
- Safety rules override unsafe AI outputs.
- Low-confidence cases escalate.
- AI failure does not break OPD.
- No real patient data is used in development.
- Backend protects AI endpoints.
- Staff remains the final authority.

---

# 50. FINAL AI ARCHITECTURE

```text
                  PATIENT
                     │
             Speech / Text / Image
                     │
                     ▼
                EXPRESS API
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
       Gemini               Safety Rules
   Conversation/OCR              │
          │                      │
          └──────────┬───────────┘
                     ▼
               Structured Data
                     │
                     ▼
              Python ML Service
                     │
                     ▼
              Triage Prediction
                     │
               Confidence Check
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
       Confident              Uncertain
          │                     │
          ▼                     ▼
  Safety-approved         Staff Review
     priority
          │
          ▼
    Supabase PostgreSQL
          │
          ▼
       Socket.io
          │
          ▼
    Staff Dashboard
```

---

# 51. FINAL PRINCIPLE

The project should demonstrate **real AI/ML engineering**, not simply an API call.

The academic contribution is:

```text
Dataset
 ↓
Preprocessing
 ↓
Feature engineering
 ↓
ML model
 ↓
Evaluation
 ↓
Model serving
 ↓
Gemini conversational layer
 ↓
Safety/risk layer
 ↓
Backend integration
 ↓
Real OPD workflow
```

Gemini makes the interaction intelligent.

The task-specific ML model makes the triage experiment measurable.

The safety layer prevents the AI from becoming the sole authority.

The human staff member remains the final decision-maker.
