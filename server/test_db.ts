import { supabaseAdmin } from "./src/config/supabase.js";
import { logger } from "./src/utils/logger.js";

async function checkDatabase() {
  try {
    logger.info("Attempting to connect to database...");
    const { data, error } = await supabaseAdmin.from("profiles").select("id").limit(1);
    
    if (error) {
      logger.error("Database connection failed", error);
      process.exit(1);
    }
    
    logger.info("Database connection successful!", { data });
    process.exit(0);
  } catch (err) {
    logger.error("Unexpected error during DB check", err);
    process.exit(1);
  }
}

checkDatabase();
