import type { Request, Response, NextFunction } from "express";
import { z, type ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Generic Zod validation middleware.
 *
 * Validates `req.body`, `req.query`, and/or `req.params` against
 * the provided schemas. Throws a ValidationError with details
 * if validation fails.
 *
 * Usage:
 * ```ts
 * router.post("/patients", validate({ body: createPatientSchema }), controller);
 * ```
 */
export function validate(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
          throw new ValidationError(`Validation failed: ${messages.join("; ")}`);
        }
        req.body = result.data;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
          throw new ValidationError(`Query validation failed: ${messages.join("; ")}`);
        }
        req.query = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
          throw new ValidationError(`Params validation failed: ${messages.join("; ")}`);
        }
        req.params = result.data;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
