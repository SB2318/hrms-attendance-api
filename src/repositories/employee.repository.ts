import type { Role } from "@prisma/client";
import prisma from "../config/database.js";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "../schemas/employee.schema.js";

export const findEmployeeByEmail = (email: string) => {
  return prisma.employee.findUnique({ where: { email } });
};

export const findEmployeeById = (id: number) => {
  return prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      employeeCode: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const findEmployeeByCode = (employeeCode: string) => {
  return prisma.employee.findUnique({ where: { employeeCode } });
};

export const findAllEmployees = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return Promise.all([
    prisma.employee.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeCode: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.employee.count(),
  ]);
};

export const createEmployee = (
  data: CreateEmployeeInput & { passwordHash: string }
) => {
  return prisma.employee.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role as Role,
      employeeCode: data.employeeCode,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      employeeCode: true,
      createdAt: true,
    },
  });
};

export const updateEmployee = (
  id: number,
  data: Partial<UpdateEmployeeInput & { passwordHash: string }>
) => {
  return prisma.employee.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.passwordHash && { passwordHash: data.passwordHash }),
      ...(data.role && { role: data.role as Role }),
      ...(data.employeeCode && { employeeCode: data.employeeCode }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      employeeCode: true,
      updatedAt: true,
    },
  });
};

export const deleteEmployee = (id: number) => {
  return prisma.employee.delete({ where: { id } });
};
