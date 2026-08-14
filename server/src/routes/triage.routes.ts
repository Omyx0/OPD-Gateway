import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError } from "../utils/errors.js";
import { z } from "zod";

const router = Router();

const createSessionSchema = z.object({
  visitId: z.string().uuid(),
  language: z.string().default("en"),
});

const extractSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1, "Message is required."),
});

const assessSchema = z.object({
  visitId: z.string().uuid(),
});

/**
 * POST /triage/session — Create a new triage session
 */
router.post(
  "/session",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  validate({ body: createSessionSchema }),
  async (req, res, next) => {
    try {
      const { visitId, language } = req.body;

      // Verify visit exists
      const { data: visit, error: visitError } = await supabaseAdmin
        .from("visits")
        .select("id, status")
        .eq("id", visitId)
        .single();

      if (visitError || !visit) throw new NotFoundError("Visit not found.");

      // TODO: Create session in ai_interactions table
      // For now, return a placeholder session
      sendSuccess(res, {
        sessionId: crypto.randomUUID(),
        visitId,
        language,
        status: "ACTIVE",
      }, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /triage/extract — Extract symptoms from patient message via Gemini
 */
router.post(
  "/extract",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  validate({ body: extractSchema }),
  async (req, res, next) => {
    try {
      // TODO: Integrate Gemini API for symptom extraction
      // Placeholder response matching the API contract
      sendSuccess(res, {
        symptoms: [],
        redFlags: [],
        missingInformation: [],
        message: "Gemini integration pending.",
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /triage/assess — Run triage assessment
 */
router.post(
  "/assess",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  validate({ body: assessSchema }),
  async (req, res, next) => {
    try {
      // TODO: Implement full triage pipeline
      // Gemini + ML model + safety rules + queue ticket creation
      sendSuccess(res, {
        priority: "GREEN",
        confidence: 0,
        redFlags: [],
        recommendedAction: "ROUTINE",
        message: "Triage pipeline pending implementation.",
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /triage/:visitId — Get triage result for a visit
 */
router.get(
  "/:visitId",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("triage_assessments")
        .select("*")
        .eq("visit_id", req.params.visitId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) throw new NotFoundError("Triage assessment not found.");

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
