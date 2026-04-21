import { z } from "zod";

export const attendanceLogIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listAttendanceLogsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  logType: z.enum(["clock_in", "clock_out", "break_start", "break_end"]).optional(),
  siteId: z.string().uuid().optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
}).refine(
  (value) => {
    if (!value.dateFrom || !value.dateTo) {
      return true;
    }

    return value.dateFrom <= value.dateTo;
  },
  {
    message: "日付範囲が不正です",
    path: ["dateTo"],
  },
);

export const createAttendanceLogSchema = z.object({
  siteId: z.string().uuid().nullable().optional(),
  logType: z.enum(["clock_in", "clock_out", "break_start", "break_end"]),
  occurredAt: z.string().datetime(),
  source: z.enum(["manual", "mobile", "web", "system"]).default("manual"),
  workSessionId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type CreateAttendanceLogInput = z.infer<typeof createAttendanceLogSchema>;
