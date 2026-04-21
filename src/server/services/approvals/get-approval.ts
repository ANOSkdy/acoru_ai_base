import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  getApprovalRequestById,
  getWorkSessionApprovalTargetSummary,
  listApprovalStepsByRequestId,
} from "@/src/server/db/queries/approvals";

export async function getApprovalService(organizationId: string, id: string) {
  return withDbClient(async (client) => {
    const approval = await getApprovalRequestById(client, organizationId, id);

    if (!approval) {
      return null;
    }

    const [steps, targetSummary] = await Promise.all([
      listApprovalStepsByRequestId(client, approval.id),
      approval.target_type === "work_session"
        ? getWorkSessionApprovalTargetSummary(
            client,
            organizationId,
            approval.target_id,
          )
        : Promise.resolve(null),
    ]);

    return {
      ...approval,
      steps,
      targetSummary,
    };
  });
}
