import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { updateRoleById } from "@/src/server/db/queries/roles";

type UpdateRoleInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  code?: string;
  name?: string;
  description?: string;
};

export async function updateRoleService(input: UpdateRoleInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateRoleById(client, input.id, {
        code: input.code,
        name: input.name,
        description: input.description === undefined
          ? undefined
          : (input.description.trim() ? input.description.trim() : null),
      });

      if (!row) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "role.updated",
        targetType: "role",
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
