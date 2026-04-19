import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { approveWorkSessionById } from "@/src/server/db/queries/work-sessions";

type ApproveWorkSessionInput = {
  organizationId: string;
  workSessionId: string;
  actorUserId: string;
  comment: string | null;
};

export async function approveWorkSessionService(
  input: ApproveWorkSessionInput,
) {
  return withDbClient(async (client) => {
    await client.query("begin");

    try {
      const workSession = await approveWorkSessionById(
        client,
        input.organizationId,
        input.workSessionId,
        input.actorUserId,
        input.comment,
      );

      if (!workSession) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "work_session.approved",
        targetType: "work_session",
        targetId: workSession.id,
        details: {
          comment: input.comment,
        },
      });

      await client.query("commit");
      return workSession;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
