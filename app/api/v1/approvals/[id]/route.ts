import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { getApprovalService } from "@/src/server/services/approvals/get-approval";
import { approvalIdParamsSchema } from "@/src/server/validation/approvals";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const params = approvalIdParamsSchema.parse(await context.params);
    const approval = await getApprovalService(auth.organizationId, params.id);

    if (!approval) {
      return NextResponse.json(
        { error: "Approval request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: approval });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid route params", issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
