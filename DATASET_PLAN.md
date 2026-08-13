# DATASET PLAN
## Smart Digital OPD Management System with AI-Based Patient Triage

**Document:** 06 / 14  
**Purpose:** Dataset selection, acquisition, preprocessing, model-development and evaluation plan  
**Application:** Web application  
**AI role:** Preliminary/assistive triage only  
**Data policy:** Synthetic patient data for application demos; public/de-identified datasets for model development/evaluation  
**Verification date:** 10 August 2026

---

# 1. IMPORTANT AI ARCHITECTURE DECISION

The project should **not** attempt to train a large medical language model from scratch.

Instead, use a hybrid approach:

```text
Public / synthetic datasets
        ↓
Preprocessing
        ↓
Small task-specific ML components
        +
Gemini API for conversational AI
        ↓
Structured triage output
        ↓
Rule-based safety validation
        ↓
Human staff review
        ↓
OPD priority
```

This is more realistic for a semester project.

The datasets are primarily used to:

- build/evaluate a triage classifier
- normalize symptom language
- test symptom extraction
- test medical dialogue handling
- benchmark the system
- generate safe synthetic demonstrations

They are **not** used to create an autonomous diagnostic system.

---

# 2. DATASET CATEGORIES

We need different datasets for different tasks.

```text
A. Triage / acuity
B. Symptom language
C. Medical dialogue
D. Clinical records
E. Synthetic application data
F. Evaluation/test data
```

No single dataset should be expected to perform all of these jobs.

---

# 3. DATASET 01 — MIMIC-IV-ED

## Role

**Primary research dataset for triage/acuity experimentation.**

MIMIC-IV-ED contains approximately 425,000 emergency-department stays and includes:

- Triage information
- Vital signs
- Chief complaint
- Acuity
- Medication reconciliation
- Discharge diagnoses

The triage table includes temperature, heart rate, respiratory rate, oxygen saturation, blood pressure, pain, acuity and chief complaint. Acuity is an integer from 1 (highest severity) to 5 (lowest severity). citeturn1search2turn1search3

This is highly relevant to our triage component.

---

# 4. MIMIC-IV-ED ACCESS

The full MIMIC-IV-ED dataset is not simply an unrestricted download.

PhysioNet requires credentialed access for the restricted MIMIC datasets, including completing required training and signing a data-use agreement. citeturn0search4turn0search0

Therefore:

### Plan A

Use the **MIMIC-IV-ED Demo** immediately for development and pipeline testing.

### Plan B

Apply for full MIMIC-IV-ED credentialed access if time permits and the supervisor/project requirements justify it.

Do not make the entire semester project dependent on receiving credentialed access.

---

# 5. DATASET 02 — MIMIC-IV-ED DEMO

## Role

**Immediate development/test dataset.**

The MIMIC-IV-ED Demo is openly available and is derived from MIMIC-IV-ED. It uses a small subset and is distributed under the Open Data Commons Open Database License 1.0. citeturn1search5

Use it to:

- understand the schema
- build preprocessing scripts
- test feature engineering
- build database import scripts
- test triage classification
- demonstrate evaluation
- validate the ML pipeline

Do not claim that the demo alone is a representative clinical dataset.

---

# 6. WHY MIMIC-IV-ED IS IMPORTANT

Our project needs to demonstrate:

```text
Patient-reported complaint
+
Vital signs
+
Pain
+
Other triage information
        ↓
Triage priority
```

MIMIC-IV-ED directly contains these types of variables.

This makes it substantially more relevant to our project than a generic disease-classification dataset.

---

# 7. DATASET 03 — SYMPTOM2DISEASE

## Role

**Symptom-language / NLP support dataset.**

The dataset contains 1,200 records with:

- `label`
- `text`

It covers 24 disease categories with 50 symptom descriptions per category. Its Kaggle listing identifies the dataset license as CC0/public domain. citeturn0search3

Use it for:

- symptom text normalization
- symptom keyword/entity extraction experiments
- baseline NLP classification
- testing whether free-form symptom descriptions can be mapped to standardized symptom concepts

---

# 8. IMPORTANT LIMITATION OF SYMPTOM2DISEASE

Do **not** use Symptom2Disease as the project's final triage ground truth.

Its task is:

```text
Symptoms → Disease label
```

Our application's task is:

```text
Symptoms + relevant context
        ↓
Urgency / triage priority
```

These are different problems.

Therefore:

> Symptom2Disease is a supporting NLP dataset, not the primary triage dataset.

Do not present a disease prediction model as the core clinical triage model.

---

# 9. DATASET 04 — MEDQUAD

