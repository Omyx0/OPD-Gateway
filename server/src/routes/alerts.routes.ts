import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

/**
 * GET /alerts — List alerts
 */
router.get("/", authenticate, authorize("STAFF", "DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from("alerts")
      .select("*, queue_tickets(token), visits(patients(full_name))")
      .order("created_at", { ascending: false });

    if (req.query.status) {
      query = query.eq("status", req.query.status as string);
    }

    const { data, error } = await query;
    if (error) throw error;
    sendSuccess(res, data ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /alerts — Create an alert
 */
router.post(
  "/",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("alerts")
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;

      // TODO: Emit Socket.io event — alert:new

      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /alerts/:id/acknowledge — Acknowledge an alert
 */
router.post(
  "/:id/acknowledge",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("alerts")
        .update({
          status: "ACKNOWLEDGED",
          acknowledged_by: req.user!.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error || !data) throw new NotFoundError("Alert not found.");

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
