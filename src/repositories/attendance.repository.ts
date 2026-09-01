import prisma from "../config/database.js";

const attendanceSelect = {
  id: true,
  date: true,
  punchIn: true,
  punchOut: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      id: true,
      name: true,
      employeeCode: true,
    },
  },
};

/** Get start and end of a calendar day in UTC */
export const getTodayRange = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

export const findTodayAttendance = (employeeId: number) => {
  const { startOfDay, endOfDay } = getTodayRange();
  return prisma.attendance.findFirst({
    where: {
      employeeId,
      date: { gte: startOfDay, lte: endOfDay },
    },
  });
};

export const createPunchIn = (employeeId: number) => {
  const { startOfDay } = getTodayRange();
  const now = new Date();
  return prisma.attendance.create({
    data: {
      employeeId,
      date: startOfDay,
      punchIn: now,
    },
    select: attendanceSelect,
  });
};

export const updatePunchOut = (attendanceId: number) => {
  return prisma.attendance.update({
    where: { id: attendanceId },
    data: { punchOut: new Date() },
    select: attendanceSelect,
  });
};

export const findMyAttendance = (
  employeeId: number,
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string
) => {
  const skip = (page - 1) * limit;
  const dateFilter = buildDateFilter(startDate, endDate);

  return Promise.all([
    prisma.attendance.findMany({
      where: { employeeId, ...dateFilter },
      skip,
      take: limit,
      orderBy: { date: "desc" },
      select: attendanceSelect,
    }),
    prisma.attendance.count({ where: { employeeId, ...dateFilter } }),
  ]);
};

export const findAllAttendance = (
  page: number,
  limit: number,
  employeeId?: number,
  startDate?: string,
  endDate?: string
) => {
  const skip = (page - 1) * limit;
  const dateFilter = buildDateFilter(startDate, endDate);
  const where = {
    ...(employeeId && { employeeId }),
    ...dateFilter,
  };

  return Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      select: attendanceSelect,
    }),
    prisma.attendance.count({ where }),
  ]);
};

const buildDateFilter = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return {};
  return {
    date: {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
    },
  };
};
