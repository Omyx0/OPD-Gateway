import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError } from "../utils/errors.js";
import { z } from "zod";

const router = Router();

// ── Validation Schemas ──────────────────────────────────────────────

const createPatientSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  mobile: z.string().optional(),
  preferredLanguage: z.string().default("en"),
  address: z.record(z.string()).optional(),
});

const searchQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── Routes ──────────────────────────────────────────────────────────

/**
 * GET /patients/me
 * Resolve the patient record belonging to the authenticated account.
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("patients")
      .select("id, patient_code, full_name, date_of_birth, gender, mobile, preferred_language")
      .eq("id", req.user!.id)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      sendSuccess(res, data);
      return;
    }

    // Auto-provision patient record if missing
    const fullName = req.user!.email ? req.user!.email.split("@")[0] : "Patient";

    // 1. Ensure profile exists
    await supabaseAdmin.from("profiles").upsert({
      id: req.user!.id,
      full_name: fullName,
      email: req.user!.email,
      is_active: true,
    }, { onConflict: "id" });

    // 2. Ensure role
    await supabaseAdmin.from("user_roles").upsert({
      user_id: req.user!.id,
      role: "PATIENT",
    }, { onConflict: "user_id,role" });

    // 3. Generate unique patient code
    const code = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const { data: newPatient, error: insertErr } = await supabaseAdmin
      .from("patients")
      .upsert({
        id: req.user!.id,
        patient_code: code,
        full_name: fullName,
        mobile: "9999999999",
      }, { onConflict: "id" })
      .select("id, patient_code, full_name, date_of_birth, gender, mobile, preferred_language")
      .single();

    if (insertErr) throw insertErr;
    sendSuccess(res, newPatient);
  } catch (err) {
    next(err);
  }
});

router.post("/me", authenticate, async (req, res, next) => {
  try {
    const fullName = typeof req.body?.fullName === "string" && req.body.fullName.trim()
      ? req.body.fullName.trim()
      : (req.user!.email.split("@")[0] || "Patient");

    // 1. Ensure profile exists
    await supabaseAdmin.from("profiles").upsert({
      id: req.user!.id,
      full_name: fullName,
      email: req.user!.email,
      is_active: true,
    }, { onConflict: "id" });

    // 2. Ensure role
    await supabaseAdmin.from("user_roles").upsert({
      user_id: req.user!.id,
      role: "PATIENT",
    }, { onConflict: "user_id,role" });

    const { data: existing } = await supabaseAdmin
      .from("patients")
      .select("id, patient_code, full_name")
      .eq("id", req.user!.id)
      .maybeSingle();

    if (existing) {
      sendSuccess(res, existing);
      return;
    }

    const code = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const { data, error } = await supabaseAdmin
      .from("patients")
      .upsert({
        id: req.user!.id,
        patient_code: code,
        full_name: fullName,
        mobile: "9999999999",
      }, { onConflict: "id" })
      .select("id, patient_code, full_name")
      .single();

    if (error) throw error;
    sendSuccess(res, data, 201);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /patients
 * Create a new patient record.
 */
router.post(
  "/",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  validate({ body: createPatientSchema }),
  async (req, res, next) => {
    try {
      const { fullName, dateOfBirth, gender, mobile, preferredLanguage, address } = req.body;

      // Generate a patient code (e.g., P-10001)
      const { count } = await supabaseAdmin
        .from("patients")
        .select("*", { count: "exact", head: true });

      const patientCode = `P-${String((count ?? 0) + 10001)}`;

      const { data, error } = await supabaseAdmin
        .from("patients")
        .insert({
          patient_code: patientCode,
          full_name: fullName,
          date_of_birth: dateOfBirth,
          gender,
          mobile,
          preferred_language: preferredLanguage,
          address,
        })
        .select("id, patient_code, full_name")
        .single();

      if (error) throw error;

      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /patients
 * List patients with search and pagination.
 */
router.get(
  "/",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  validate({ query: searchQuerySchema }),
  async (req, res, next) => {
    try {
      const { search, page, limit } = req.query as unknown as z.infer<typeof searchQuerySchema>;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from("patients")
        .select("id, patient_code, full_name, gender, mobile, created_at", { count: "exact" });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,patient_code.ilike.%${search}%,mobile.ilike.%${search}%`);
      }

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      sendSuccess(res, { items: data ?? [], page, limit, total: count ?? 0 });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /patients/:id
 * Get a single patient by ID.
 */
router.get(
  "/:id",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("patients")
        .select("*")
        .eq("id", req.params.id)
        .single();

      if (error || !data) throw new NotFoundError("Patient not found.");

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /patients/:id
 * Update a patient record.
 */
router.patch(
  "/:id",
  authenticate,
  authorize("STAFF", "DOCTOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("patients")
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error || !data) throw new NotFoundError("Patient not found.");

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
