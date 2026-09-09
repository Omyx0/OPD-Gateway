/**
 * Admin routes — User management, audit logs, system settings.
 *
 * All endpoints require ADMIN role.
 */
import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError } from "../utils/errors.js";
import { logAudit } from "../utils/audit.js";
import { z } from "zod";

const router = Router();

// ── User Management ─────────────────────────────────────────────────

/**
 * GET /admin/users — List all users with roles
 */
router.get(
  "/users",
  authenticate,
  authorize("ADMIN"),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, is_active, created_at, user_roles(role)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      sendSuccess(res, {
        items: (data ?? []).map(u => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          isActive: u.is_active,
          role: (u.user_roles as any)?.[0]?.role ?? "PATIENT",
          createdAt: u.created_at,
        })),
        page,
        limit,
        total: count ?? 0,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /admin/users/:id/role — Update user role
 */
router.patch(
  "/users/:id/role",
  authenticate,
  authorize("ADMIN"),
  validate({ body: z.object({ role: z.enum(["PATIENT", "STAFF", "DOCTOR", "ADMIN"]) }) }),
  async (req, res, next) => {
    try {
      const id = req.params.id as string;
      const { role } = req.body;

      // Delete existing roles and insert new one
      await supabaseAdmin.from("user_roles").delete().eq("user_id", id);
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: id, role });
      if (error) throw error;

      // If setting to DOCTOR, ensure doctor record exists
      if (role === "DOCTOR") {
        const { data: existing } = await supabaseAdmin
          .from("doctors")
          .select("id")
          .eq("profile_id", id)
          .maybeSingle();

        if (!existing) {
          await supabaseAdmin.from("doctors").insert({ profile_id: id, is_active: true });
        }
      }

      await logAudit({
        actorUserId: req.user!.id,
        action: "USER_ROLE_UPDATED",
        entityType: "user",
        entityId: id,
        metadata: { newRole: role },
      });

      sendSuccess(res, { userId: id, role });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /admin/users/:id/status — Activate/deactivate user
 */
router.patch(
  "/users/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate({ body: z.object({ isActive: z.boolean() }) }),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({ is_active: req.body.isActive })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error || !data) throw new NotFoundError("User not found.");
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
);

// ── Doctor Department Assignment ────────────────────────────────────

/**
 * POST /admin/doctors/:doctorId/departments — Assign departments to doctor
 */
router.post(
  "/doctors/:doctorId/departments",
  authenticate,
  authorize("ADMIN"),
  validate({
    body: z.object({
      departmentIds: z.array(z.string().uuid()).min(1),
      primaryDepartmentId: z.string().uuid().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId as string;
      const { departmentIds, primaryDepartmentId } = req.body;

      // Clear existing assignments
      await supabaseAdmin.from("doctor_departments").delete().eq("doctor_id", doctorId);

      // Insert new assignments
      const rows = departmentIds.map((deptId: string) => ({
        doctor_id: doctorId,
        department_id: deptId,
        is_primary: deptId === primaryDepartmentId,
      }));

      const { error } = await supabaseAdmin.from("doctor_departments").insert(rows);
      if (error) throw error;

      await logAudit({
        actorUserId: req.user!.id,
        action: "DOCTOR_DEPARTMENTS_ASSIGNED",
        entityType: "doctor",
        entityId: doctorId,
        metadata: { departmentIds },
      });

      sendSuccess(res, { doctorId, departmentIds });
    } catch (err) {
      next(err);
    }
  }
);

// ── Audit Logs ──────────────────────────────────────────────────────

/**
 * GET /admin/audit-logs — Paginated audit logs
 */
router.get(
  "/audit-logs",
  authenticate,
  authorize("ADMIN"),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from("audit_logs")
        .select("*, profiles:actor_user_id(full_name, email)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (req.query.action) {
        query = query.eq("action", req.query.action as string);
      }
      if (req.query.entityType) {
        query = query.eq("entity_type", req.query.entityType as string);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      sendSuccess(res, { items: data ?? [], page, limit, total: count ?? 0 });
    } catch (err) {
      next(err);
    }
  }
);

// ── System Settings ─────────────────────────────────────────────────

/**
 * GET /admin/settings — Get all system settings
 */
router.get("/settings", authenticate, authorize("ADMIN"), async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("*")
      .order("key");

    if (error) throw error;
    sendSuccess(res, data ?? []);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /admin/settings/:key — Update a system setting
 */
router.put(
  "/settings/:key",
  authenticate,
  authorize("ADMIN"),
  validate({ body: z.object({ value: z.any(), description: z.string().optional() }) }),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("system_settings")
        .upsert({
          key: req.params.key,
          value: req.body.value,
          description: req.body.description,
          updated_by: req.user!.id,
        }, { onConflict: "key" })
        .select()
        .single();

      if (error) throw error;

      await logAudit({
        actorUserId: req.user!.id,
        action: "SETTING_UPDATED",
        entityType: "system_setting",
        metadata: { key: req.params.key },
      });

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
