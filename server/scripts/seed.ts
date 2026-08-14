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
];

async function seed() {
  logger.info("Starting database seed...");

  for (const user of DEMO_USERS) {
    logger.info(`Processing user: ${user.email} (${user.role})`);

    // 1. Create or get user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    let userId: string;

    if (authError) {
      if (authError.message.includes("already registered")) {
        // User already exists, fetch their ID
        const { data: existingUser } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", user.email)
          .single();
        
        if (!existingUser) {
          logger.warn(`User ${user.email} exists in auth but not in profiles. Skipping.`);
          continue;
        }
        userId = existingUser.id;
        logger.info(`User already exists, updating profile...`);
      } else {
        logger.error(`Failed to create auth user ${user.email}: ${authError.message}`);
        continue;
      }
    } else {
      userId = authData.user.id;
      logger.info(`Created auth user.`);
    }

    // 2. Ensure profile exists (it might be auto-created by a trigger, but we'll upsert)
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: user.email,
      full_name: user.name,
      is_active: true,
    });

    if (profileError) {
      logger.error(`Failed to upsert profile for ${user.email}: ${profileError.message}`);
    }

    // 3. Assign role
    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
      {
        user_id: userId,
        role: user.role,
      },
      { onConflict: "user_id,role" }
    );

    if (roleError) {
      logger.error(`Failed to assign role ${user.role} to ${user.email}: ${roleError.message}`);
    } else {
      logger.info(`Successfully seeded ${user.role} account: ${user.email}`);
    }
  }

  logger.info("Seed completed.");
}

seed().catch((err) => {
  logger.error("Seed failed:", err);
  process.exit(1);
});
