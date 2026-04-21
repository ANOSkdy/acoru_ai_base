import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import {
  ApprovalReviewConflictError,
  reviewApprovalService,
} from "@/src/server/services/approvals/review-approval";
import {
  approvalIdParamsSchema,
  reviewApprovalSchema,
} from "@/src/server/validation/approvals";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const params = approvalIdParamsSchema.parse(await context.params);
    const rawBody = await request.text();
    const payload = reviewApprovalSchema.parse(rawBody ? JSON.parse(rawBody) : {});
    const approval = await reviewApprovalService({
      organizationId: auth.organizationId,
      approvalId: params.id,
      actorUserId: auth.actorUserId,
      decision: "rejected",
      comment: payload.comment ?? null,
    });

    if (!approval) {
      return NextResponse.json(
        { error: "Approval request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: approval });
  } catch (error) {
    if (error instanceof ApprovalReviewConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request", issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
