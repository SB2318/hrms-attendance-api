import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/auth.type.js";
import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, "Access denied. No token provided.", 401);
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    sendError(res, "Access denied. Token is missing.", 401);
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    sendError(res, "Invalid or expired token. Please log in again.", 401);
  }
};
