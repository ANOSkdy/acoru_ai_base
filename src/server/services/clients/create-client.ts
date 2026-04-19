import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { insertClient } from "@/src/server/db/queries/clients";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type CreateClientInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  name: string;
  status: string;
};

export async function createClientService(input: CreateClientInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertClient(client, {
        organizationId: input.organizationId,
        code: input.code,
        name: input.name,
        status: input.status,
      });

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "client.created",
        targetType: "client",
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
