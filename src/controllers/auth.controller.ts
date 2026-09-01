import type { Request, Response } from "express";
import { loginEmployee } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";
import type { LoginInput } from "../schemas/auth.schema.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  const credentials = req.body as LoginInput;
  const result = await loginEmployee(credentials);
  sendSuccess(res, "Login successful", result);
};