## Role

**Medical question-answering / knowledge-language evaluation.**

MedQuAD contains 47,457 medical question-answer pairs created from 12 NIH websites and covers 37 question types. citeturn2view0

The repository states that the dataset is licensed under CC BY 4.0. citeturn2view0

Use it for:

- medical-language understanding
- question classification
- retrieval/evaluation experiments
- testing whether the system can distinguish question types
- evaluating response grounding if a retrieval component is added

Do not directly train the application to give unrestricted diagnosis/treatment advice from this dataset.

---

# 10. MEDQUAD LICENSING NOTE

MedQuAD contains material originating from multiple NIH websites, and the repository notes that answers from some subsets were removed to respect MedlinePlus copyright. citeturn2view0

Therefore:

- preserve attribution
- follow CC BY requirements
- do not redistribute excluded copyrighted answers
- retain source metadata
- use the dataset primarily for research/evaluation

---

# 11. DATASET 05 — MEDDIALOG

## Role

**Conversational symptom-collection research.**

MedDialog provides large-scale doctor-patient medical dialogues. The published work describes approximately 0.26 million English conversations and 0.51 million English utterances, alongside a much larger Chinese collection. citeturn2academia60turn2search1

Potential uses:

- multi-turn conversation analysis
- symptom-question sequencing
- patient/doctor dialogue structure
- conversation evaluation
- prompt/evaluation design

---

# 12. MEDDIALOG LICENSING CAUTION

Do not automatically treat MedDialog as unrestricted public-domain data.

The dataset contains conversations sourced from online medical services, so provenance and downstream-use terms must be checked before redistributing or using the raw corpus in a deployed product.

For the semester project:

> Use MedDialog primarily for research/analysis if its applicable terms permit it; do not redistribute raw records as part of the application.

---

# 13. DATASET 06 — REMEDI

## Role

**Optional medical dialogue dataset.**

ReMeDi contains 96,965 doctor-patient conversations, including a subset with fine-grained labels, covering many diseases, medical entities and service domains. Its repository states that the resources are licensed under MIT. citeturn2search3

Use it if we need:

- dialogue structure
- medical entity extraction
- multi-domain conversation analysis
- additional conversational evaluation

It is optional because we should not overload the project with datasets.

---

# 14. DATASET 07 — MIMIC-IV CLINICAL DATABASE

## Role

**Optional broader clinical-data research source.**

MIMIC-IV provides deidentified electronic health records and can be linked with other MIMIC resources. Full access is credentialed. citeturn1search6turn0search4

Use only if the project requires:

- broader clinical features
- longitudinal records
- hospitalization context
- additional clinical feature analysis

It is not necessary for the initial MVP.

---

# 15. DATASET 08 — MIMIC-IV-CLINICAL-DEMO

The MIMIC-IV Clinical Database Demo is openly available and contains a subset of 100 patients with a schema similar to MIMIC-IV. It is intended to help researchers assess the database and develop/test workflows. citeturn1search1

Use it for:

- schema exploration
- database integration experiments
- clinical-data preprocessing
- demonstration of relational clinical data

Do not treat the 100-patient demo as sufficient for training a production-quality model.

---

# 16. FINAL DATASET SELECTION

We should **not use every dataset**.

The recommended core set is:

| Dataset | Primary purpose | Priority |
|---|---|---|
| MIMIC-IV-ED Demo | Triage pipeline/testing | REQUIRED |
| MIMIC-IV-ED | Full triage research | OPTIONAL / IF ACCESS |
| Symptom2Disease | Symptom NLP baseline | REQUIRED |
| MedQuAD | Medical QA/evaluation | OPTIONAL |
| MedDialog | Conversation research | OPTIONAL |
| ReMeDi | Additional dialogue evaluation | OPTIONAL |
| MIMIC-IV Demo | Clinical-data experiments | OPTIONAL |
| Synthetic data | Application/demo testing | REQUIRED |

---

# 17. THE MOST IMPORTANT DATASET — TRIAGE

The strongest dataset for the triage model is:

```text
MIMIC-IV-ED
```

because it contains:

```text
Chief complaint
+
Vital signs
+
Pain
+
Acuity
```

and therefore maps more closely to:

```text
Input
 ↓
Triage priority
```

than disease-classification datasets do. citeturn1search3

---

# 18. TRIAGE LABEL MAPPING

MIMIC-IV-ED uses acuity:

```text
1 = highest severity
2
3
4
5 = lowest severity
```

citeturn1search3

For our application, we can create a **project-specific triage mapping** for demonstration, for example:

