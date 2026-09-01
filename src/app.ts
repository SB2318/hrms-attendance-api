import express from "express";
import "express-async-errors"; // Handles async errors in express automatically
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import swaggerSpec from "./config/swagger.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import employeeRoutes from "./routes/employee.route.js";
import attendanceRoutes from "./routes/attendance.route.js";

// Middleware
import { notFoundHandler, globalErrorHandler } from "./middleware/error.middleware.js";

const app: express.Express = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger UI ────────────────────────────────────────────────────────────────
// Interactive API docs at GET /api-docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "HRMS Attendance API Docs",
    swaggerOptions: {
      persistAuthorization: true, // JWT token survives page refresh
      docExpansion: "list",       // show tag groups collapsed by default
      filter: true,               // enable search bar
    },
  })
);

// Raw OpenAPI JSON spec at GET /api-docs.json (useful for Postman / code-gen)
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to HRMS Attendance API",
    env: env.nodeEnv,
    docs: "/api-docs",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
