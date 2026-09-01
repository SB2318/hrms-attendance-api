import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateQuery } from "../middleware/validate.middleware.js";
import { attendanceQuerySchema } from "../schemas/attendance.schema.js";

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes (own attendance)
router.post("/punch-in", attendanceController.punchIn);
router.post("/punch-out", attendanceController.punchOut);
router.get("/my", validateQuery(attendanceQuerySchema), attendanceController.getMyAttendance);

// HR/ADMIN route (report)
router.get(
  "/report",
  authorize("ADMIN", "HR", "MANAGER"),
  validateQuery(attendanceQuerySchema),
  attendanceController.getReport
);

export default router;
