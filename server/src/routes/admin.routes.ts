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

// ── Verification Management ──────────────────────────────────────────

/**
 * GET /admin/verifications — List all pending and reviewed verification requests
 */
router.get("/verifications", authenticate, authorize("ADMIN"), async (req, res, next) => {
  try {
    const status = req.query.status as string || "PENDING";

    // Query profiles with user_roles and doctor details
    let query = supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, is_active, created_at, verification_status, verification_details, user_roles(role)")
      .order("created_at", { ascending: false });

    if (status === "PENDING") {
      // Return users where is_active is false OR verification_status is PENDING
      query = query.or("is_active.eq.false,verification_status.eq.PENDING");
    } else if (status === "APPROVED") {
      query = query.eq("verification_status", "APPROVED").eq("is_active", true);
    } else if (status === "REJECTED") {
      query = query.eq("verification_status", "REJECTED");
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter out PATIENT users — only show prospective STAFF or DOCTOR
    const prospectiveStaff = (data ?? []).filter((u: any) => {
      const role = u.user_roles?.[0]?.role;
      const requestedRole = u.verification_details?.requestedRole;
      return role === "STAFF" || role === "DOCTOR" || requestedRole === "STAFF" || requestedRole === "DOCTOR";
    });

    sendSuccess(res, prospectiveStaff);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /admin/verifications/:userId/approve — Approve a staff/doctor verification request
 */
router.post(
  "/verifications/:userId/approve",
  authenticate,
  authorize("ADMIN"),
  async (req, res, next) => {
    try {
      const userId = req.params.userId as string;
      const { assignedRole, departmentId } = req.body;

      // 1. Get user profile
      const { data: profile, error: pErr } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (pErr || !profile) {
        throw new NotFoundError("Applicant profile not found.");
      }

      const role = assignedRole || profile.verification_details?.requestedRole || "STAFF";

      // 2. Update profile to APPROVED and is_active = true
      try {
        await supabaseAdmin
          .from("profiles")
          .update({
            verification_status: "APPROVED",
            is_active: true,
            verification_details: {
              ...(profile.verification_details || {}),
              approvedAt: new Date().toISOString(),
              approvedBy: req.user!.id,
            },
          })
          .eq("id", userId);
      } catch {
        await supabaseAdmin
          .from("profiles")
          .update({ is_active: true })
          .eq("id", userId);
      }

      // 3. Assign role in user_roles
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });

      // 4. If role is DOCTOR, activate/create doctor profile and link department
      if (role === "DOCTOR") {
        let doctorId: string;
        const { data: existingDoc } = await supabaseAdmin
          .from("doctors")
          .select("id")
          .eq("profile_id", userId)
          .maybeSingle();

        if (existingDoc) {
          doctorId = existingDoc.id;
          await supabaseAdmin
            .from("doctors")
            .update({
              is_active: true,
              department_id: departmentId || undefined,
            })
            .eq("id", doctorId);
        } else {
          const { data: newDoc, error: dErr } = await supabaseAdmin
            .from("doctors")
            .insert({
              profile_id: userId,
              department_id: departmentId || null,
              specialization: profile.verification_details?.specialization || "General Practice",
              is_active: true,
            })
            .select("id")
            .single();
          if (dErr) throw dErr;
          doctorId = newDoc.id;
        }

        if (departmentId && doctorId) {
          await supabaseAdmin
            .from("doctor_departments")
            .upsert(
              { doctor_id: doctorId, department_id: departmentId, is_primary: true },
              { onConflict: "doctor_id,department_id" }
            );
        }
      }

      // 5. Send approval notification to the user
      await supabaseAdmin.from("notifications").insert({
        recipient_user_id: userId,
        type: "VERIFICATION_APPROVED",
        title: "Account Approved & Verified!",
        message: `Welcome to Smart OPD! Your ${role} account has been verified by hospital administration. You now have full dashboard access.`,
        is_read: false,
      });

      // 6. Audit log
      await logAudit({
        actorUserId: req.user!.id,
        action: "STAFF_VERIFIED",
        entityType: "user",
        entityId: userId,
        metadata: { role, departmentId },
      });

      sendSuccess(res, { userId, role, status: "APPROVED", message: "User verified and approved successfully." });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /admin/verifications/:userId/reject — Reject a staff/doctor verification request
 */
router.post(
  "/verifications/:userId/reject",
  authenticate,
  authorize("ADMIN"),
  async (req, res, next) => {
    try {
      const userId = req.params.userId as string;
      const { reason } = req.body;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!profile) {
        throw new NotFoundError("Applicant profile not found.");
      }

      try {
        await supabaseAdmin
          .from("profiles")
          .update({
            verification_status: "REJECTED",
            is_active: false,
            verification_details: {
              ...(profile.verification_details || {}),
              rejectedAt: new Date().toISOString(),
              rejectedBy: req.user!.id,
              rejectionReason: reason || "Credentials could not be verified.",
            },
          })
          .eq("id", userId);
      } catch {
        await supabaseAdmin
          .from("profiles")
          .update({ is_active: false })
          .eq("id", userId);
      }

      await supabaseAdmin.from("notifications").insert({
        recipient_user_id: userId,
        type: "VERIFICATION_REJECTED",
        title: "Account Verification Update",
        message: `Your account verification was not approved. Reason: ${reason || "Credentials could not be verified by administration."}`,
        is_read: false,
      });

      await logAudit({
        actorUserId: req.user!.id,
        action: "STAFF_VERIFICATION_REJECTED",
        entityType: "user",
        entityId: userId,
        metadata: { reason },
      });

      sendSuccess(res, { userId, status: "REJECTED", message: "Application rejected." });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /admin/seed-realtime-queue — Trigger dynamic queue seed from Admin UI
 */
router.post(
  "/seed-realtime-queue",
  authenticate,
  authorize("ADMIN"),
  async (_req, res, next) => {
    try {
      const { seedRealtimeQueue } = await import("../utils/seedRealtimeQueue.js");
      const result = await seedRealtimeQueue();
      sendSuccess(res, { ...result, message: "Real-time queue refreshed with dynamic seeded data." });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

