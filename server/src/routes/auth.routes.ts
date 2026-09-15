import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { sendSuccess } from "../utils/response.js";
import { supabaseAdmin } from "../config/supabase.js";
import { NotFoundError, AppError } from "../utils/errors.js";
import { logAudit } from "../utils/audit.js";
import { z } from "zod";

const router = Router();

/**
 * GET /auth/me
 *
 * Returns the authenticated user's profile, role, and verification status.
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Get profile (select * to capture verification fields if present)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new NotFoundError("User profile not found.");
    }

    // Get role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    // If user is doctor, get doctor details
    let doctorDetails = null;
    if (roleData?.role === "DOCTOR") {
      const { data: doc } = await supabaseAdmin
        .from("doctors")
        .select("id, specialization, department_id, is_active, doctor_departments(department_id, is_primary, departments(name, code))")
        .eq("profile_id", userId)
        .maybeSingle();
      doctorDetails = doc;
    }

    // Determine verification status
    // 1. Explicit verification_status if set
    // 2. Fallback: If is_active is false, PENDING. If true, APPROVED.
    const verificationStatus =
      profile.verification_status ||
      (profile.is_active === false ? "PENDING" : "APPROVED");

    sendSuccess(res, {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      role: roleData?.role ?? null,
      isActive: profile.is_active ?? true,
      verificationStatus,
      verificationDetails: profile.verification_details ?? null,
      doctor: doctorDetails,
    });
  } catch (err) {
    next(err);
  }
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.enum(["DOCTOR", "STAFF"]),
  // Verification details
  licenseNumber: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  experienceYears: z.number().optional(),
  employeeId: z.string().optional(),
  departmentName: z.string().optional(),
  designation: z.string().optional(),
  departmentId: z.string().optional(),
});

/**
 * POST /auth/register
 *
 * Real dynamic registration for new Doctors and Hospital Staff.
 * Places registration in PENDING verification status awaiting Admin review.
 */
router.post("/register", async (req, res, next) => {
  try {
    const validated = registerSchema.safeParse(req.body);
    if (!validated.success) {
      throw new AppError(validated.error.errors[0]?.message || "Invalid registration payload", 400, "VALIDATION_ERROR");
    }

    const {
      email,
      password,
      fullName,
      role,
      licenseNumber,
      qualification,
      specialization,
      experienceYears,
      employeeId,
      departmentName,
      designation,
      departmentId,
    } = validated.data;

    // Check if user already exists
    const { data: existingList } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingList?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      throw new AppError("An account with this email address already exists. Please sign in.", 409, "USER_EXISTS");
    }

    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, requested_role: role },
    });

    if (authError || !authData.user) {
      throw new AppError(`Failed to create account: ${authError?.message || "Unknown error"}`, 500, "AUTH_ERROR");
    }

    const userId = authData.user.id;

    // 2. Prepare structured verification details
    const verificationDetails = {
      requestedRole: role,
      submittedAt: new Date().toISOString(),
      ...(role === "DOCTOR"
        ? {
            licenseNumber: licenseNumber || "Pending submission",
            qualification: qualification || "MBBS",
            specialization: specialization || "General Medicine",
            experienceYears: experienceYears || 1,
            departmentId: departmentId || null,
          }
        : {
            employeeId: employeeId || "STAFF-" + Math.floor(1000 + Math.random() * 9000),
            departmentName: departmentName || "OPD Services",
            designation: designation || "Clinical Staff",
          }),
    };

    // 3. Upsert profile with PENDING status and is_active = false
    try {
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email,
        full_name: fullName,
        is_active: false, // Inactive until Admin verifies
        verification_status: "PENDING",
        verification_details: verificationDetails,
      });
    } catch {
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email,
        full_name: fullName,
        is_active: false,
      });
    }

    // 4. Assign requested role in user_roles
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });

    // 5. If DOCTOR, create unverified doctors record
    if (role === "DOCTOR") {
      const { data: docRecord } = await supabaseAdmin
        .from("doctors")
        .upsert(
          {
            profile_id: userId,
            specialization: specialization || "General Practice",
            department_id: departmentId || null,
            is_active: false,
          },
          { onConflict: "profile_id" }
        )
        .select("id")
        .maybeSingle();

      if (docRecord && departmentId) {
        await supabaseAdmin
          .from("doctor_departments")
          .upsert(
            { doctor_id: docRecord.id, department_id: departmentId, is_primary: true },
            { onConflict: "doctor_id,department_id" }
          );
      }
    }

    // 6. Notify Admins via notifications table
    const { data: admins } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "ADMIN");

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await supabaseAdmin.from("notifications").insert({
          recipient_user_id: admin.user_id,
          type: "PENDING_VERIFICATION",
          title: `New ${role} Registration: ${fullName}`,
          message: `${fullName} has submitted a registration request for role ${role} awaiting credentials review.`,
          is_read: false,
        });
      }
    }

    // 7. Audit log
    await logAudit({
      actorUserId: userId,
      action: "STAFF_REGISTRATION_SUBMITTED",
      entityType: "user",
      entityId: userId,
      metadata: { role, verificationDetails },
    });

    sendSuccess(
      res,
      {
        userId,
        email,
        fullName,
        role,
        verificationStatus: "PENDING",
        verificationDetails,
        message:
          "Registration submitted successfully! Your account is now under review by the hospital administration.",
      },
      201
    );
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/logout
 *
 * Server-side logout acknowledgement.
 */
router.post("/logout", authenticate, async (_req, res) => {
  sendSuccess(res, { message: "Logged out successfully." });
});

export default router;
