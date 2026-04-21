import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import {
  getApprovalRequestForUpdate,
  getLastApprovalStep,
  getPendingApprovalStepForUpdate,
  insertApprovalStepDecision,
  setWorkSessionApprovalDecision,
  updateApprovalRequestStatus,
  updateApprovalStepDecision,
} from "@/src/server/db/queries/approvals";

export class ApprovalReviewConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApprovalReviewConflictError";
  }
}

type ReviewApprovalInput = {
  organizationId: string;
  approvalId: string;
  actorUserId: string;
  decision: "approved" | "rejected";
  comment: string | null;
};

export async function reviewApprovalService(input: ReviewApprovalInput) {
  return withDbClient(async (client) => {
    await client.query("begin");

    try {
      const approval = await getApprovalRequestForUpdate(
        client,
        input.organizationId,
        input.approvalId,
      );

      if (!approval) {
        await client.query("rollback");
        return null;
      }

      if (approval.status !== "pending") {
        throw new ApprovalReviewConflictError("Approval request is not pending");
      }

      const pendingStep = await getPendingApprovalStepForUpdate(client, approval.id);

      if (pendingStep) {
        await updateApprovalStepDecision(client, {
          stepId: pendingStep.id,
          actorUserId: input.actorUserId,
          status: input.decision,
          comment: input.comment,
        });
      } else {
        const lastStep = await getLastApprovalStep(client, approval.id);
        await insertApprovalStepDecision(client, {
          approvalRequestId: approval.id,
          stepOrder: (lastStep?.step_order ?? 0) + 1,
          actorUserId: input.actorUserId,
          status: input.decision,
          comment: input.comment,
        });
      }

      const reviewedApproval = await updateApprovalRequestStatus(
        client,
        input.organizationId,
        approval.id,
        input.decision,
      );

      if (!reviewedApproval) {
        await client.query("rollback");
        return null;
      }

      if (reviewedApproval.target_type === "work_session") {
        const target = await setWorkSessionApprovalDecision(client, {
          organizationId: input.organizationId,
          workSessionId: reviewedApproval.target_id,
          actorUserId: input.actorUserId,
          decision: input.decision,
        });

        if (!target) {
          throw new Error("Related work session not found");
        }
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action:
          input.decision === "approved"
            ? "approval_request.approved"
            : "approval_request.rejected",
        targetType: "approval_request",
        targetId: reviewedApproval.id,
        details: {
          comment: input.comment,
          targetType: reviewedApproval.target_type,
          targetId: reviewedApproval.target_id,
        },
      });

      await client.query("commit");
      return reviewedApproval;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
