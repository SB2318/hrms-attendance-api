import { AppError } from "../middleware/error.middleware.js";
import * as attendanceRepo from "../repositories/attendance.repository.js";
import type { AttendanceQueryInput } from "../schemas/attendance.schema.js";

export const punchIn = async (employeeId: number) => {
  // Check if already punched in today
  const todayRecord = await attendanceRepo.findTodayAttendance(employeeId);

  if (todayRecord) {
    if (todayRecord.punchIn) {
      throw new AppError("You have already punched in for today", 400);
    }
  }

  return attendanceRepo.createPunchIn(employeeId);
};

export const punchOut = async (employeeId: number) => {
  const todayRecord = await attendanceRepo.findTodayAttendance(employeeId);

  if (!todayRecord) {
    throw new AppError("No punch-in record found for today. Please punch in first.", 400);
  }

  if (!todayRecord.punchIn) {
    throw new AppError("You have not punched in yet today.", 400);
  }

  if (todayRecord.punchOut) {
    throw new AppError("You have already punched out for today.", 400);
  }

  return attendanceRepo.updatePunchOut(todayRecord.id);
};

export const getMyAttendance = async (employeeId: number, query: AttendanceQueryInput) => {
  const { page, limit, startDate, endDate } = query;
  const [records, total] = await attendanceRepo.findMyAttendance(
    employeeId,
    page,
    limit,
    startDate,
    endDate
  );

  return {
    attendance: records.map(addWorkingHours),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getAttendanceReport = async (query: AttendanceQueryInput) => {
  const { page, limit, employeeId, startDate, endDate } = query;
  const [records, total] = await attendanceRepo.findAllAttendance(
    page,
    limit,
    employeeId,
    startDate,
    endDate
  );

  return {
    attendance: records.map(addWorkingHours),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

/** Calculate total working hours from punchIn and punchOut */
const addWorkingHours = (record: {
  punchIn: Date | null;
  punchOut: Date | null;
  [key: string]: unknown;
}) => {
  let workingHours: string | null = null;

  if (record.punchIn && record.punchOut) {
    const diffMs = record.punchOut.getTime() - record.punchIn.getTime();
    const totalMinutes = Math.floor(diffMs / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    workingHours = `${hours}h ${minutes}m`;
  }

  return { ...record, workingHours };
};
