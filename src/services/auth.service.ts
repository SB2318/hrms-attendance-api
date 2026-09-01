import { AppError } from "../middleware/error.middleware.js";
import { findEmployeeByEmail } from "../repositories/employee.repository.js";
import { comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import type { LoginInput } from "../schemas/auth.schema.js";

export const loginEmployee = async (body: LoginInput) => {
  const emp = await findEmployeeByEmail(body.email);
  if (!emp) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await comparePassword(body.password, emp.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({
    userId: emp.id,
    email: emp.email,
    role: emp.role,
    employeeCode: emp.employeeCode,
    name: emp.name,
  });

  return {
    token,
    employee: {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      employeeCode: emp.employeeCode,
    },
  };
};