```text
Acuity 1–2 → RED / Emergency
Acuity 3   → YELLOW / Priority
Acuity 4–5 → GREEN / Routine
```

This is an engineering simplification for the project.

It must NOT be presented as a universal clinical standard.

The mapping should be documented and evaluated separately.

---

# 19. TRIAGE MODEL FEATURES

Potential features:

### Text

```text
chiefcomplaint
```

### Vital signs

```text
temperature
heartrate
resprate
o2sat
sbp
dbp
```

### Patient-reported severity

```text
pain
```

### Optional demographic/context fields

Use only where justified.

Avoid unnecessary sensitive attributes.

---

# 20. PREPROCESSING PIPELINE

```text
Raw Dataset
    ↓
Load CSV
    ↓
Schema Validation
    ↓
Remove invalid records
    ↓
Handle missing values
    ↓
Normalize units
    ↓
Normalize text
    ↓
Encode categorical values
    ↓
Feature engineering
    ↓
Train / Validation / Test split
    ↓
Model
```

Never preprocess the entire dataset using information from the test set.

---

# 21. TEXT PREPROCESSING

For symptom/complaint text:

```text
Raw text
 ↓
Lowercase
 ↓
Whitespace normalization
 ↓
Remove unnecessary artifacts
 ↓
Preserve clinically meaningful terms
 ↓
Tokenization/vectorization
```

Do not aggressively remove medical terms as "stop words."

For a classical ML baseline:

```text
TF-IDF
```

is sufficient.

---

# 22. BASELINE TRIAGE MODEL

Start simple.

Recommended first model:

```text
TF-IDF
+
Logistic Regression
```

for text-only experimentation.

Then create a multimodal/tabular baseline:

```text
Text features
+
Vital signs
+
Pain
 ↓
Logistic Regression / Random Forest / XGBoost
```

The exact final model should be selected based on validation performance and interpretability.

---

# 23. WHY NOT START WITH DEEP LEARNING?

Because the semester project should demonstrate:

- data preparation
- feature engineering
- model training
- evaluation
- backend integration

A strong classical baseline is easier to:

- train
- debug
- explain
- evaluate
- deploy

Then, if time permits:

```text
Baseline
 ↓
Transformer / small neural model
 ↓
Compare
```

---

# 24. MODEL TRAINING STRATEGY

Use:

```text
Training set
    ↓
Model fitting

Validation set
    ↓
Hyperparameter selection

Test set
    ↓
Final evaluation
```

Recommended initial split:

```text
70% Training
15% Validation
15% Test
```

If the dataset/task requires a different split, document the reason.

---

# 25. AVOID DATA LEAKAGE

Do not allow the same patient or near-duplicate encounter to appear across train and test when that would leak information.

For clinical datasets, split at the appropriate patient/encounter level rather than blindly splitting individual rows.

This is especially important when multiple records belong to the same patient.

---

# 26. CLASS IMBALANCE

Triage classes may not be balanced.

Measure:

```text
Class distribution
```

If necessary use:

- class weights
- stratified sampling
- carefully controlled resampling

Do not blindly oversample the test set.

---

# 27. MODEL METRICS

Do not report accuracy alone.

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
Recall for RED / high-acuity cases
```

because missing urgent cases is more concerning than simply misclassifying routine cases.

Also report:

```text
Macro F1
```

so minority classes are not hidden by overall accuracy.

---

# 28. SAFETY EVALUATION

The system should explicitly test:

### False negatives

```text
Emergency case → Routine
```

### False positives

```text
Routine case → Emergency
```

### Uncertain cases

```text
Low-confidence model
        ↓
Human review
```

The model should never silently turn uncertainty into a confident clinical decision.

---

# 29. HYBRID TRIAGE ARCHITECTURE

The final application should not rely solely on the ML model.

Use:

```text
Patient input
     ↓
Symptom extraction
     ↓
Clinical safety rules
     ↓
ML/AI assessment
     ↓
Confidence check
     ↓
Final triage recommendation
     ↓
Staff review when required
```

Example:

```text
Potential red flag detected
        ↓
RED / URGENT REVIEW
        ↓
Staff alert
```

The AI does not autonomously diagnose the patient.

---

# 30. RULE ENGINE + MODEL

The rule engine can catch explicit high-risk signals that should not depend entirely on a statistical model.

Conceptual examples:

```text
Severe breathing difficulty
Severe chest pain
Loss of consciousness
Severe uncontrolled bleeding
Other configured emergency red flags
```

The exact clinical rules must be reviewed by a qualified medical/domain advisor before being presented as clinical guidance.

For the semester demo, clearly label them as project safety rules.

---

# 31. GEMINI'S ROLE

Gemini is **not trained from these datasets inside the application**.

Instead:

```text
Dataset research
       ↓
