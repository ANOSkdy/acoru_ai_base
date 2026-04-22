import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { insertOrganization } from "@/src/server/db/queries/organizations";

type CreateOrganizationInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  name: string;
  status: string;
};

export async function createOrganizationService(input: CreateOrganizationInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertOrganization(client, input);

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "organization.created",
        targetType: "organization",
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
