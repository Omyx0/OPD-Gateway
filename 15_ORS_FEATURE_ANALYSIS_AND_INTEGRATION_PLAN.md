# ORS (ors.gov.in) FEATURE ANALYSIS & INTEGRATION PLAN
## Deep-dive into India's Online Registration System + eHospital, mapped onto our Smart Digital OPD System

**Document:** 15 / 14 (companion to MASTER_BUILD_PLAN.md)
**Status:** Research + recommendation draft — not yet locked
**Note on method:** `ors.gov.in` blocks automated crawling (robots.txt), so this was compiled from NIC's own documentation (nic.gov.in, ehospital.gov.in, nextgen.ehospital.nic.in), state eHospital deployments (Tripura, Kerala ISM), hospital-side pages (VMMC Safdarjung), the India.gov.in service listing, and independent write-ups on the platform. Where a claim is government-sourced it's marked **[Official]**; where it's third-party reporting it's marked **[Secondary]**.

---

## 1. What ORS Actually Is

ORS is **not** a hospital system in itself — it's the **public-facing patient portal** sitting in front of a much bigger backend called **eHospital**, both built by India's National Informatics Centre (NIC) as part of Digital India. **[Official]** The eHospital is a web-based, workflow-driven Health Management Information System (HMIS) with multi-tenancy support, hosted on NIC's own cloud (MeghRaj), currently used by 1000+ facilities and ABDM (Ayushman Bharat Digital Mission) compliant.

The important structural insight for you: **ORS = patient app**, **eHospital = hospital/staff backend**, and they talk to each other. This is almost exactly your Lovable-frontend / Antigravity-backend split, except at national scale with two separate frontends (public + staff) instead of one. That's a useful pattern to borrow.

```text
                 ┌─────────────────────┐
   Citizens  →   │   ORS (patient app)  │   Book / view / cancel appt,
                 │   ors.gov.in         │   lab reports, blood bank
                 └──────────┬───────────┘
                            │  ABHA / Aadhaar eKYC + OTP
                            ▼
                 ┌─────────────────────┐
                 │   eHospital (HMIS)   │   Registration, OPD Clinic, IPD,
   Staff     →   │   hospital backend   │   Billing, Lab, Radiology, Pharmacy,
                 │                      │   Store, Dietary, OT, Laundry
                 └──────────┬───────────┘
                            │
                 ┌─────────────────────┐
                 │   e-BloodBank        │   Blood inventory across hospitals
                 └─────────────────────┘
```

---

## 2. Full Feature Inventory

### 2.1 Patient-facing (ORS portal + "eHospital"/state apps on Play Store)