Understand task
       ↓
Build/evaluate our own baseline model
       +
Design prompts/evaluation cases
       ↓
Gemini API
       ↓
Conversation + structured triage assistance
```

This avoids pretending that we trained Gemini.

---

# 32. DATASET → SYSTEM COMPONENT MAPPING

```text
MIMIC-IV-ED
    ↓
Triage ML / evaluation

Symptom2Disease
    ↓
Symptom NLP baseline

MedQuAD
    ↓
Medical QA / retrieval evaluation

MedDialog / ReMeDi
    ↓
Conversation evaluation

Synthetic dataset
    ↓
Frontend/backend demo

Gemini
    ↓
Live conversational AI + structured assistance
```

---

# 33. SYNTHETIC DATASET

Create our own synthetic dataset specifically for the application's workflow.

Example fields:

```text
patient_id
age
gender
language
symptoms
duration
pain_score
temperature
heart_rate
respiratory_rate
oxygen_saturation
blood_pressure
red_flags
triage_priority
department
expected_action
```

Example:

```json
{
  "patient_id": "DEMO-001",
  "age": 54,
  "language": "hi",
  "symptoms": ["fever", "weakness"],
  "duration": "2 days",
  "pain_score": 3,
  "temperature": 38.4,
  "heart_rate": 96,
  "respiratory_rate": 19,
  "oxygen_saturation": 97,
  "triage_priority": "YELLOW",
  "department": "General Medicine"
}
```

All such records must be fictional.

---

# 34. WHY SYNTHETIC DATA IS REQUIRED

Synthetic data is essential for:

- frontend demos
- API testing
- database seed data
- Socket.io testing
- queue testing
- emergency-state testing
- AI prompt testing
- integration tests

It avoids putting real patient information into the development system.

---

# 35. DATASET STORAGE STRUCTURE

Recommended project structure:

```text
data/
├── raw/
│   ├── mimic_ed/
│   ├── symptom2disease/
│   └── other/
│
├── processed/
│   ├── triage/
│   ├── symptoms/
│   └── dialogue/
│
├── synthetic/
│   ├── patients.json
│   ├── visits.json
│   ├── triage_cases.json
│   └── queue_cases.json
│
└── README.md
```

Do not commit restricted datasets to GitHub.

---

# 36. DATASET LICENSE TRACKING

Maintain:

```text
data/
└── README.md
```

with:

```text
Dataset
Source
Version
Access date
License
Citation
Allowed use
Restrictions
Preprocessing performed
```

This is especially important for datasets with attribution or controlled access.

---

# 37. DATASET ACCESS RULES

### Public/easy-access

Can be downloaded and used according to its license.

Examples:

- Symptom2Disease
- MIMIC-IV-ED Demo
- MedQuAD, subject to CC BY requirements

### Credentialed

Requires access approval/training/DUA.

Example:

- Full MIMIC-IV-ED

### Source/terms require additional review

Example:

- MedDialog

Do not redistribute raw data merely because it can be downloaded.

---

# 38. DATA PRIVACY

Never put real patient information into:

```text
GitHub
Gemini free-tier API
Lovable
demo database
screenshots
logs
```

Use:

```text
Synthetic data
```

for all development and demonstrations.

---

# 39. DATASET PREPROCESSING CODE

Create a separate Python pipeline:

```text
ml/
├── data/
├── preprocessing/
│   ├── clean_triage.py
│   ├── clean_symptoms.py
│   └── split_data.py
│
├── features/
│   ├── text_features.py
│   └── vital_features.py
│
├── models/
│   ├── baseline.py
│   └── evaluate.py
│
└── notebooks/
```

Do not mix ML preprocessing code directly into the Express backend.

The backend should consume the finalized model/service.

---

# 40. MODEL ARTIFACT

If the baseline model is deployed:

```text
trained model
+
vectorizer
+
feature configuration
+
label mapping
```

must be versioned together.

Example:

```text
models/
└── triage_v1/
    ├── model.pkl
    ├── vectorizer.pkl
    ├── labels.json
    └── metadata.json
