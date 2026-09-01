import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { sendError } from "../utils/response.js";

/**
 * Validate request body against a Zod schema.
 */
export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      sendError(res, "Validation failed", 400, result.error.issues);
      return;
    }
    req.body = result.data as unknown;
    next();
  };
};

/**
 * Validate request query params against a Zod schema.
 */
export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      sendError(res, "Invalid query parameters", 400, result.error.issues);
      return;
    }
    (req as Request & { parsedQuery: unknown }).parsedQuery = result.data;
    next();
  };
};
