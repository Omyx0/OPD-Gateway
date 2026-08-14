import type { Response } from "express";

/**
 * Standard success response.
 *
 * { success: true, data: ... }
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  res.status(statusCode).json({ success: true, data });
}

/**
 * Standard error response.
 *
 * { success: false, error: { code, message } }
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}
