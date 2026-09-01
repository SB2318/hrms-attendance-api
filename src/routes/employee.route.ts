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

/**
 * @openapi
 * /api/employees:
 *   get:
 *     tags:
 *       - Employees
 *     summary: List all employees
 *     description: >
 *       Returns a paginated list of all employees ordered by creation date
 *       (newest first). Password hashes are never included in the response.
 *       **Requires:** ADMIN or HR role.
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
 *         description: Number of employees per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated list of employees
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEmployees'
 *       401:
 *         description: Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Authenticated but insufficient role (not ADMIN or HR)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Access denied. Required role: ADMIN or HR.
 */
router.get("/", employeeController.getAll);

/**
 * @openapi
 * /api/employees/{id}:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get a single employee by ID
 *     description: >
 *       Fetches a single employee record by their numeric ID.
 *       **Requires:** ADMIN or HR role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numeric ID of the employee to retrieve
 *     responses:
 *       200:
 *         description: Employee record found
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
 *                   example: Employee fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No employee found with the given ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Employee with ID 99 not found
 */
router.get("/:id", employeeController.getOne);

/**
 * @openapi
 * /api/employees:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Create a new employee
 *     description: >
 *       Creates a new employee record. The password is bcrypt-hashed before
 *       storage and is never returned in any response. The `employeeCode`
 *       is automatically uppercased.
 *       **Requires:** ADMIN or HR role.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmployeeRequest'
 *           example:
 *             name: Riya Das
 *             email: riya@company.com
 *             password: secure@123
 *             role: EMPLOYEE
 *             employeeCode: EMP002
 *     responses:
 *       201:
 *         description: Employee created successfully
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
 *                   example: Employee created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation error — required fields missing or invalid
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
 *         description: Insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict — email or employee code already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               duplicateEmail:
 *                 summary: Duplicate email
 *                 value:
 *                   success: false
 *                   message: An employee with this email already exists
 *               duplicateCode:
 *                 summary: Duplicate employee code
 *                 value:
 *                   success: false
 *                   message: An employee with this employee code already exists
 */
router.post("/", validateBody(createEmployeeSchema), employeeController.create);

/**
 * @openapi
 * /api/employees/{id}:
 *   put:
 *     tags:
 *       - Employees
 *     summary: Update an existing employee
 *     description: >
 *       Partially updates an employee's record. All fields are optional —
 *       only fields included in the request body are updated.
 *       If `password` is provided it will be re-hashed automatically.
 *       **Requires:** ADMIN or HR role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numeric ID of the employee to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmployeeRequest'
 *           example:
 *             name: Riya Sen
 *             role: HR
 *     responses:
 *       200:
 *         description: Employee updated successfully
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
 *                   example: Employee updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation error
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
 *         description: Insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict — email or employee code already taken by another employee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", validateBody(updateEmployeeSchema), employeeController.update);

/**
 * @openapi
 * /api/employees/{id}:
 *   delete:
 *     tags:
 *       - Employees
 *     summary: Delete an employee
 *     description: >
 *       Permanently deletes an employee record. All associated attendance records
 *       are also deleted via `ON DELETE CASCADE`.
 *       **Requires:** ADMIN or HR role.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numeric ID of the employee to delete
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Employee deleted successfully
 *       401:
 *         description: Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Employee with ID 99 not found
 */
router.delete("/:id", employeeController.remove);

export default router;
