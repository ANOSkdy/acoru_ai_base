import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { insertAttendancePolicy } from "@/src/server/db/queries/attendance-policies";

type CreateAttendancePolicyInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  name: string;
  rules: Record<string, unknown>;
};

export async function createAttendancePolicyService(input: CreateAttendancePolicyInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertAttendancePolicy(client, {
        organizationId: input.organizationId,
        code: input.code,
        name: input.name,
        rules: input.rules,
      });

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "attendance_policy.created",
        targetType: "attendance_policy",
        targetId: row.id,
        details: { code: row.code, name: row.name },
      });

      await client.query("commit");
      return row;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
