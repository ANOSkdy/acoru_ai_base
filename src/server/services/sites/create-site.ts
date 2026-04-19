import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { insertSite } from "@/src/server/db/queries/sites";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type CreateSiteInput = {
  organizationId: string;
  actorUserId: string;
  projectId: string | null;
  code: string;
  name: string;
  timezone: string;
  address: string | null;
  status: string;
};

export async function createSiteService(input: CreateSiteInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertSite(client, {
        organizationId: input.organizationId,
        projectId: input.projectId,
        code: input.code,
        name: input.name,
        timezone: input.timezone,
        address: input.address,
        status: input.status,
      });

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "site.created",
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
