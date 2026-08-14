import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";

const router = Router();

/**
 * GET /analytics/overview — Dashboard statistics
 */
router.get("/overview", authenticate, authorize("STAFF", "DOCTOR", "ADMIN"), async (_req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [patientsResult, visitsResult, queueResult, alertsResult] = await Promise.all([
      supabaseAdmin.from("patients").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("visits").select("*", { count: "exact", head: true }).gte("created_at", today),
      supabaseAdmin.from("queue_tickets").select("*", { count: "exact", head: true }).eq("status", "WAITING"),
      supabaseAdmin.from("alerts").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
    ]);

    sendSuccess(res, {
      totalPatients: patientsResult.count ?? 0,
      todayVisits: visitsResult.count ?? 0,
      currentlyWaiting: queueResult.count ?? 0,
      activeAlerts: alertsResult.count ?? 0,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /analytics/queue — Queue metrics
 */
router.get("/queue", authenticate, authorize("STAFF", "DOCTOR", "ADMIN"), async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("queue_tickets")
      .select("priority, status, arrival_time, called_at, completed_at");

    if (error) throw error;

    const tickets = data ?? [];
    const byPriority = { RED: 0, YELLOW: 0, GREEN: 0 };
    const byStatus = { WAITING: 0, CALLED: 0, IN_PROGRESS: 0, COMPLETED: 0 };

    for (const t of tickets) {
      if (t.priority in byPriority) byPriority[t.priority as keyof typeof byPriority]++;
      if (t.status in byStatus) byStatus[t.status as keyof typeof byStatus]++;
    }

    sendSuccess(res, { byPriority, byStatus, total: tickets.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /analytics/triage — Triage distribution
 */
router.get("/triage", authenticate, authorize("STAFF", "DOCTOR", "ADMIN"), async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("triage_assessments")
      .select("urgency, confidence");

    if (error) throw error;

    const assessments = data ?? [];
    const distribution: Record<string, number> = {};

    for (const a of assessments) {
      distribution[a.urgency] = (distribution[a.urgency] ?? 0) + 1;
    }

    sendSuccess(res, { distribution, total: assessments.length });
  } catch (err) {
    next(err);
  }
});

export default router;
