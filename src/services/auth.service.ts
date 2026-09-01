import { AppError } from "../middleware/error.middleware.js";
import { findEmployeeByEmail } from "../repositories/employee.repository.js";
import { comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import type { LoginInput } from "../schemas/auth.schema.js";

export const loginEmployee = async (credentials: LoginInput) => {
  // 1. Find employee by email
  const employee = await findEmployeeByEmail(credentials.email);
  if (!employee) {
    throw new AppError("Invalid email or password", 401);
  }

  // 2. Check password
  const isPasswordCorrect = await comparePassword(credentials.password, employee.passwordHash);
  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password", 401);
  }

  // 3. Generate JWT token
  const token = signToken({
    userId: employee.id,
    email: employee.email,
    role: employee.role,
    employeeCode: employee.employeeCode,
    name: employee.name,
  });

  return {
    token,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      employeeCode: employee.employeeCode,
    },
  };
};
