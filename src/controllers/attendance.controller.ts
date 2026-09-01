import type { Response } from "express";
import type { AuthRequest } from "../types/auth.type.js";
import * as attendanceService from "../services/attendance.service.js";
import { sendSuccess } from "../utils/response.js";
import type { AttendanceQueryInput } from "../schemas/attendance.schema.js";

export const punchIn = async (req: AuthRequest, res: Response): Promise<void> => {
  const employeeId = req.user!.userId;
  const record = await attendanceService.punchIn(employeeId);
  sendSuccess(res, "Punched in successfully", record, 201);
};

export const punchOut = async (req: AuthRequest, res: Response): Promise<void> => {
  const employeeId = req.user!.userId;
  const record = await attendanceService.punchOut(employeeId);
  sendSuccess(res, "Punched out successfully", record);
};

export const getMyAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const employeeId = req.user!.userId;
  const query = (req as AuthRequest & { parsedQuery: AttendanceQueryInput }).parsedQuery;
  const result = await attendanceService.getMyAttendance(employeeId, query);
  sendSuccess(res, "Attendance history fetched successfully", result);
};

export const getReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const query = (req as AuthRequest & { parsedQuery: AttendanceQueryInput }).parsedQuery;
  const result = await attendanceService.getAttendanceReport(query);
  sendSuccess(res, "Attendance report fetched successfully", result);
};
