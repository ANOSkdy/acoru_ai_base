import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { updateClientById } from "@/src/server/db/queries/clients";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type UpdateClientInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  code?: string;
  name?: string;
  status?: string;
};

export async function updateClientService(input: UpdateClientInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateClientById(
        client,
        input.organizationId,
        input.id,
        { code: input.code, name: input.name, status: input.status },
      );

      if (!row) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "client.updated",
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
