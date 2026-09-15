import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "./logger.js";

interface SeedDoctorCandidate {
  email: string;
  name: string;
  role: "DOCTOR";
  specialization: string;
  departmentCode: string;
  licenseNumber: string;
  qualification: string;
  experienceYears: number;
}

interface SeedStaffCandidate {
  email: string;
  name: string;
  role: "STAFF";
  employeeId: string;
  departmentName: string;
  designation: string;
}

export async function seedRealtimeQueue() {
  logger.info("==================================================");
  logger.info("🌱 SEEDING DYNAMIC REAL-TIME QUEUE & VERIFICATIONS");
  logger.info("==================================================");

  // 1. Ensure Hospital
  let hospitalId: string;
  const { data: existingHospitals } = await supabaseAdmin
    .from("hospitals")
    .select("id")
    .limit(1);

  if (!existingHospitals || existingHospitals.length === 0) {
    const { data: newH, error: hErr } = await supabaseAdmin
      .from("hospitals")
      .insert({ name: "General Hospital Demo" })
      .select("id")
      .single();
    if (hErr) throw hErr;
    hospitalId = newH.id;
  } else {
    hospitalId = existingHospitals[0].id;
  }

  // 2. Ensure standard departments exist
  const DEPARTMENTS = [
    { name: "General Practice", code: "GP" },
    { name: "Cardiology", code: "CARDIO" },
    { name: "ENT", code: "ENT" },
    { name: "Orthopaedics", code: "ORTHO" },
    { name: "Paediatrics", code: "PAED" },
    { name: "Dermatology", code: "DERM" },
  ];

  const deptMap = new Map<string, string>(); // code -> id

  for (const dept of DEPARTMENTS) {
    const { data: existing } = await supabaseAdmin
      .from("departments")
      .select("id, code")
      .eq("code", dept.code)
      .maybeSingle();

    if (existing) {
      deptMap.set(dept.code, existing.id);
    } else {
      const { data: inserted, error: dErr } = await supabaseAdmin
        .from("departments")
        .insert({
          hospital_id: hospitalId,
          name: dept.name,
          code: dept.code,
          is_active: true,
        })
        .select("id, code")
        .single();
      if (!dErr && inserted) {
        deptMap.set(dept.code, inserted.id);
      }
    }
  }

  // 3. Seed Pending Verification Doctor Candidates
  const pendingDoctors: SeedDoctorCandidate[] = [
    {
      email: "dr.ananya@opd.com",
      name: "Dr. Ananya Sharma",
      role: "DOCTOR",
      specialization: "Cardiology & Interventional Care",
      departmentCode: "CARDIO",
      licenseNumber: "MCI-2024-8849",
      qualification: "MBBS, MD (AIIMS New Delhi), DM Cardiology",
      experienceYears: 7,
    },
    {
      email: "dr.rajesh@opd.com",
      name: "Dr. Rajesh Kulkarni",
      role: "DOCTOR",
      specialization: "Orthopaedic Trauma & Joint Replacement",
      departmentCode: "ORTHO",
      licenseNumber: "DMC-2023-1102",
      qualification: "MBBS, MS Orthopaedics (KEM Mumbai)",
      experienceYears: 10,
    },
  ];

  for (const doc of pendingDoctors) {
    let userId: string;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: doc.email,
      password: "demo123",
      email_confirm: true,
      user_metadata: { full_name: doc.name, role: "DOCTOR" },
    });

    if (authError) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === doc.email);
      if (existing) {
        userId = existing.id;
      } else {
        logger.warn(`Could not create/find auth user for ${doc.email}`);
        continue;
      }
    } else {
      userId = authData.user.id;
    }

    const verificationDetails = {
      licenseNumber: doc.licenseNumber,
      qualification: doc.qualification,
      experienceYears: doc.experienceYears,
      specialization: doc.specialization,
      departmentCode: doc.departmentCode,
      requestedRole: "DOCTOR",
      submittedAt: new Date().toISOString(),
    };

    try {
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email: doc.email,
        full_name: doc.name,
        is_active: false,
        verification_status: "PENDING",
        verification_details: verificationDetails,
      });
    } catch {
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email: doc.email,
        full_name: doc.name,
        is_active: false,
      });
    }

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "DOCTOR" }, { onConflict: "user_id,role" });

    const deptId = deptMap.get(doc.departmentCode);
    const { data: docRecord } = await supabaseAdmin
      .from("doctors")
      .upsert(
        {
          profile_id: userId,
          specialization: doc.specialization,
          department_id: deptId,
          is_active: false,
        },
        { onConflict: "profile_id" }
      )
      .select("id")
      .maybeSingle();

    if (docRecord && deptId) {
      await supabaseAdmin
        .from("doctor_departments")
        .upsert(
          { doctor_id: docRecord.id, department_id: deptId, is_primary: true },
          { onConflict: "doctor_id,department_id" }
        );
    }
  }

  // 4. Seed Pending Verification Staff Candidates
  const pendingStaff: SeedStaffCandidate[] = [
    {
      email: "nurse.priya@opd.com",
      name: "Priya Nair, RN",
      role: "STAFF",
      employeeId: "STF-2024-902",
      departmentName: "Emergency & Triage Unit",
      designation: "Senior Triage Nurse",
    },
    {
      email: "reception.amit@opd.com",
      name: "Amit Verma",
      role: "STAFF",
      employeeId: "STF-2024-331",
      departmentName: "Central OPD Registration Desk",
      designation: "OPD Desk Receptionist",
    },
  ];

  for (const stf of pendingStaff) {
    let userId: string;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: stf.email,
      password: "demo123",
      email_confirm: true,
      user_metadata: { full_name: stf.name, role: "STAFF" },
    });

    if (authError) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === stf.email);
      if (existing) {
        userId = existing.id;
      } else {
        logger.warn(`Could not create/find auth user for ${stf.email}`);
        continue;
      }
    } else {
      userId = authData.user.id;
    }

    const verificationDetails = {
      employeeId: stf.employeeId,
      departmentName: stf.departmentName,
      designation: stf.designation,
      requestedRole: "STAFF",
      submittedAt: new Date().toISOString(),
    };

    try {
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email: stf.email,
        full_name: stf.name,
        is_active: false,
        verification_status: "PENDING",
        verification_details: verificationDetails,
      });
    } catch {
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email: stf.email,
        full_name: stf.name,
        is_active: false,
      });
    }

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "STAFF" }, { onConflict: "user_id,role" });
  }

  // 5. Clean up old seeded queue tickets
  const { data: oldTickets } = await supabaseAdmin
    .from("queue_tickets")
    .select("id, visit_id")
    .like("token", "S-%");

  if (oldTickets && oldTickets.length > 0) {
    const ticketIds = oldTickets.map((t) => t.id);
    const visitIds = oldTickets.map((t) => t.visit_id).filter(Boolean);

    await supabaseAdmin.from("alerts").delete().in("queue_ticket_id", ticketIds);
    await supabaseAdmin.from("queue_tickets").delete().in("id", ticketIds);
    if (visitIds.length > 0) {
      await supabaseAdmin.from("triage_assessments").delete().in("visit_id", visitIds);
      await supabaseAdmin.from("symptoms").delete().in("visit_id", visitIds);
      await supabaseAdmin.from("clinical_records").delete().in("visit_id", visitIds);
      await supabaseAdmin.from("visits").delete().in("id", visitIds);
    }
  }

  // 6. Dynamic Real-time Patients & Queue Tickets
  const patientScenarios = [
    {
      token: "S-101",
      name: "Rohan Kapoor",
      code: "SEED-P101",
      gender: "MALE",
      dob: "1968-05-14",
      mobile: "+91 98201 12345",
      deptCode: "CARDIO",
      priority: "RED",
      status: "WAITING",
      minutesAgo: 12,
      symptoms: "Crushing retrosternal chest pain radiating to left jaw, profuse diaphoresis, dyspnea at rest",
      vitals: { hr: 118, bp_systolic: 172, bp_diastolic: 104, spo2: 92, temp_f: 98.6 },
      esiLevel: "ESI-2",
      alertMessage: "CRITICAL: Patient S-101 presents with acute coronary syndrome symptoms & SpO2 92%",
    },
    {
      token: "S-102",
      name: "Sunita Deshmukh",
      code: "SEED-P102",
      gender: "FEMALE",
      dob: "1960-11-22",
      mobile: "+91 98192 88231",
      deptCode: "GP",
      priority: "RED",
      status: "CALLED",
      minutesAgo: 24,
      symptoms: "Severe acute asthma exacerbation, audible expiratory wheeze, unable to complete full sentences",
      vitals: { hr: 124, bp_systolic: 138, bp_diastolic: 88, spo2: 89, temp_f: 99.1 },
      esiLevel: "ESI-2",
      alertMessage: "EMERGENCY: Patient S-102 respiratory distress with SpO2 89%",
    },
    {
      token: "S-103",
      name: "Arjun Verma",
      code: "SEED-P103",
      gender: "MALE",
      dob: "1994-03-08",
      mobile: "+91 97654 33210",
      deptCode: "GP",
      priority: "YELLOW",
      status: "IN_PROGRESS",
      minutesAgo: 38,
      symptoms: "Right lower quadrant abdominal pain for 14 hours, focal McBurney tenderness, vomiting, fever",
      vitals: { hr: 96, bp_systolic: 122, bp_diastolic: 78, spo2: 98, temp_f: 102.3 },
      esiLevel: "ESI-3",
    },
    {
      token: "S-104",
      name: "Meera Sen",
      code: "SEED-P104",
      gender: "FEMALE",
      dob: "1981-08-19",
      mobile: "+91 99304 55123",
      deptCode: "ORTHO",
      priority: "YELLOW",
      status: "WAITING",
      minutesAgo: 31,
      symptoms: "Suspected closed fracture of distal right radius following fall on outstretched hand, intense pain & edema",
      vitals: { hr: 88, bp_systolic: 130, bp_diastolic: 84, spo2: 99, temp_f: 98.4 },
      esiLevel: "ESI-3",
    },
    {
      token: "S-105",
      name: "Vikram Joshi",
      code: "SEED-P105",
      gender: "MALE",
      dob: "1973-12-04",
      mobile: "+91 98450 77192",
      deptCode: "ENT",
      priority: "YELLOW",
      status: "WAITING",
      minutesAgo: 28,
      symptoms: "Severe rotational vertigo with nausea, acute unilateral left ear discharge and hearing dullness",
      vitals: { hr: 82, bp_systolic: 126, bp_diastolic: 80, spo2: 98, temp_f: 99.8 },
      esiLevel: "ESI-3",
    },
    {
      token: "S-106",
      name: "Kavita Reddy",
      code: "SEED-P106",
      gender: "FEMALE",
      dob: "1996-07-30",
      mobile: "+91 98902 44331",
      deptCode: "GP",
      priority: "GREEN",
      status: "WAITING",
      minutesAgo: 45,
      symptoms: "Persistent dry irritating cough and mild pharyngitis for 4 days, afebrile, normal appetite",
      vitals: { hr: 74, bp_systolic: 116, bp_diastolic: 74, spo2: 99, temp_f: 98.2 },
      esiLevel: "ESI-4",
    },
    {
      token: "S-107",
      name: "Master Aarav Mehta",
      code: "SEED-P107",
      gender: "MALE",
      dob: "2018-09-12",
      mobile: "+91 98200 99441",
      deptCode: "PAED",
      priority: "GREEN",
      status: "WAITING",
      minutesAgo: 40,
      symptoms: "Maculopapular viral rash across trunk, active and playful, feeding normally",
      vitals: { hr: 95, bp_systolic: 102, bp_diastolic: 66, spo2: 99, temp_f: 99.0 },
      esiLevel: "ESI-4",
    },
    {
      token: "S-108",
      name: "Suresh Gupta",
      code: "SEED-P108",
      gender: "MALE",
      dob: "1963-04-18",
      mobile: "+91 98110 33221",
      deptCode: "CARDIO",
      priority: "GREEN",
      status: "WAITING",
      minutesAgo: 58,
      symptoms: "Routine quarterly essential hypertension checkup and prescription renewal (Telmisartan 40mg)",
      vitals: { hr: 72, bp_systolic: 134, bp_diastolic: 86, spo2: 98, temp_f: 98.4 },
      esiLevel: "ESI-5",
    },
    {
      token: "S-109",
      name: "Deepika Shah",
      code: "SEED-P109",
      gender: "FEMALE",
      dob: "1985-02-14",
      mobile: "+91 98331 66554",
      deptCode: "ENT",
      priority: "GREEN",
      status: "COMPLETED",
      minutesAgo: 85,
      symptoms: "Seasonal allergic rhinitis, intermittent bouts of sneezing and clear watery nasal discharge",
      vitals: { hr: 70, bp_systolic: 118, bp_diastolic: 76, spo2: 99, temp_f: 98.6 },
      esiLevel: "ESI-5",
    },
    {
      token: "S-110",
      name: "Harish Patel",
      code: "SEED-P110",
      gender: "MALE",
      dob: "1976-10-09",
      mobile: "+91 98212 99887",
      deptCode: "ORTHO",
      priority: "GREEN",
      status: "COMPLETED",
      minutesAgo: 105,
      symptoms: "Mild mechanical lower back muscular strain after lifting heavy luggage, no neurological deficit",
      vitals: { hr: 76, bp_systolic: 124, bp_diastolic: 80, spo2: 98, temp_f: 98.4 },
      esiLevel: "ESI-5",
    },
  ];

  let insertedCount = 0;

  for (const s of patientScenarios) {
    const { data: patient, error: patErr } = await supabaseAdmin
      .from("patients")
      .upsert(
        {
          patient_code: s.code,
          full_name: s.name,
          gender: s.gender,
          date_of_birth: s.dob,
          mobile: s.mobile,
          preferred_language: "Hindi / English",
        },
        { onConflict: "patient_code" }
      )
      .select("id")
      .single();

    if (patErr || !patient) {
      logger.warn(`Failed to upsert patient ${s.name}: ${patErr?.message}`);
      continue;
    }

    const deptId = deptMap.get(s.deptCode) || Array.from(deptMap.values())[0];
    const arrivalTime = new Date(Date.now() - s.minutesAgo * 60 * 1000).toISOString();

    const { data: visit, error: visErr } = await supabaseAdmin
      .from("visits")
      .insert({
        patient_id: patient.id,
        department_id: deptId,
        visit_type: "OPD",
        status: s.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
        registered_at: arrivalTime,
      })
      .select("id")
      .single();

    if (visErr || !visit) {
      logger.warn(`Failed to create visit for ${s.name}: ${visErr?.message}`);
      continue;
    }

    await supabaseAdmin.from("symptoms").insert({
      visit_id: visit.id,
      symptom_name: s.symptoms,
      patient_description: s.symptoms,
      severity: s.priority,
    });

    await supabaseAdmin.from("triage_assessments").insert({
      visit_id: visit.id,
      urgency: s.priority,
      confidence: 0.94,
      recommended_action: `Direct to ${s.deptCode} OPD — ESI level ${s.esiLevel}`,
      structured_result: {
        esi_score: s.esiLevel,
        vitals: s.vitals,
        primary_complaint: s.symptoms,
      },
      model_name: "Gemini 3.5 Flash + PhysioNet ML",
    });

    const { data: ticket, error: tErr } = await supabaseAdmin
      .from("queue_tickets")
      .insert({
        visit_id: visit.id,
        department_id: deptId,
        token: s.token,
        priority: s.priority,
        status: s.status,
        arrival_time: arrivalTime,
        called_at: s.status === "CALLED" || s.status === "IN_PROGRESS" || s.status === "COMPLETED" ? arrivalTime : null,
        completed_at: s.status === "COMPLETED" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (!tErr && ticket) {
      insertedCount++;

      if (s.priority === "RED" && s.alertMessage) {
        await supabaseAdmin.from("alerts").insert({
          visit_id: visit.id,
          queue_ticket_id: ticket.id,
          type: "CLINICAL_DETERIORATION",
          severity: "HIGH",
          message: s.alertMessage,
          status: "ACTIVE",
        });
      }
    }
  }

  logger.info(`✅ Successfully seeded ${insertedCount} live queue tickets with [S] seed tags across 5 departments!`);
  logger.info(`✅ Successfully registered 2 Pending Doctors & 2 Pending Staff for Admin Verification!`);
  return { success: true, count: insertedCount };
}
