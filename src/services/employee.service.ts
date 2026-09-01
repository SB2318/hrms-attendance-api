import { AppError } from "../middleware/error.middleware.js";
import * as employeeRepo from "../repositories/employee.repository.js";
import { hashPassword } from "../utils/password.js";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "../schemas/employee.schema.js";

export const getAllEmployees = async (page: number, limit: number) => {
  const [employees, total] = await employeeRepo.findAllEmployees(page, limit);
  return {
    employees,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getEmployeeById = async (id: number) => {
  const employee = await employeeRepo.findEmployeeById(id);
  if (!employee) {
    throw new AppError(`Employee with ID ${id} not found`, 404);
  }
  return employee;
};

export const createNewEmployee = async (data: CreateEmployeeInput) => {
  // Check for duplicate email
  const existingEmail = await employeeRepo.findEmployeeByEmail(data.email);
  if (existingEmail) {
    throw new AppError("An employee with this email already exists", 409);
  }

  // Check for duplicate employee code
  const existingCode = await employeeRepo.findEmployeeByCode(data.employeeCode);
  if (existingCode) {
    throw new AppError("An employee with this employee code already exists", 409);
  }

  const passwordHash = await hashPassword(data.password);
  return employeeRepo.createEmployee({ ...data, passwordHash });
};

export const updateExistingEmployee = async (id: number, data: UpdateEmployeeInput) => {
  // Make sure employee exists
  const existing = await employeeRepo.findEmployeeById(id);
  if (!existing) {
    throw new AppError(`Employee with ID ${id} not found`, 404);
  }

  // Check for duplicate email if email is being changed
  if (data.email && data.email !== existing.email) {
    const taken = await employeeRepo.findEmployeeByEmail(data.email);
    if (taken) {
      throw new AppError("This email is already taken by another employee", 409);
    }
  }

  // Check for duplicate employee code if code is being changed
  if (data.employeeCode && data.employeeCode !== existing.employeeCode) {
    const taken = await employeeRepo.findEmployeeByCode(data.employeeCode);
    if (taken) {
      throw new AppError("This employee code is already taken", 409);
    }
  }

  const updateData: Parameters<typeof employeeRepo.updateEmployee>[1] = { ...data };
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
    delete updateData.password;
  }

  return employeeRepo.updateEmployee(id, updateData);
};

export const removeEmployee = async (id: number) => {
  const existing = await employeeRepo.findEmployeeById(id);
  if (!existing) {
    throw new AppError(`Employee with ID ${id} not found`, 404);
  }
  await employeeRepo.deleteEmployee(id);
};
