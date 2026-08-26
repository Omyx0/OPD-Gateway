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

async function seed() {
  logger.info("Starting database seed...");

  // 1. Seed Hospital and Department
  let hospitalId: string;
  let deptId: string;

  const { data: hospital, error: hError } = await supabaseAdmin
    .from("hospitals")
    .upsert({ name: "General Hospital Demo" }, { onConflict: "id" })
    .select("id")
    .limit(1)
    .single();

  if (hError && hError.code !== 'PGRST116') {
    // If table has no unique constraint on name, upsert might be tricky, let's just insert if empty
    const { data: existingHospitals } = await supabaseAdmin.from("hospitals").select("id").limit(1);
    if (!existingHospitals || existingHospitals.length === 0) {
      const { data: newH } = await supabaseAdmin.from("hospitals").insert({ name: "General Hospital Demo" }).select("id").single();
      hospitalId = newH!.id;
    } else {
      hospitalId = existingHospitals[0].id;
    }
  } else {
    hospitalId = hospital?.id ?? (await supabaseAdmin.from("hospitals").select("id").limit(1).single()).data!.id;
  }

  const { data: existingDepts } = await supabaseAdmin.from("departments").select("id").eq("code", "CARDIO").limit(1);
  if (!existingDepts || existingDepts.length === 0) {
    const { data: newD } = await supabaseAdmin.from("departments").insert({
      hospital_id: hospitalId,
      name: "Cardiology",
      code: "CARDIO"
    }).select("id").single();
    deptId = newD!.id;
  } else {
    deptId = existingDepts[0].id;
  }

  logger.info(`Seeded Hospital (${hospitalId}) and Department (${deptId})`);


  // 2. Seed Users
  for (const user of DEMO_USERS) {
    logger.info(`Processing user: ${user.email} (${user.role})`);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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
        
        if (!existingUser) continue;
        userId = existingUser.id;
      } else {
        logger.error(`Failed to create auth user ${user.email}: ${authError.message}`);
        continue;
      }
    } else {
      userId = authData.user.id;
    }

    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: user.email,
      full_name: user.name,
      is_active: true,
    });

    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: user.role },
      { onConflict: "user_id,role" }
    );

    // If PATIENT, ensure they exist in patients table
    if (user.role === "PATIENT") {
      const { data: existingPatient } = await supabaseAdmin.from("patients").select("id").eq("id", userId).limit(1);
      if (!existingPatient || existingPatient.length === 0) {
        await supabaseAdmin.from("patients").insert({
          id: userId,
          patient_code: "PT-DEMO-001",
          full_name: user.name,
          mobile: "9999999999"
        });
      }
    }
  }

  logger.info("Seed completed.");
}

seed().catch((err) => {
  logger.error("Seed failed:", err);
  process.exit(1);
});
