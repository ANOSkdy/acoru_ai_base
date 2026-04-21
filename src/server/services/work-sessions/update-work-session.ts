import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import {
  getWorkSessionById,
  updateWorkSessionById,
} from "@/src/server/db/queries/work-sessions";

type UpdateWorkSessionServiceInput = {
  organizationId: string;
  workSessionId: string;
  actorUserId: string;
  startedAt: string;
  endedAt?: string | null;
  notes?: string | null;
};

export async function updateWorkSessionService(
  input: UpdateWorkSessionServiceInput,
) {
  return withDbClient(async (client) => {
    await client.query("begin");

    try {
      const updated = await updateWorkSessionById(
        client,
        input.organizationId,
        input.workSessionId,
        {
          startedAt: input.startedAt,
          endedAt: input.endedAt,
          notes: input.notes,
        },
      );

      if (!updated) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "work_session.updated",
        targetType: "work_session",
        targetId: input.workSessionId,
        details: {
          startedAt: input.startedAt,
          endedAt: input.endedAt ?? null,
        },
      });

      const workSession = await getWorkSessionById(
        client,
        input.organizationId,
        input.workSessionId,
      );

      await client.query("commit");
      return workSession;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
