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
  authorize("STAFF", "DOCTOR", "ADMIN"),
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
          status: "TRIAGE_PENDING",
        })
        .select("id, patient_id, department_id, status, registered_at")
        .single();

      if (error) throw error;

      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /visits/:id — Get a single visit
 */
router.get("/:id", authenticate, authorize("STAFF", "DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("visits")
      .select("*, patients(full_name, patient_code), departments(name)")
      .eq("id", req.params.id)
      .single();

    if (error || !data) throw new NotFoundError("Visit not found.");

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
