import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { insertClosingPeriod } from "@/src/server/db/queries/closing-periods";

type CreateClosingPeriodInput = {
  organizationId: string;
  actorUserId: string;
  label: string;
  periodStart: string;
  periodEnd: string;
};

export async function createClosingPeriodService(
  input: CreateClosingPeriodInput,
) {
  return withDbClient(async (client) => {
    await client.query("begin");

    try {
      const closingPeriod = await insertClosingPeriod(client, {
        organizationId: input.organizationId,
        label: input.label,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        createdBy: input.actorUserId,
      });

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "closing_period.created",
        targetType: "closing_period",
        targetId: closingPeriod.id,
        details: {
          periodStart: closingPeriod.period_start,
          periodEnd: closingPeriod.period_end,
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
