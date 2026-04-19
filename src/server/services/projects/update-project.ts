import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { updateProjectById } from "@/src/server/db/queries/projects";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type UpdateProjectInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  clientId?: string | null;
  code?: string;
  name?: string;
  status?: string;
  startsOn?: string | null;
  endsOn?: string | null;
};

export async function updateProjectService(input: UpdateProjectInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateProjectById(
        client,
        input.organizationId,
        input.id,
        {
          clientId: input.clientId,
          code: input.code,
          name: input.name,
          status: input.status,
          startsOn: input.startsOn,
          endsOn: input.endsOn,
        },
      );

      if (!row) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "project.updated",
        targetType: "project",
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
