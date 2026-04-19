import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { updateSiteById } from "@/src/server/db/queries/sites";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type UpdateSiteInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  projectId?: string | null;
  code?: string;
  name?: string;
  timezone?: string;
  address?: string | null;
  status?: string;
};

export async function updateSiteService(input: UpdateSiteInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateSiteById(
        client,
        input.organizationId,
        input.id,
        {
          projectId: input.projectId,
          code: input.code,
          name: input.name,
          timezone: input.timezone,
          address: input.address,
          status: input.status,
        },
      );

      if (!row) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "site.updated",
        targetType: "site",
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
