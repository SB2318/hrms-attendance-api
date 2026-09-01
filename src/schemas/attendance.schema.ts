import { z } from "zod";

export const attendanceQuerySchema = z.object({
  employeeId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 10)),
});

export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
