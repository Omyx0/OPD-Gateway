/**
 * Notification routes.
 */
import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { emitNotification } from "../utils/socket.js";
import { z } from "zod";

const router = Router();

/**
 * GET /notifications — Get current user's notifications
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("recipient_user_id", req.user!.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    sendSuccess(res, data ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /notifications/unread-count — Get unread count
 */
router.get("/unread-count", authenticate, async (req, res, next) => {
  try {
    const { count, error } = await supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_user_id", req.user!.id)
      .eq("is_read", false);

    if (error) throw error;
    sendSuccess(res, { count: count ?? 0 });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /notifications/:id/read — Mark as read
 */
router.patch("/:id/read", authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("id", req.params.id)
      .eq("recipient_user_id", req.user!.id)
      .select()
      .single();

    if (error) throw error;
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /notifications/mark-all-read — Mark all as read
 */
router.post("/mark-all-read", authenticate, async (req, res, next) => {
  try {
    await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_user_id", req.user!.id)
      .eq("is_read", false);

    sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /notifications — Create notification (internal/staff use)
 */
router.post(
  "/",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { recipientUserId, type, title, message } = req.body;

      const { data, error } = await supabaseAdmin
        .from("notifications")
        .insert({
          recipient_user_id: recipientUserId,
          type,
          title,
          message,
        })
        .select()
        .single();

      if (error) throw error;

      // Emit real-time notification
      emitNotification(req.app, recipientUserId, data);

      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
