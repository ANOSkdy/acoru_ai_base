import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  insertAttendanceLog,
  type InsertAttendanceLogInput,
} from "@/src/server/db/queries/attendance";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type CreateAttendanceLogServiceInput = InsertAttendanceLogInput;

export async function createAttendanceLog(
  input: CreateAttendanceLogServiceInput,
) {
  return withDbClient(async (client) => {
    await client.query("begin");

    try {
      const attendanceLog = await insertAttendanceLog(client, input);

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.userId,
        action: "attendance_log.created",
        targetType: "attendance_log",
        targetId: attendanceLog.id,
        details: {
          logType: attendanceLog.log_type,
          occurredAt: attendanceLog.occurred_at,
        },
      });

      await client.query("commit");

      return attendanceLog;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
