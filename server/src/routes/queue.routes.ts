import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError } from "../utils/errors.js";
import { logAudit } from "../utils/audit.js";
import { emitQueueNewTicket, emitQueueStatusUpdated, emitQueuePatientCalled } from "../utils/socket.js";
import { z } from "zod";

const router = Router();

const createTicketSchema = z.object({
  visitId: z.string().uuid(),
  departmentId: z.string().uuid(),
  priority: z.enum(["RED", "YELLOW", "GREEN"]),
});

/**
 * POST /queue/tickets — Create a queue ticket
 */
router.post(
  "/tickets",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  validate({ body: createTicketSchema }),
  async (req, res, next) => {
    try {
      const { visitId, departmentId, priority } = req.body;

      // Prevent duplicate active tickets for same visit
      const { data: existing } = await supabaseAdmin
        .from("queue_tickets")
        .select("id")
        .eq("visit_id", visitId)
        .in("status", ["WAITING", "CALLED", "IN_PROGRESS"])
        .limit(1);

      if (existing && existing.length > 0) {
        sendSuccess(res, { error: "Active queue ticket already exists for this visit.", existingTicketId: existing[0].id }, 409);
        return;
      }

      // Generate token (e.g., A-101)
      const { count } = await supabaseAdmin
        .from("queue_tickets")
        .select("*", { count: "exact", head: true })
        .eq("department_id", departmentId);

      const token = `A-${String((count ?? 0) + 101)}`;

      const { data, error } = await supabaseAdmin
        .from("queue_tickets")
        .insert({
          visit_id: visitId,
          department_id: departmentId,
          token,
          priority,
          status: "WAITING",
        })
        .select("id, token, priority, status, arrival_time")
        .single();

      if (error) throw error;

      emitQueueNewTicket(req.app, data);
      await logAudit({ actorUserId: req.user!.id, action: "QUEUE_TICKET_CREATED", entityType: "queue_ticket", entityId: data.id });

      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /queue — Get queue entries (filterable)
 */
router.get("/", authenticate, authorize("STAFF", "DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from("queue_tickets")
      .select("*, visits(patients(full_name, patient_code, date_of_birth, gender)), departments(name)");

    if (req.query.departmentId) {
      query = query.eq("department_id", req.query.departmentId as string);
    }
    if (req.query.status) {
      query = query.eq("status", req.query.status as string);
    }

    // Priority ordering: RED first, then YELLOW, then GREEN. Within same priority, by arrival.
    const { data, error } = await query.order("arrival_time", { ascending: true });

    if (error) throw error;

    // Sort by priority weight
    const priorityWeight: Record<string, number> = { RED: 0, YELLOW: 1, GREEN: 2 };
    const sorted = (data ?? []).sort(
      (a, b) => (priorityWeight[a.priority] ?? 3) - (priorityWeight[b.priority] ?? 3)
    );

    sendSuccess(res, sorted);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /queue/my-status — Patient-facing: get my active queue tickets
 * Finds tickets associated with visits belonging to the authenticated user's patient record.
 * IMPORTANT: This must be defined BEFORE /:id to avoid Express matching 'my-status' as an :id.
 */
router.get("/my-status", authenticate, async (req, res, next) => {
  try {
    // Find visits linked to this user via patients table
    const { data: patientData } = await supabaseAdmin
      .from("patients")
      .select("id")
      .or(`id.eq.${req.user!.id},auth_user_id.eq.${req.user!.id}`)
      .maybeSingle();

    if (!patientData) {
      sendSuccess(res, []);
      return;
    }

    // Get active visits
    const { data: visits } = await supabaseAdmin
      .from("visits")
      .select("id")
      .eq("patient_id", patientData.id)
      .neq("status", "COMPLETED");

    if (!visits || visits.length === 0) {
      sendSuccess(res, []);
      return;
    }

    const visitIds = visits.map(v => v.id);
    
    const { data: tickets, error } = await supabaseAdmin
      .from("queue_tickets")
      .select("*, departments(name)")
      .in("visit_id", visitIds)
      .neq("status", "COMPLETED")
      .neq("status", "SKIPPED")
      .order("arrival_time", { ascending: false });

    if (error) throw error;

    sendSuccess(res, tickets ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /queue/:id — Get a single queue ticket
 */
router.get("/:id", authenticate, authorize("STAFF", "DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("queue_tickets")
      .select("*, visits(patients(full_name)), departments(name)")
      .eq("id", req.params.id)
      .single();

    if (error || !data) throw new NotFoundError("Queue ticket not found.");

    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /queue/:id/status — Update ticket status
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  validate({ body: z.object({ status: z.enum(["WAITING", "CALLED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]) }) }),
  async (req, res, next) => {
    try {
      const updates: Record<string, unknown> = {
        status: req.body.status,
        updated_at: new Date().toISOString(),
      };

      if (req.body.status === "CALLED") updates.called_at = new Date().toISOString();
      if (req.body.status === "COMPLETED") updates.completed_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from("queue_tickets")
        .update(updates)
        .eq("id", req.params.id)
        .select()
        .single();

      if (error || !data) throw new NotFoundError("Queue ticket not found.");

      emitQueueStatusUpdated(req.app, data);
      await logAudit({ actorUserId: req.user!.id, action: "QUEUE_STATUS_UPDATED", entityType: "queue_ticket", entityId: data.id, metadata: { status: req.body.status } });

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /queue/:id/call — Call a patient
 */
router.post(
  "/:id/call",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("queue_tickets")
        .update({
          status: "CALLED",
          called_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error || !data) throw new NotFoundError("Queue ticket not found.");

      emitQueuePatientCalled(req.app, data);
      await logAudit({ actorUserId: req.user!.id, action: "PATIENT_CALLED", entityType: "queue_ticket", entityId: data.id });

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
