import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { updateUserById } from "@/src/server/db/queries/users";
import { replaceUserRoles } from "@/src/server/db/queries/roles";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type UpdateUserInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  orgUnitId?: string | null;
  employeeCode?: string;
  displayName?: string;
  email?: string;
  status?: string;
  roleIds?: string[];
};

export async function updateUserService(input: UpdateUserInput) {
  const normalizeNullableText = (value: string | null | undefined) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateUserById(client, input.organizationId, input.id, {
        orgUnitId: normalizeNullableText(input.orgUnitId),
        employeeCode: normalizeNullableText(input.employeeCode),
        displayName: input.displayName,
        email: input.email,
        status: input.status,
      });

      if (!row) {
        await client.query("rollback");
        return null;
      }

      if (input.roleIds) {
        await replaceUserRoles(
          client,
          input.organizationId,
          input.id,
          Array.from(new Set(input.roleIds)),
          input.actorUserId,
        );
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
