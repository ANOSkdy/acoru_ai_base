import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { updateUserById } from "@/src/server/db/queries/users";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type UpdateUserInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  employeeCode?: string;
  displayName?: string;
  email?: string;
  status?: string;
};

export async function updateUserService(input: UpdateUserInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateUserById(client, input.organizationId, input.id, {
        employeeCode: input.employeeCode === undefined
          ? undefined
          : (input.employeeCode.trim() ? input.employeeCode.trim() : null),
        displayName: input.displayName,
        email: input.email,
        status: input.status,
      });

      if (!row) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "user.updated",
        targetType: "user",
        targetId: row.id,
        details: { employeeCode: row.employee_code, displayName: row.display_name, email: row.email },
      });

      await client.query("commit");
      return row;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
