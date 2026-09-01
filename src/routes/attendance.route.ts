import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateQuery } from "../middleware/validate.middleware.js";
import { attendanceQuerySchema } from "../schemas/attendance.schema.js";

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/attendance/punch-in:
 *   post:
 *     tags:
 *       - Attendance
 *     summary: Punch in for today
 *     description: >
 *       Records the employee's punch-in timestamp for the current calendar day
 *       (server local time). Only one punch-in is allowed per employee per day.
 *       The `date` field stored is midnight of the current day, while `punchIn`
 *       stores the exact timestamp of the request.
 *       **Requires:** Any authenticated employee.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Punched in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Punched in successfully
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *       400:
 *         description: Already punched in today
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: You have already punched in for today
 *       401:
 *         description: Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/punch-in", attendanceController.punchIn);

/**
 * @openapi
 * /api/attendance/punch-out:
 *   post:
 *     tags:
 *       - Attendance
 *     summary: Punch out for today
 *     description: >
 *       Records the employee's punch-out timestamp for the current calendar day.
 *       The employee must have already punched in today. Only one punch-out
 *       is allowed per day. The API also computes and returns `workingHours`
 *       (a formatted string like `"8h 55m"`) in the response data.
 *       **Requires:** Any authenticated employee.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Punched out successfully — includes computed workingHours
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Punched out successfully
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *       400:
 *         description: |
 *           One of the following business-rule violations:
 *           - No punch-in record found for today
 *           - Already punched out today
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notPunchedIn:
 *                 summary: No punch-in found
 *                 value:
 *                   success: false
 *                   message: No punch-in record found for today. Please punch in first.
 *               alreadyPunchedOut:
 *                 summary: Already punched out
 *                 value:
 *                   success: false
 *                   message: You have already punched out for today.
 *       401:
 *         description: Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/punch-out", attendanceController.punchOut);

/**
 * @openapi
 * /api/attendance/my:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get my attendance history
 *     description: >
 *       Returns a paginated list of the authenticated employee's own attendance
 *       records. Records are ordered by date descending (most recent first).
 *       Optionally filter by date range using `startDate` and `endDate`
 *       (ISO 8601 date strings, e.g. `2026-09-01`).
 *       **Requires:** Any authenticated employee.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Records per page (max 100)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-09-01'
 *         description: Filter records on or after this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-09-30'
 *         description: Filter records on or before this date (inclusive, until 23:59:59)
 *     responses:
 *       200:
 *         description: Paginated attendance history for the authenticated employee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAttendance'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/my", validateQuery(attendanceQuerySchema), attendanceController.getMyAttendance);

/**
 * @openapi
 * /api/attendance/report:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get full attendance report
 *     description: >
 *       Returns a paginated attendance report across all employees (or filtered
 *       to a specific employee via `employeeId`). Records are ordered by date
 *       descending. Each record includes embedded employee info
 *       (`id`, `name`, `employeeCode`) and a computed `workingHours` field.
 *       **Requires:** ADMIN, HR, or MANAGER role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: integer
 *           example: 3
 *         description: Filter records for a specific employee ID (optional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Records per page (max 100)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-09-01'
 *         description: Filter records on or after this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-09-30'
 *         description: Filter records on or before this date (inclusive, until 23:59:59)
 *     responses:
 *       200:
 *         description: Paginated full attendance report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAttendance'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient role (EMPLOYEE cannot access this endpoint)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Access denied. Required role: ADMIN or HR or MANAGER.
 */
router.get(
  "/report",
  authorize("ADMIN", "HR", "MANAGER"),
  validateQuery(attendanceQuerySchema),
  attendanceController.getReport
);

export default router;
