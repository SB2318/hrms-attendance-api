import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtPayload } from "../types/auth.type.js";

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: (env.jwtExpiresIn as any),
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.jwtSecret);
  return decoded as JwtPayload;
};
