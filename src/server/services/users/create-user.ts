import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { insertUser } from "@/src/server/db/queries/users";
import { replaceUserRoles } from "@/src/server/db/queries/roles";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type CreateUserInput = {
  organizationId: string;
  actorUserId: string;
  orgUnitId?: string | null;
  employeeCode?: string;
  displayName: string;
  email: string;
  status: string;
  roleIds?: string[];
};

export async function createUserService(input: CreateUserInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertUser(client, {
        organizationId: input.organizationId,
        orgUnitId: input.orgUnitId?.trim() ? input.orgUnitId.trim() : null,
        employeeCode: input.employeeCode?.trim() ? input.employeeCode.trim() : null,
        displayName: input.displayName,
        email: input.email,
        status: input.status,
      });

      if (input.roleIds) {
        await replaceUserRoles(
          client,
          input.organizationId,
          row.id,
          Array.from(new Set(input.roleIds)),
          input.actorUserId,
        );
      }

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
