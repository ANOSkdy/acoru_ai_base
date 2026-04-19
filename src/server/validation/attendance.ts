import { z } from "zod";

export const createAttendanceLogSchema = z.object({
  siteId: z.string().uuid().nullable().optional(),
  logType: z.enum(["clock_in", "clock_out", "break_start", "break_end"]),
  occurredAt: z.string().datetime(),
  source: z.enum(["manual", "mobile", "web", "system"]).default("manual"),
  workSessionId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type CreateAttendanceLogInput = z.infer<typeof createAttendanceLogSchema>;
