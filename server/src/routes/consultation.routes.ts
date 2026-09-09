/**
 * Consultation routes — Doctor workflow.
 *
 * Handles the doctor's consultation lifecycle:
 * 1. Start consultation (marks visit IN_CONSULTATION)
 * 2. View patient details + symptoms + triage
 * 3. Save clinical notes (SOAP format)
 * 4. Complete visit
 *
 * Doctors can only see queues for their assigned departments.
 */
import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { logAudit } from "../utils/audit.js";
import { emitQueueStatusUpdated } from "../utils/socket.js";
import { z } from "zod";

const router = Router();

// ── Schemas ─────────────────────────────────────────────────────────

const clinicalNotesSchema = z.object({
  subjectiveNotes: z.string().optional(),
  objectiveNotes: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  diagnosis: z.string().optional(),
  disposition: z.enum(["DISCHARGE", "DISCHARGED", "ADMIT", "ADMITTED", "REFER", "REFERRED", "FOLLOWUP", "FOLLOW_UP"]).optional(),
  followUpDate: z.string().optional(),
});

const completeSchema = z.object({
  diagnosis: z.string().optional(),
  disposition: z.enum(["DISCHARGE", "DISCHARGED", "ADMIT", "ADMITTED", "REFER", "REFERRED", "FOLLOWUP", "FOLLOW_UP"]).default("DISCHARGED"),
  notes: z.string().optional(),
});

// ── Routes ──────────────────────────────────────────────────────────

/**
 * GET /consultation/my-queue — Doctor's queue filtered by their assigned departments
 */
