import type { Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import type { AuthRequest } from "../types/auth.type.js";
import { sendError } from "../utils/response.js";

/**
 * Restrict access to specific roles.
 * Usage: authorize("ADMIN", "HR")
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Unauthorized. Please log in first.", 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Required role: ${allowedRoles.join(" or ")}.`,
        403
      );
      return;
    }

    next();
  };
};
