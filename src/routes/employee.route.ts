import { Router } from "express";
import * as employeeController from "../controllers/employee.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../schemas/employee.schema.js";

const router: Router = Router();

// All employee routes require authentication and HR/ADMIN access
router.use(authenticate);
router.use(authorize("ADMIN", "HR"));

router.get("/", employeeController.getAll);
router.get("/:id", employeeController.getOne);
router.post("/", validateBody(createEmployeeSchema), employeeController.create);
router.put("/:id", validateBody(updateEmployeeSchema), employeeController.update);
router.delete("/:id", employeeController.remove);

export default router;
