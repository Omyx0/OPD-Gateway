import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

const router = Router();

/**
 * POST /staff/provision
 * Ensures the authenticated user has a STAFF role and profile.
 * Called automatically when a staff member logs in on hospital-web.
 */
router.post("/provision", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const email = req.user!.email;
    const fullName = email ? email.split("@")[0] : "Staff";

    // 1. Ensure profile exists
    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName,
        email,
        is_active: true,
      },
      { onConflict: "id" }
    );

    // 2. Upsert STAFF role
    await supabaseAdmin.from("user_roles").upsert(
      {
        user_id: userId,
        role: "STAFF",
      },
      { onConflict: "user_id,role" }
    );

    logger.info(`Staff role provisioned for user ${userId} (${email})`);

    sendSuccess(res, { role: "STAFF", provisioned: true });
  } catch (err) {
    next(err);
  }
});

export default router;
