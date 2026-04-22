import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { insertUser } from "@/src/server/db/queries/users";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type CreateUserInput = {
  organizationId: string;
  actorUserId: string;
  employeeCode?: string;
  displayName: string;
  email: string;
  status: string;
};

export async function createUserService(input: CreateUserInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertUser(client, {
        organizationId: input.organizationId,
        employeeCode: input.employeeCode?.trim() ? input.employeeCode.trim() : null,
        displayName: input.displayName,
        email: input.email,
        status: input.status,
      });

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "user.created",
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
