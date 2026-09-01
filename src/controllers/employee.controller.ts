import type { Request, Response } from "express";
import * as employeeService from "../services/employee.service.js";
import { sendSuccess } from "../utils/response.js";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "../schemas/employee.schema.js";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  
  const result = await employeeService.getAllEmployees(page, limit);
  sendSuccess(res, "Employees fetched successfully", result);
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const employee = await employeeService.getEmployeeById(id);
  sendSuccess(res, "Employee fetched successfully", employee);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as CreateEmployeeInput;
  const employee = await employeeService.createNewEmployee(data);
  sendSuccess(res, "Employee created successfully", employee, 201);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const data = req.body as UpdateEmployeeInput;
  const employee = await employeeService.updateExistingEmployee(id, data);
  sendSuccess(res, "Employee updated successfully", employee);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await employeeService.removeEmployee(id);
  sendSuccess(res, "Employee deleted successfully");
};
