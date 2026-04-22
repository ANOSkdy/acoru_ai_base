import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { updateAttendancePolicyById } from "@/src/server/db/queries/attendance-policies";

type UpdateAttendancePolicyInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  code?: string;
  name?: string;
  rules?: Record<string, unknown>;
};

export async function updateAttendancePolicyService(input: UpdateAttendancePolicyInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateAttendancePolicyById(client, input.organizationId, input.id, {
        code: input.code,
        name: input.name,
        rules: input.rules,
      });

      if (!row) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "attendance_policy.updated",
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
