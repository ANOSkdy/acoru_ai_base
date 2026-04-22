import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { insertRole } from "@/src/server/db/queries/roles";

type CreateRoleInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  name: string;
  description?: string;
};

export async function createRoleService(input: CreateRoleInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertRole(client, {
        code: input.code,
        name: input.name,
        description: input.description?.trim() ? input.description.trim() : null,
      });

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "role.created",
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
