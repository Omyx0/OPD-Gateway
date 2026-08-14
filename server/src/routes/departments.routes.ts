import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError } from "../utils/errors.js";
import { z } from "zod";

const router = Router();

const createDepartmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  hospitalId: z.string().uuid().optional(),
});

/**
 * GET /departments — List all departments
 */
router.get("/", authenticate, authorize("STAFF", "DOCTOR", "ADMIN"), async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    sendSuccess(res, data ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /departments/:id — Get a single department
 */
router.get("/:id", authenticate, authorize("STAFF", "DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) throw new NotFoundError("Department not found.");
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /departments — Create a department (ADMIN only)
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createDepartmentSchema }),
  async (req, res, next) => {
    try {
      const { name, code, hospitalId } = req.body;

      const { data, error } = await supabaseAdmin
        .from("departments")
        .insert({ name, code, hospital_id: hospitalId })
        .select()
        .single();

      if (error) throw error;
      sendSuccess(res, data, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /departments/:id — Update a department (ADMIN only)
 */
router.patch("/:id", authenticate, authorize("ADMIN"), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("departments")
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) throw new NotFoundError("Department not found.");
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

export default router;
