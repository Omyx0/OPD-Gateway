import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Admin client — uses the service role key.
 * Bypasses Row Level Security. Use ONLY in the backend for
 * controlled operations (profile creation, role assignment, etc.).
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Standard client — uses the anon key.
 * Respects RLS policies. Use for operations that should
 * be scoped to the authenticated user's permissions.
 */
export const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
