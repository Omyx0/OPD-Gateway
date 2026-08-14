import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { UnauthorizedError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/**
 * Authentication middleware.
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it with Supabase Auth, and attaches the authenticated
 * user to `req.user`.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed authorization header.");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Missing access token.");
    }

    // Verify the JWT with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      logger.warn("JWT verification failed", { error: error?.message });
      throw new UnauthorizedError("Invalid or expired token.");
    }

    // Attach authenticated user to the request
    req.user = {
      id: data.user.id,
      email: data.user.email ?? "",
    };

    next();
  } catch (err) {
    next(err);
  }
}
