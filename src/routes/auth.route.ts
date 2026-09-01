import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";

const router: Router = Router();

router.post("/login", validateBody(loginSchema), login);

export default router;
