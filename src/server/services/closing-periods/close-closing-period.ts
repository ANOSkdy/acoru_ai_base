import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { closeClosingPeriodById } from "@/src/server/db/queries/closing-periods";

type CloseClosingPeriodInput = {
  organizationId: string;
  id: string;
  actorUserId: string;
};

export async function closeClosingPeriodService(
  input: CloseClosingPeriodInput,
) {
  return withDbClient(async (client) => {
    await client.query("begin");

    try {
      const closingPeriod = await closeClosingPeriodById(
        client,
        input.organizationId,
        input.id,
        input.actorUserId,
      );

      if (!closingPeriod) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "closing_period.closed",
        targetType: "closing_period",
        targetId: closingPeriod.id,
        details: {
          label: closingPeriod.label,
        },
      });

      await client.query("commit");
      return closingPeriod;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
