import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { listApprovalsService } from "@/src/server/services/approvals/list-approvals";
import { listApprovalsQuerySchema } from "@/src/server/validation/approvals";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const query = listApprovalsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    const items = await listApprovalsService({
      organizationId: auth.organizationId,
      status: query.status,
      targetType: query.targetType,
      requester: query.requester,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      limit: query.limit,
      offset: query.offset,
    });

    return NextResponse.json({
      data: items,
      meta: {
        limit: query.limit,
        offset: query.offset,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query string", issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
