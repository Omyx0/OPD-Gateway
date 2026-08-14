import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

/**
 * Global error handler.
 *
 * Catches all errors thrown or passed via next(err) and returns
 * the standardized { success: false, error: { code, message } } format.
 *
 * Never exposes stack traces or internal details in production.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Log the full error server-side
  logger.error(err.message, {
    name: err.name,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Known operational errors
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  // Zod validation errors (if thrown directly)
  if (err.name === "ZodError") {
    sendError(res, "VALIDATION_ERROR", "Invalid request data.", 400);
    return;
  }

  // Unknown / unexpected errors
  const message =
    env.NODE_ENV === "development"
      ? err.message
      : "An unexpected error occurred.";

  sendError(res, "INTERNAL_ERROR", message, 500);
}
