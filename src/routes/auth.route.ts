import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";

const router: Router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Employee login
 *     description: >
 *       Authenticates an employee with email and password.
 *       Returns a signed JWT token valid for the duration configured in
 *       `JWT_EXPIRES_IN` (default: 1 day). Pass this token as
 *       `Authorization: Bearer <token>` on all subsequent requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: subham@company.com
 *             password: secret123
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token and employee profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error — email format invalid or password too short
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Validation failed
 *               errors:
 *                 - path: [email]
 *                   message: Please enter a valid email address
 *       401:
 *         description: Invalid credentials — wrong email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Invalid email or password
 */
router.post("/login", validateBody(loginSchema), login);

export default router;
