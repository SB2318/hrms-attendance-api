import type { Request } from "express";
import type { Role } from "@prisma/client";

export interface JwtPayload {
  userId: number;
  email: string;
  role: Role;
  employeeCode: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
