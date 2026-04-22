import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { updateOrgUnitById } from "@/src/server/db/queries/org-units";

type UpdateOrgUnitInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  parentOrgUnitId?: string;
  code?: string;
  name?: string;
};

export async function updateOrgUnitService(input: UpdateOrgUnitInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateOrgUnitById(client, input.organizationId, input.id, {
        parentOrgUnitId: input.parentOrgUnitId === undefined
          ? undefined
          : (input.parentOrgUnitId.trim() ? input.parentOrgUnitId.trim() : null),
        code: input.code,
        name: input.name,
      });

      if (!row) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "org_unit.updated",
        targetType: "org_unit",
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
