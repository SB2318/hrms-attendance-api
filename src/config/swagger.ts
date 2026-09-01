import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "HRMS Attendance API",
      version: "1.0.0",
      description: `
## HRMS Attendance Management API

A RESTful API for managing employee attendance in an HRMS system.

### Authentication
This API uses **JWT Bearer Token** authentication. To access protected endpoints:
1. Call \`POST /api/auth/login\` with your credentials
2. Copy the \`token\` from the response
3. Click the **Authorize** button (🔒) at the top of this page
4. Enter: \`Bearer <your-token>\`

### Roles & Permissions
| Role     | Permissions |
|----------|-------------|
| ADMIN    | Full access to all endpoints |
| HR       | Full access to all endpoints |
| MANAGER  | Read-only attendance reports |
| EMPLOYEE | Own punch-in/out and own attendance history |
      `,
      contact: {
        name: "HRMS Support",
        email: "support@hrms.local",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints — login and token management",
      },
      {
        name: "Employees",
        description:
          "Employee CRUD operations — restricted to ADMIN and HR roles",
      },
      {
        name: "Attendance",
        description:
          "Punch-in, punch-out, and attendance reporting endpoints",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT token obtained from POST /api/auth/login",
        },
      },
      schemas: {
        // ── Enums ────────────────────────────────────────────────────────────
        Role: {
          type: "string",
          enum: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
          example: "EMPLOYEE",
          description: "Employee role in the HRMS system",
        },

        // ── Core Models ───────────────────────────────────────────────────────
        Employee: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Unique employee identifier (auto-incremented)",
            },
            name: {
              type: "string",
              example: "Subham Bairagi",
              description: "Full name of the employee",
            },
            email: {
              type: "string",
              format: "email",
              example: "subham@company.com",
              description: "Unique email address used for login",
            },
            role: { $ref: "#/components/schemas/Role" },
            employeeCode: {
              type: "string",
              example: "EMP001",
              description:
                "Unique employee code (3–20 chars, stored uppercase)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-01T10:00:00.000Z",
              description: "Timestamp when the employee record was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-01T12:00:00.000Z",
              description: "Timestamp of the last update to the employee record",
            },
          },
          required: ["id", "name", "email", "role", "employeeCode"],
        },

        AttendanceRecord: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 42,
              description: "Unique attendance record identifier",
            },
            date: {
              type: "string",
              format: "date-time",
              example: "2026-09-01T00:00:00.000Z",
              description:
                "The calendar date this record belongs to (midnight UTC of that day)",
            },
            punchIn: {
              type: "string",
              format: "date-time",
              example: "2026-09-01T09:05:00.000Z",
              nullable: true,
              description: "Exact timestamp when the employee punched in",
            },
            punchOut: {
              type: "string",
              format: "date-time",
              example: "2026-09-01T18:00:00.000Z",
              nullable: true,
              description:
                "Exact timestamp when the employee punched out. Null if not yet punched out.",
            },
            workingHours: {
              type: "string",
              example: "8h 55m",
              nullable: true,
              description:
                "Computed total working hours (punchOut − punchIn). Null if still punched in.",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-01T09:05:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-01T18:00:00.000Z",
            },
            employee: {
              type: "object",
              description: "Partial employee info embedded in the record",
              properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "Subham Bairagi" },
                employeeCode: { type: "string", example: "EMP001" },
              },
            },
          },
          required: ["id", "date", "punchIn", "punchOut", "employee"],
        },

        // ── Request Bodies ────────────────────────────────────────────────────
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "subham@company.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "secret123",
              description: "Minimum 6 characters",
            },
          },
        },

        CreateEmployeeRequest: {
          type: "object",
          required: ["name", "email", "password", "employeeCode"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "Riya Das",
            },
            email: {
              type: "string",
              format: "email",
              example: "riya@company.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "secure@123",
              description: "Minimum 6 characters. Will be bcrypt-hashed.",
            },
            role: {
              $ref: "#/components/schemas/Role",
            },
            employeeCode: {
              type: "string",
              minLength: 3,
              maxLength: 20,
              example: "EMP002",
              description: "Stored in uppercase",
            },
          },
        },

        UpdateEmployeeRequest: {
          type: "object",
          description:
            "All fields are optional. Only provide fields you want to change.",
          properties: {
            name: { type: "string", minLength: 2, maxLength: 100 },
            email: { type: "string", format: "email" },
            password: {
              type: "string",
              minLength: 6,
              description: "Provide only to change the password",
            },
            role: { $ref: "#/components/schemas/Role" },
            employeeCode: { type: "string", minLength: 3, maxLength: 20 },
          },
        },

        // ── Responses ─────────────────────────────────────────────────────────
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  description:
                    "JWT access token. Valid for the duration set in JWT_EXPIRES_IN (default 1d).",
                },
                employee: {
                  type: "object",
                  properties: {
                    id: { type: "integer", example: 1 },
                    name: { type: "string", example: "Subham Bairagi" },
                    email: {
                      type: "string",
                      format: "email",
                      example: "subham@company.com",
                    },
                    role: { $ref: "#/components/schemas/Role" },
                    employeeCode: { type: "string", example: "EMP001" },
                  },
                },
              },
            },
          },
        },

        PaginatedEmployees: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Employees fetched successfully" },
            data: {
              type: "object",
              properties: {
                employees: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Employee" },
                },
                pagination: { $ref: "#/components/schemas/Pagination" },
              },
            },
          },
        },

        PaginatedAttendance: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Attendance history fetched successfully" },
            data: {
              type: "object",
              properties: {
                attendance: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AttendanceRecord" },
                },
                pagination: { $ref: "#/components/schemas/Pagination" },
              },
            },
          },
        },

        Pagination: {
          type: "object",
          description: "Pagination metadata included in all list responses",
          properties: {
            total: {
              type: "integer",
              example: 45,
              description: "Total number of records matching the query",
            },
            page: {
              type: "integer",
              example: 1,
              description: "Current page number (1-indexed)",
            },
            limit: {
              type: "integer",
              example: 10,
              description: "Number of records per page",
            },
            totalPages: {
              type: "integer",
              example: 5,
              description: "Total number of pages available",
            },
          },
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred" },
            errors: {
              type: "array",
              description:
                "Only present on validation errors (HTTP 400). Each item describes one invalid field.",
              items: {
                type: "object",
                properties: {
                  path: {
                    type: "array",
                    items: { type: "string" },
                    example: ["email"],
                  },
                  message: {
                    type: "string",
                    example: "Please enter a valid email address",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  // Glob patterns for files that contain JSDoc @openapi annotations
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
