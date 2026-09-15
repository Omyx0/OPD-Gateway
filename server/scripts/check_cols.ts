import { supabaseAdmin } from "../src/config/supabase.js";

async function main() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, verification_status, verification_details, is_seed")
    .limit(1);

  if (error) {
    console.log("Columns not present yet:", error.message);
  } else {
    console.log("Columns verified successfully! Sample:", data);
  }
}

main().catch(console.error);
