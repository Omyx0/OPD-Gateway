import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

/**
 * GET /auth/me
 *
 * Returns the authenticated user's profile and role.
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, is_active")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new NotFoundError("User profile not found.");
    }

    // Get role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    sendSuccess(res, {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      role: roleData?.role ?? null,
      isActive: profile.is_active,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/logout
 *
 * Server-side logout acknowledgement.
 * The actual session invalidation happens on the frontend via Supabase Auth.
 */
router.post("/logout", authenticate, async (_req, res) => {
  sendSuccess(res, { message: "Logged out successfully." });
});

export default router;