router.get(
  "/my-queue",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      // Find doctor record
      const { data: doctor } = await supabaseAdmin
        .from("doctors")
        .select("id")
        .eq("profile_id", req.user!.id)
        .single();

      let departmentIds: string[] = [];

      if (doctor) {
        // Get doctor's assigned departments
        const { data: deptLinks } = await supabaseAdmin
          .from("doctor_departments")
          .select("department_id")
          .eq("doctor_id", doctor.id);

        departmentIds = (deptLinks ?? []).map(d => d.department_id);
      }

      // If doctor has no specific departments, show all (fallback)
      let query = supabaseAdmin
        .from("queue_tickets")
        .select("*, visits(id, status, patient_id, raw_symptoms_text, patients(full_name, patient_code, date_of_birth, gender)), departments(name)")
        .in("status", ["WAITING", "CALLED", "IN_PROGRESS"]);

      if (departmentIds.length > 0) {
        query = query.in("department_id", departmentIds);
      }

      const { data, error } = await query.order("arrival_time", { ascending: true });
      if (error) throw error;

      // Sort by priority
      const priorityWeight: Record<string, number> = { RED: 0, YELLOW: 1, GREEN: 2 };
      const sorted = (data ?? []).sort(
        (a, b) => (priorityWeight[a.priority] ?? 3) - (priorityWeight[b.priority] ?? 3)
      );

      sendSuccess(res, sorted);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /consultation/:visitId/start — Start consultation
 */
router.post(
  "/:visitId/start",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const visitId = req.params.visitId as string;

      // Find or auto-create doctor record
      let { data: doctor } = await supabaseAdmin
        .from("doctors")
        .select("id")
        .eq("profile_id", req.user!.id)
        .single();

      if (!doctor) {
        // Auto-create doctor record
        const { data: newDoc, error: docErr } = await supabaseAdmin
          .from("doctors")
          .insert({ profile_id: req.user!.id, is_active: true })
          .select("id")
          .single();
        if (docErr) throw docErr;
        doctor = newDoc;
      }

      // Update visit status
      const { data: visit, error: visitErr } = await supabaseAdmin
        .from("visits")
        .update({
          status: "IN_CONSULTATION",
          consulting_doctor_id: doctor!.id,
          consultation_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitId)
        .select("*, patients(full_name, patient_code)")
        .single();

      if (visitErr || !visit) throw new NotFoundError("Visit not found.");

      // Update queue ticket
      const { data: ticket } = await supabaseAdmin
        .from("queue_tickets")
        .update({
          status: "IN_PROGRESS",
          assigned_doctor_id: doctor!.id,
          updated_at: new Date().toISOString(),
        })
        .eq("visit_id", visitId)
        .neq("status", "COMPLETED")
        .neq("status", "SKIPPED")
        .select()
        .single();

      if (ticket) {
        emitQueueStatusUpdated(req.app, { ...ticket, patientUserId: visit.patient_id });
      }

      await logAudit({
        actorUserId: req.user!.id,
        action: "CONSULTATION_STARTED",
        entityType: "visit",
        entityId: visitId,
        metadata: { doctorId: doctor!.id },
      });

      sendSuccess(res, { visit, queueTicket: ticket });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /consultation/:visitId — Get full consultation view
 * Returns visit + patient + symptoms + triage + clinical records
 */
router.get(
  "/:visitId",
  authenticate,
  authorize("DOCTOR", "ADMIN", "STAFF"),
  async (req, res, next) => {
    try {
      const visitId = req.params.visitId as string;

      // Fetch visit with patient
      const { data: visit, error: visitErr } = await supabaseAdmin
        .from("visits")
        .select("*, patients(full_name, patient_code, date_of_birth, gender, mobile)")
        .eq("id", visitId)
        .single();

      if (visitErr || !visit) throw new NotFoundError("Visit not found.");

      // Fetch symptoms
      const { data: symptoms } = await supabaseAdmin
        .from("symptoms")
        .select("*")
        .eq("visit_id", visitId)
        .order("created_at", { ascending: true });

      // Fetch triage assessment
      const { data: triage } = await supabaseAdmin
        .from("triage_assessments")
        .select("*")
        .eq("visit_id", visitId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch existing clinical records
      const { data: clinicalRecords } = await supabaseAdmin
        .from("clinical_records")
        .select("*")
        .eq("visit_id", visitId)
        .order("created_at", { ascending: false });

      // Fetch prescriptions
      const { data: prescriptions } = await supabaseAdmin
        .from("prescriptions")
        .select("*")
        .eq("visit_id", visitId);

      sendSuccess(res, {
        visit,
        symptoms: symptoms ?? [],
        triage,
        clinicalRecords: clinicalRecords ?? [],
        prescriptions: prescriptions ?? [],
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /consultation/:visitId/notes — Save clinical notes
 */
router.post(
  "/:visitId/notes",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  validate({ body: clinicalNotesSchema }),
  async (req, res, next) => {
    try {
      const visitId = req.params.visitId as string;

      // Find doctor record
      const { data: doctor } = await supabaseAdmin
        .from("doctors")
        .select("id")
        .eq("profile_id", req.user!.id)
        .single();

      if (!doctor) throw new ForbiddenError("Doctor record not found.");

      const { subjectiveNotes, objectiveNotes, assessment, plan, diagnosis, disposition, followUpDate } = req.body;

      const { data, error } = await supabaseAdmin
        .from("clinical_records")
        .insert({
          visit_id: visitId,
          doctor_id: doctor.id,
          subjective_notes: subjectiveNotes,
          objective_notes: objectiveNotes,
          assessment,
          plan,
          diagnosis,
          disposition,
          follow_up_date: followUpDate,
        })
        .select()
        .single();

      if (error) throw error;

      await logAudit({
        actorUserId: req.user!.id,
        action: "CLINICAL_NOTES_SAVED",
        entityType: "clinical_record",
        entityId: data.id,
        metadata: { visitId },
      });

      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /consultation/:visitId/complete — Complete the visit
 */
router.post(
  "/:visitId/complete",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  validate({ body: completeSchema }),
  async (req, res, next) => {
    try {
      const visitId = req.params.visitId as string;
      const { diagnosis, disposition, notes } = req.body;

      // Find doctor
      const { data: doctor } = await supabaseAdmin
        .from("doctors")
        .select("id")
        .eq("profile_id", req.user!.id)
        .single();

      // Save final clinical record if notes provided
      if (notes || diagnosis) {
        await supabaseAdmin.from("clinical_records").insert({
          visit_id: visitId,
          doctor_id: doctor?.id,
          assessment: diagnosis,
          plan: notes,
          diagnosis,
          disposition,
        });
      }

      // Complete the visit
      const { data: visit, error: visitErr } = await supabaseAdmin
        .from("visits")
        .update({
          status: "COMPLETED",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitId)
        .select("*, patients(full_name, patient_code, auth_user_id)")
        .single();

      if (visitErr || !visit) throw new NotFoundError("Visit not found.");

      // Complete queue ticket
      const { data: ticket } = await supabaseAdmin
        .from("queue_tickets")
        .update({
          status: "COMPLETED",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("visit_id", visitId)
        .neq("status", "COMPLETED")
        .select()
        .single();

      if (ticket) {
        const patientUserId = (visit.patients as any)?.auth_user_id;
        emitQueueStatusUpdated(req.app, { ...ticket, patientUserId });
      }

      await logAudit({
        actorUserId: req.user!.id,
        action: "VISIT_COMPLETED",
        entityType: "visit",
        entityId: visitId,
        metadata: { diagnosis, disposition },
      });

      sendSuccess(res, { visit, queueTicket: ticket });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /consultation/patient/:patientId/history — Get patient visit history
 */
router.get(
  "/patient/:patientId/history",
  authenticate,
  authorize("DOCTOR", "ADMIN", "STAFF"),
  async (req, res, next) => {
    try {
      const { data: visits, error } = await supabaseAdmin
        .from("visits")
        .select("*, departments(name), clinical_records(diagnosis, disposition, created_at)")
        .eq("patient_id", req.params.patientId as string)
        .order("registered_at", { ascending: false });

      if (error) throw error;

      sendSuccess(res, visits ?? []);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
