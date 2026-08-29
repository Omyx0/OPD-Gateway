import { supabaseAdmin } from "../src/config/supabase.js";
import { logger } from "../src/utils/logger.js";

const DEMO_USERS = [
  {
    email: "admin@opd.com",
    password: "demo123",
    name: "System Admin",
    role: "ADMIN",
  },
  {
    email: "doctor@opd.com",
    password: "demo123",
    name: "Dr. Demo",
    role: "DOCTOR",
  },
  {
    email: "staff@opd.com",
    password: "demo123",
    name: "Reception Staff",
    role: "STAFF",
  },
  {
    email: "patient@opd.com",
    password: "demo123",
    name: "Demo Patient",
    role: "PATIENT",
  },
];

const DEPARTMENTS = [
  { name: "General Practice", code: "GP" },
  { name: "Cardiology", code: "CARDIO" },
  { name: "ENT", code: "ENT" },
  { name: "Orthopaedics", code: "ORTHO" },
  { name: "Ophthalmology", code: "OPHTHAL" },
  { name: "Dermatology", code: "DERM" },
  { name: "Paediatrics", code: "PAED" },
];

async function seed() {
  logger.info("Starting database seed...");

  // 1. Seed Hospital
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
    if (hErr) {
      logger.error("Failed to create hospital:", hErr.message);
      process.exit(1);
    }
    hospitalId = newH!.id;
    logger.info(`Created Hospital (${hospitalId})`);
  } else {
    hospitalId = existingHospitals[0].id;
    logger.info(`Using existing Hospital (${hospitalId})`);
  }

  // 2. Seed Departments
  for (const dept of DEPARTMENTS) {
    const { data: existing } = await supabaseAdmin
      .from("departments")
      .select("id")
      .eq("code", dept.code)
      .limit(1);

    if (!existing || existing.length === 0) {
      const { error: dErr } = await supabaseAdmin.from("departments").insert({
        hospital_id: hospitalId,
        name: dept.name,
        code: dept.code,
      });
      if (dErr) {
        logger.warn(`Failed to create department ${dept.code}: ${dErr.message}`);
      } else {
        logger.info(`Created department: ${dept.name} (${dept.code})`);
      }
    } else {
      logger.info(`Department ${dept.name} (${dept.code}) already exists`);
    }
  }

  // 3. Seed Users
  for (const user of DEMO_USERS) {
    logger.info(`Processing user: ${user.email} (${user.role})`);

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

    let userId: string;

    if (authError) {
      if (authError.message.includes("already registered")) {
        const { data: existingUser } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", user.email)
          .single();

        if (!existingUser) {
          logger.warn(`User ${user.email} registered but no profile found, skipping.`);
          continue;
        }
        userId = existingUser.id;
        logger.info(`User ${user.email} already exists (${userId})`);
      } else {
        logger.error(
          `Failed to create auth user ${user.email}: ${authError.message}`
        );
        continue;
      }
    } else {
      userId = authData.user.id;
      logger.info(`Created auth user ${user.email} (${userId})`);
    }

    // Upsert profile
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: user.email,
      full_name: user.name,
      is_active: true,
    });

    // Upsert role
    await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: userId, role: user.role },
        { onConflict: "user_id,role" }
      );

    // If PATIENT, ensure they exist in patients table with auth_user_id
    if (user.role === "PATIENT") {
      const { data: existingPatient } = await supabaseAdmin
        .from("patients")
        .select("id")
        .eq("auth_user_id", userId)
        .limit(1);

      if (!existingPatient || existingPatient.length === 0) {
        const { error: pErr } = await supabaseAdmin.from("patients").insert({
          auth_user_id: userId,
          patient_code: "P-10001",
          full_name: user.name,
          mobile: "9999999999",
        });
        if (pErr) {
          logger.warn(`Failed to create patient record: ${pErr.message}`);
        } else {
          logger.info(`Created patient record for ${user.email}`);
        }
      } else {
        logger.info(`Patient record for ${user.email} already exists`);
      }
    }
  }

  logger.info("Seed completed successfully!");
}

seed().catch((err) => {
  logger.error("Seed failed:", err);
  process.exit(1);
});