```

Do not rely on a model file without knowing how its features were generated.

---

# 41. MODEL VERSIONING

Store:

```text
model_version
dataset_version
training_date
features
metrics
```

Example:

```json
{
  "model_version": "triage-v1",
  "dataset": "MIMIC-IV-ED-2.2",
  "macro_f1": 0.81,
  "trained_at": "2026-08-10"
}
```

These numbers are placeholders until the model is actually trained.

Never invent performance results.

---

# 42. EVALUATION DATASET

Keep a final untouched test set.

Use it only after model development.

Evaluation should include:

```text
Normal cases
High-priority cases
Emergency cases
Ambiguous cases
Missing-data cases
Multilingual/symptom-language cases
```

The last three can be constructed synthetically if a public dataset does not provide them.

---

# 43. HUMAN REVIEW SET

Create a small manually reviewed set for the project.

For example:

```text
50–100 synthetic cases
```

Have project/domain reviewers assign:

```text
Expected priority
Reason
Red flags
```

Then compare:

```text
Model/AI output
vs
Human-reviewed expected output
```

This gives a more understandable semester evaluation.

Do not describe student-generated labels as clinical gold-standard labels.

---

# 44. MULTILINGUAL DATA

The application supports multilingual interaction.

However, do not immediately train a multilingual medical model.

Start with:

```text
Hindi
English
```

for the interface and conversational testing.

Use Gemini's multilingual capabilities for live interaction.

If a dedicated Indic medical dialogue dataset is used later, document its source, language coverage and license separately.

---

# 45. DATASET USAGE BY DEVELOPMENT PHASE

## Phase 1

```text
Synthetic data
```

For UI/API development.

## Phase 2

```text
MIMIC-IV-ED Demo
```

For data pipeline and triage experimentation.

## Phase 3

```text
Symptom2Disease
```

For symptom NLP baseline.

## Phase 4

```text
MIMIC-IV-ED
```

If credentialed access is obtained.

## Phase 5

```text
MedQuAD / MedDialog / ReMeDi
```

Only if needed for dialogue/QA evaluation.

---

# 46. WHAT WE ARE NOT DOING

Do NOT:

- Train a giant LLM from scratch.
- Claim the model diagnoses disease.
- Use Symptom2Disease as the triage ground truth.
- Put restricted MIMIC data on GitHub.
- Send real patient data to Gemini.
- Treat synthetic data as real clinical evidence.
- Automatically recommend treatment.
- Let AI bypass emergency safety rules.
- Report invented model metrics.
- Deploy an unvalidated model as an autonomous clinical decision-maker.

---

# 47. FINAL DATA PIPELINE

```text
                 PUBLIC DATASETS
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     MIMIC-IV-ED   Symptom2Disease  Dialogue
          │            │            │
          └────────────┼────────────┘
                       ▼
                PREPROCESSING
                       ↓
                FEATURE ENGINEERING
                       ↓
                 MODEL TRAINING
                       ↓
              VALIDATION / TESTING
                       ↓
             TRIAGE BASELINE MODEL
                       │
                       │
Patient ──→ Gemini conversational layer
                       │
                       ▼
               Structured symptoms
                       ↓
               Safety rule engine
                       ↓
               Triage model/AI
                       ↓
                 Confidence check
                       ↓
              Human staff escalation
                       ↓
                  OPD priority
```

---

# 48. FINAL DATASET STACK

## REQUIRED

### 1. MIMIC-IV-ED Demo

For:

- triage pipeline
- clinical feature experimentation
- evaluation workflow

### 2. Symptom2Disease

For:

- symptom NLP baseline
- symptom-language normalization

### 3. Synthetic Project Dataset

For:

- application testing
- API testing
- database seeding
- demo/evaluation

---

## OPTIONAL

### 4. Full MIMIC-IV-ED

For larger-scale triage research after credentialed access.

### 5. MedQuAD

For medical QA/retrieval evaluation.

### 6. MedDialog

For medical conversation research, subject to applicable use terms.

### 7. ReMeDi

For additional dialogue/medical-entity evaluation.

### 8. MIMIC-IV Demo

For broader clinical-data experiments.

---

# 49. DATASET CITATION REQUIREMENT

For every dataset used in the final report:

Include:

- Dataset name
- Authors/maintainers
- Version
- Source URL
- License/access terms
- Citation
- Exact purpose in our project

Example:

```text
MIMIC-IV-ED v2.2
PhysioNet
Purpose: Triage feature/model evaluation
Access: Credentialed
```

---

# 50. FINAL PRINCIPLE

The project should use datasets to **build and evaluate components**, not to create the illusion of a medically certified AI.

The final system is:

```text
Datasets
   ↓
Research + ML baseline
   +
Gemini
   ↓
Structured AI assistance
   +
Safety rules
   +
Human review
   ↓
OPD triage recommendation
```

The system should always communicate that the AI provides **preliminary triage assistance** and does not replace a qualified healthcare professional.
