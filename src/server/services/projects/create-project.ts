import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { insertProject } from "@/src/server/db/queries/projects";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";

type CreateProjectInput = {
  organizationId: string;
  actorUserId: string;
  clientId: string | null;
  code: string;
  name: string;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
};

export async function createProjectService(input: CreateProjectInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertProject(client, {
        organizationId: input.organizationId,
        clientId: input.clientId,
        code: input.code,
        name: input.name,
        status: input.status,
        startsOn: input.startsOn,
        endsOn: input.endsOn,
      });

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "project.created",
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
