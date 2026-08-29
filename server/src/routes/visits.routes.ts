import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError } from "../utils/errors.js";
import { z } from "zod";

const router = Router();

const createVisitSchema = z.object({
  patientId: z.string().uuid(),
  departmentId: z.string().uuid(),
  visitType: z.string().default("OPD"),
  source: z.enum(["KIOSK", "RECEPTION", "WALKIN"]).default("KIOSK"),
});

/**
 * POST /visits — Create a new visit
 */
router.post(
  "/",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN", "PATIENT"),
  validate({ body: createVisitSchema }),
  async (req, res, next) => {
    try {
      const { patientId, departmentId, visitType, source } = req.body;

      const { data, error } = await supabaseAdmin
        .from("visits")
        .insert({
          patient_id: patientId,
          department_id: departmentId,
          visit_type: visitType,
          source,
          status: "WAITING",
        })
        .select("id, patient_id, department_id, status, registered_at")
        .single();

      if (error) throw error;

      // DEMO: Automatically create a Queue Ticket
      const { count } = await supabaseAdmin
        .from("queue_tickets")
        .select("*", { count: "exact", head: true })
        .eq("department_id", departmentId);

      const token = `A-${String((count ?? 0) + 101)}`;

      await supabaseAdmin.from("queue_tickets").insert({
        visit_id: data.id,
        department_id: departmentId,
        token,
        priority: "GREEN",
        status: "WAITING",
      });

      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /visits/:id/symptoms — Submit symptoms for a visit
 */
router.post(
  "/:id/symptoms",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN", "PATIENT"),
  validate({
    body: z.object({
      symptomName: z.string().min(1, "Symptom name is required."),
      patientDescription: z.string().optional(),
      duration: z.string().optional(),
      severity: z.string().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      // Verify the visit exists
      const { data: visit, error: visitError } = await supabaseAdmin
        .from("visits")
        .select("id")
        .eq("id", req.params.id)
        .single();

      if (visitError || !visit) throw new NotFoundError("Visit not found.");

      const { symptomName, patientDescription, duration, severity } = req.body;

      const { data, error } = await supabaseAdmin
        .from("symptoms")
        .insert({
          visit_id: req.params.id,
          symptom_name: symptomName,
          patient_description: patientDescription,
          duration,
          severity,
        })
        .select("id, symptom_name, patient_description, duration, severity, created_at")
        .single();

      if (error) throw error;

      // Transform snake_case → camelCase for frontend
      sendSuccess(res, {
        id: data.id,
        symptomName: data.symptom_name,
        patientDescription: data.patient_description,
        duration: data.duration,
        severity: data.severity,
        createdAt: data.created_at,
      }, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /visits/:id/symptoms — Get symptoms for a visit
 */
router.get(
  "/:id/symptoms",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN", "PATIENT"),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("symptoms")
        .select("id, symptom_name, patient_description, duration, severity, created_at")
        .eq("visit_id", req.params.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Transform snake_case → camelCase for frontend
      const result = (data ?? []).map((s) => ({
        id: s.id,
        symptomName: s.symptom_name,
        patientDescription: s.patient_description,
        duration: s.duration,
        severity: s.severity,
        createdAt: s.created_at,
      }));

      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /visits/:id — Get a single visit
 */
router.get("/:id", authenticate, authorize("STAFF", "DOCTOR", "ADMIN", "PATIENT"), async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from("visits")
      .select("*, patients(full_name, patient_code, auth_user_id), departments(name)")
      .eq("id", req.params.id);

    const { data, error } = await query.single();

    if (error || !data) throw new NotFoundError("Visit not found.");
    if (req.user!.role === "PATIENT" && data.patients?.auth_user_id !== req.user!.id) {
      throw new NotFoundError("Visit not found.");
    }

    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /patients/:patientId/visits — List visits for a patient
 */
router.get(
  "/patient/:patientId",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("visits")
        .select("id, visit_type, status, registered_at, completed_at, departments(name)")
        .eq("patient_id", req.params.patientId)
        .order("registered_at", { ascending: false });

      if (error) throw error;

      sendSuccess(res, data ?? []);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /visits/:id/status — Update visit status
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  validate({ body: z.object({ status: z.string().min(1) }) }),
  async (req, res, next) => {
    try {
      const updates: Record<string, unknown> = {
        status: req.body.status,
        updated_at: new Date().toISOString(),
      };

      if (req.body.status === "COMPLETED") {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabaseAdmin
        .from("visits")
        .update(updates)
        .eq("id", req.params.id)
        .select()
        .single();

      if (error || !data) throw new NotFoundError("Visit not found.");

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
