import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { insertOrgUnit } from "@/src/server/db/queries/org-units";

type CreateOrgUnitInput = {
  organizationId: string;
  actorUserId: string;
  parentOrgUnitId?: string;
  code: string;
  name: string;
};

export async function createOrgUnitService(input: CreateOrgUnitInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertOrgUnit(client, {
        organizationId: input.organizationId,
        parentOrgUnitId: input.parentOrgUnitId?.trim() ? input.parentOrgUnitId.trim() : null,
        code: input.code,
        name: input.name,
      });

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "org_unit.created",
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