| # | Feature | Detail |
|---|---|---|
| 1 | **Identity verification / registration** | Aadhaar-based eKYC (mobile linked to UIDAI) **or** plain mobile-number registration (no Aadhaar required — added later for accessibility) **[Official]**. OTP verification on the linked mobile number. |
| 2 | **ABHA integration** | Login/registration via ABHA (Ayushman Bharat Health Account) number, in addition to Aadhaar or mobile. ABHA is described as making patient identification accurate and preventing duplicate records across hospitals **[Secondary]**. |
| 3 | **Hospital + department discovery** | Browse participating hospitals (2,400+ empanelled, incl. AIIMS Delhi, Safdarjung, PGIMER) **[Secondary]**, filter by state → hospital → department. |
| 4 | **Slot-based appointment booking** | Select date, see available departments/doctors, book a slot — not just a queue ticket, an actual date+dept reservation. |
| 5 | **Appointment confirmation via SMS** | SMS receipt of appointment id/slip after booking. |
| 6 | **View / print / cancel appointment** | Retrieve booking by Appointment ID + OTP, print OPD card/slip, or cancel. |
| 7 | **Digital OPD slip / registration card** | Printable card used at the hospital counter — replaces physical token queue. |
| 8 | **Lab reports (Pathology + Radiology)** | Patients can view/download their own diagnostic reports online, 24/7, tied to their ABHA/mobile identity. |
| 9 | **Doctor prescriptions (digital)** | View/download past prescriptions from OPD visits. |
| 10 | **Blood bank availability check** | Real-time blood-group-wise stock across connected e-BloodBank-linked hospitals; separate "Blood Availability / Donation" section. |
| 11 | **Teleconsultation request** | Some deployments (e.g., Railways HMIS, Defence's SeHAT) let a patient raise a remote doctor consultation from the same identity/app. |
| 12 | **New vs returning patient handling** | System recognizes repeat patients via Aadhaar/ABHA/mobile so they don't re-register every visit. |
| 13 | **Multi-language support** | State-level deployments provide Hindi + regional language + English. |
| 14 | **Analytics/reports (public)** | Portal publishes hospital-wise / department-wise counts of new vs old patients using the system (transparency reporting). |

### 2.2 Hospital/staff-facing (eHospital HMIS backend)

| # | Module | What it does |
|---|---|---|
| 1 | **Patient Registration** (OPD + Casualty/Emergency) | Front-desk registration, including walk-ins alongside online-booked patients. |
| 2 | **OPD Clinic module** | Doctor's consultation workflow — call patient, record visit, diagnosis, prescription. |
| 3 | **IPD (Admission/Discharge/Transfer)** | Ward/bed allocation once a patient is admitted — begins right after OPD registration if needed. |
| 4 | **Billing** | Charges for consultation, procedures, admission. |
| 5 | **Lab Information System (LIS)** | Order tests, record + publish pathology results (feeds ORS "lab reports" for patients). |
| 6 | **Radiology Information System (RIS)** | Order imaging, publish reports (feeds ORS as well). |
| 7 | **Pharmacy / Store & Inventory** | Drug stock, dispensing against prescriptions. |
| 8 | **e-BloodBank** | Full blood bank management — donor records, stock by group, cross-hospital visibility (feeds the patient-facing "blood availability" screen). |
| 9 | **Dietary, Laundry, Ambulance, Mortuary, OT (Operation Theatre)** | Ancillary hospital-ops modules — mostly IPD-adjacent, low priority for an OPD-only MVP. |
| 10 | **Hospital Admin console** | Configure departments, doctors, appointment slot capacity per doctor/department/day. |
| 11 | **MRD (Medical Records Dept.)** | Central record-keeping/archival across all modules. |
| 12 | **Centralized Order Entry** | One workflow for a doctor to order labs/radiology/pharmacy together instead of separate systems. |
| 13 | **Feedback module** | Patient satisfaction capture. |
| 14 | **Reports & Dashboard** | Operational reporting for hospital administration (footfall, department load, no-show rate, etc.). |
| 15 | **Multi-tenancy** | One codebase, many hospitals, each with isolated configuration/data — relevant if you ever go multi-hospital. |

---

## 3. Feature-by-Feature Comparison: ORS/eHospital vs. Your Master Build Plan

Legend: ✅ already planned · 🟡 partially covered / needs extension · ❌ not currently in plan

| ORS/eHospital capability | Your plan today | Verdict |
|---|---|---|
| Patient registration (manual) | Patient Flow → Registration step | ✅ |
| ID scan / eKYC-style identity | "ID Scan or Manual Entry" step exists | 🟡 — you have the *step*, but no defined identity provider (see §5.1) |
| OTP-based mobile verification | Not explicit yet | 🟡 — natural fit for Supabase Auth (phone OTP is a built-in Supabase Auth strategy) |
| Slot-based appointment booking | Your system is queue/token-based (AI triage → priority → queue ticket), not date-slot booking | ❌ — different paradigm, see §5.2 |
| Digital queue ticket + live queue | Queue Ticket → Live Queue → Called | ✅ — and yours is *better* than ORS here (ORS gives a static appointment; you give a live, AI-prioritized queue) |
| AI-assisted triage / symptom collection | Core differentiator of your system | ✅ (ORS/eHospital has **no** AI triage at all — this is your strongest advantage, keep it central) |
| View/print/cancel appointment | Not yet modeled (you don't have "appointments" as a concept, only walk-in + queue) | ❌ — only needed if you add slot booking |
| Digital OPD slip/ticket | Queue Ticket concept covers this | ✅ |
| Lab reports (view/download) | Not in current schema | ❌ — real gap, valuable |
| Digital prescriptions (view/download) | Not in current schema | ❌ — real gap, valuable |
| Blood bank availability | Not in scope | ❌ — optional, low priority for OPD-only MVP |
| Teleconsultation | Not in scope | ❌ — optional, phase 2+ |
| RBAC: Staff/Doctor/Admin | Section 6 of your plan | ✅ — but ORS model implies you also need a **PATIENT** role if patients get to log in and see their own history (see §5.3) |
| Emergency/casualty bypass | "Emergency/help flow must bypass normal AI waiting behavior" | ✅ |
| Multi-language | Not yet specified, but Gemini + Web Speech API make this easy | 🟡 |
| Hospital admin configuring departments/doctors/capacity | ADMIN role: "Manage departments" | ✅ |
| Analytics/reports | ADMIN role: "View analytics" | ✅ |
| Audit logging | Security Layer #10 | ✅ |
| Realtime queue/staff updates | Socket.io section | ✅ — ORS has nothing like this; another advantage you already have |
| Feedback capture | Not in scope | ❌ — small, cheap to add |
| Multi-hospital / multi-tenancy | Not in scope (single hospital, per your ask) | N/A — intentionally out of scope |
| Billing/IPD/Pharmacy/Radiology/OT/Dietary/Laundry/Mortuary | Not in scope | ❌ — intentionally out of scope; these are full-hospital-ops modules, not OPD triage. Only pull in if you decide to grow beyond "OPD management" into a full HMIS. |

**Bottom line:** your AI-triage + live-queue engine is something ORS/eHospital simply doesn't have — that's your product's edge. The gaps worth closing are the **patient-history features** (lab reports, prescriptions) and **identity/OTP verification**, because those are what make a system feel trustworthy and "sticky" to a returning patient. Slot-based date booking is a *different* interaction model from your queue-based one — don't blindly copy it; see §5.2 for a hybrid recommendation.

---

## 4. Important Constraint You Should Know Before Copying ORS 1:1

ORS's identity layer (Aadhaar eKYC + ABHA/ABDM) is **government infrastructure** — UIDAI's Aadhaar authentication APIs and the ABDM sandbox/production APIs are only issued to authorized entities (government bodies, empanelled hospitals, licensed Health Information Providers) after a formal onboarding and compliance process. A private/independent hospital app **cannot simply call Aadhaar eKYC or mint ABHA IDs** the way ors.gov.in does, without going through NHA's (National Health Authority) ABDM Milestone integration program and legal agreements.

This isn't a reason to avoid the *idea* — it's a reason to build your own equivalent now and treat ABDM/ABHA as an optional future integration:

- **Now:** Use Supabase Auth's phone OTP (or email) as your identity/OTP layer — functionally the same UX as ORS's mobile-OTP path (which ORS itself offers as the non-Aadhaar alternative), with zero external compliance burden.
- **Later (optional):** If the hospital wants national interoperability, integrate the real ABDM "Health ID/ABHA" APIs as a genuinely separate, opt-in module — not a dependency for MVP launch.

---

## 5. Concrete Integration Recommendations

### 5.1 Identity & OTP (replaces "Aadhaar eKYC")
- Use **Supabase Auth phone/OTP** for patients (no password) and **Supabase Auth email/password** for staff/doctor/admin (as already planned).
- Add a `patients` table keyed by a verified phone number, so a returning patient is recognized automatically — mirrors ORS's "new vs returning patient" behavior without needing Aadhaar.

### 5.2 Appointments vs. Queue — a hybrid, not a replacement
Don't replace your live AI-prioritized queue with ORS's static date-slot booking — that would remove your biggest advantage. Instead, add an **optional "pre-registration" layer** on top of the queue:
- Patient can register *before arriving* (fill symptoms, do AI triage remotely) and get a **provisional queue position for a chosen day**, similar in spirit to ORS's slot booking, but resolved into your real-time priority queue on the day itself once they check in.
- This gets you ORS's "book ahead, skip some of the wait" convenience while keeping your dynamic triage-based ordering as the thing that actually decides who's seen next.

### 5.3 New RBAC role: `PATIENT`
Your current roles are STAFF / DOCTOR / ADMIN — all hospital-side. If patients are to log in (view their own queue ticket, history, lab reports, prescriptions) they need their own authenticated role with tightly scoped RLS (a patient can only ever see **their own** rows):

```text
PATIENT
 ├── View own profile
 ├── Start/continue symptom collection & AI triage
 ├── View own live queue position
 ├── View own visit history
 ├── View own prescriptions (once staff/doctor publish them)
 └── View own lab/diagnostic results (once published)
```

This directly answers your "hospital only, but usable by hospital **and** public/patients" requirement — it's the same backend and database, just a second, heavily-restricted role and a separate (or role-aware) frontend surface.

### 5.4 New data entities to add to Section 7 (Database) of the Master Plan
| Table | Purpose | Maps to ORS feature |
|---|---|---|
| `prescriptions` | Doctor's structured prescription per visit, linked to `visits` | Digital prescriptions |
| `lab_orders` / `lab_results` | Test ordered by doctor, result published by staff/lab role | Lab reports (Pathology/Radiology) |
| `patient_documents` | Uploaded/scanned reports, ID proofs (Gemini OCR already in your stack can parse these) | ID scan, uploaded reports |
| `feedback` | Post-visit rating/comment | Feedback module |
| `pre_registrations` (optional, §5.2) | Day-ahead registration before physical check-in | Slot booking equivalent |

All of these slot cleanly into your existing PostgreSQL + RLS + RBAC + audit-log architecture — no new architectural layer required, just new tables and two new RBAC branches (`PATIENT`, and optionally a `LAB`/`PHARMACY` staff sub-role later).

### 5.5 Explicitly keep out of scope (for now)
Billing, IPD bed management, Pharmacy inventory, Radiology/Lab *machine* integration, Dietary, Laundry, OT, Mortuary, Ambulance, multi-hospital tenancy, real Aadhaar/ABDM integration, e-BloodBank. These are legitimate parts of the full eHospital suite, but they turn your focused "OPD + AI triage" product into a full HMIS re-implementation. Note them as a clearly labeled **Phase 3 backlog** rather than building them now.

---

## 6. Suggested Phasing

```text
Phase 1 (MVP, matches current Master Plan)
 └── Registration, AI triage, live queue, staff/doctor/admin dashboards

Phase 2 (this document's core recommendation)
 ├── PATIENT role + patient login (phone OTP)
 ├── Prescriptions (doctor writes → patient views)
 ├── Lab orders/results (basic — staff enters, patient views)
 ├── Feedback capture
 └── Pre-registration / "book ahead" layer on top of the queue

Phase 3 (optional, only if hospital wants national interoperability / full HMIS)
 ├── Real ABDM/ABHA integration
 ├── Blood bank module
 ├── Teleconsultation
 ├── Billing / Pharmacy / IPD
 └── Multi-hospital tenancy
```

---

## 7. One-line Summary for a Viva-style Explanation

> ORS is the citizen-facing appointment/records portal in front of NIC's eHospital HMIS; it proves the value of letting patients see their own appointments, prescriptions and lab results online. Our system adopts that same "patient can log in and see their own data" principle via a new PATIENT role and a few new tables (prescriptions, lab results, documents, feedback), but keeps our AI-driven live triage queue — which ORS does not have — as the core differentiator, and deliberately defers government-only integrations (Aadhaar eKYC, ABDM/ABHA, e-BloodBank) to an optional future phase rather than blocking the MVP on them.
