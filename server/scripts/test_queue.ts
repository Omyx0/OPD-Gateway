import { supabaseAdmin } from "../src/config/supabase.js";

async function checkQueue() {
  const { data, error } = await supabaseAdmin
    .from("queue_tickets")
    .select("token, priority, visits(patients(full_name))")
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Latest Queue Tickets:");
    console.log(JSON.stringify(data, null, 2));
  }
}

checkQueue();
