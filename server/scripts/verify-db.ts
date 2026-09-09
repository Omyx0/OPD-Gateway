import { supabaseAdmin } from "../src/config/supabase.js";

async function verify() {
  console.log("==================================================");
  console.log("🔍 SUPABASE COMPLETE DATABASE INTEGRITY VERIFICATION");
  console.log("==================================================\n");

  const coreTables = [
    { name: "profiles", desc: "User Accounts & Info" },
    { name: "user_roles", desc: "RBAC Roles (STAFF, DOCTOR, ADMIN, PATIENT)" },
    { name: "patients", desc: "Patient Directory (with auth_user_id link)" },
    { name: "doctors", desc: "Hospital Doctors Directory" },
    { name: "doctor_departments", desc: "Multi-Specialization Junction Table" },
    { name: "departments", desc: "OPD Departments & Units" },
    { name: "queue_tickets", desc: "Live Queue Tickets & Token Numbers" },
    { name: "triage_assessments", desc: "AI / Gemini Triage Logs & ESI Levels" },
    { name: "visits", desc: "OPD Patient Visits & Statuses" },
    { name: "clinical_records", desc: "Doctor Consultation SOAP Notes & Dispositions" },
    { name: "prescriptions", desc: "Medication & Prescription Records" },
    { name: "floors", desc: "Hospital Building Floors" },
    { name: "rooms", desc: "Indoor Vector Map Rooms & Cabins" },
    { name: "map_edges", desc: "Wayfinding & Navigation Graph Paths" },
    { name: "notifications", desc: "In-App Alerts & Push Notifications" },
    { name: "audit_logs", desc: "Security Audit Trails & Event History" },
    { name: "feedback", desc: "Patient Satisfaction & Feedback" }
  ];

  let passed = 0;

  for (const t of coreTables) {
    const { count, error } = await supabaseAdmin
      .from(t.name)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`❌ [${t.name}] FAILED: ${error.message}`);
    } else {
      console.log(`✅ [${t.name.padEnd(20)}] OK (${count ?? 0} rows) - ${t.desc}`);
      passed++;
    }
  }

  console.log("\n--------------------------------------------------");
  console.log("🔍 Specific Feature Verifications:");

  // 1. Patient auth_user_id column
  const { data: p, error: pErr } = await supabaseAdmin
    .from("patients")
    .select("id, auth_user_id")
    .limit(1);
  if (!pErr) {
    console.log("✅ Feature: Patient PWA Account Link (patients.auth_user_id) verified.");
  } else {
    console.log("❌ Feature: Patient auth_user_id: " + pErr.message);
  }

  // 2. Multi-specialization doctor_departments
  const { data: dd, error: ddErr } = await supabaseAdmin
    .from("doctor_departments")
    .select("doctor_id, department_id")
    .limit(1);
  if (!ddErr) {
    console.log("✅ Feature: Multi-Specialty Doctor Queues (doctor_departments) verified.");
  } else {
    console.log("❌ Feature: doctor_departments: " + ddErr.message);
  }

  // 3. Clinical records consultation columns
  const { data: cr, error: crErr } = await supabaseAdmin
    .from("clinical_records")
    .select("id, visit_id, doctor_id, subjective_notes, objective_notes, assessment, plan, diagnosis, disposition")
    .limit(1);
  if (!crErr) {
    console.log("✅ Feature: Doctor SOAP Consultations (clinical_records) verified.");
  } else {
    console.log("❌ Feature: clinical_records: " + crErr.message);
  }

  // 4. Map floor/room wayfinding
  const { data: rm, error: rmErr } = await supabaseAdmin
    .from("rooms")
    .select("id, floor_id, room_number, room_type, x_coord, y_coord")
    .limit(1);
  if (!rmErr) {
    console.log("✅ Feature: Indoor Vector Floor Map & Wayfinding (rooms) verified.");
  } else {
    console.log("❌ Feature: rooms: " + rmErr.message);
  }

  console.log("\n==================================================");
  console.log(`Audit Result: ${passed}/${coreTables.length} tables verified.`);
  if (passed === coreTables.length) {
    console.log("🎉 ALL MIGRATIONS HAVE COMPLETED SUCCESSFULLY WITH ZERO ERRORS!");
  }
  console.log("==================================================");
}

verify().catch(console.error);
