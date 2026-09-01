import express from "express";
import "express-async-errors"; // Handles async errors in express automatically
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";

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

// Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to HRMS Attendance API",
    env: env.nodeEnv,
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
