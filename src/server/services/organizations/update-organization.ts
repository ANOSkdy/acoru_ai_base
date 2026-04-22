import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { updateOrganizationById } from "@/src/server/db/queries/organizations";

type UpdateOrganizationInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  code?: string;
  name?: string;
  status?: string;
};

export async function updateOrganizationService(input: UpdateOrganizationInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateOrganizationById(client, input.id, {
        code: input.code,
        name: input.name,
        status: input.status,
      });

      if (!row) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "organization.updated",
        targetType: "organization",
        targetId: row.id,
        details: { code: row.code, name: row.name, status: row.status },
      });

      await client.query("commit");
      return row;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
