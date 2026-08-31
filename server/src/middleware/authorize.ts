import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/**
 * RBAC authorization middleware factory.
 *
 * Usage: `authorize("ADMIN", "DOCTOR")`
 *
 * Checks the authenticated user's role from the `user_roles` table.
 * The role is NEVER trusted from the frontend — it is always loaded
 * from the database.
 */
export function authorize(...allowedRoles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedError("Authentication required before authorization.");
      }

      // Load the user's role from the database
      const { data, error } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", req.user.id)
        .limit(1);

      let userRole: string;

      if (error || !data || data.length === 0) {
        // Authenticated user with no specific role assigned defaults to PATIENT
        userRole = "PATIENT";
      } else {
        userRole = data[0].role as string;
      }

      if (!allowedRoles.includes(userRole)) {
        logger.warn("Authorization denied", {
          userId: req.user.id,
          userRole,
          requiredRoles: allowedRoles,
        });
        throw new ForbiddenError(
          `Role '${userRole}' is not authorized for this operation. Required: ${allowedRoles.join(", ")}.`
        );
      }

      // Attach role to request for downstream use
      req.user.role = userRole;

      next();
    } catch (err) {
      next(err);
    }
  };
}
