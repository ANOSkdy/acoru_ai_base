import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { closeClosingPeriodService } from "@/src/server/services/closing-periods/close-closing-period";
import { closingPeriodIdParamsSchema } from "@/src/server/validation/closing-periods";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const params = closingPeriodIdParamsSchema.parse(await context.params);
    const closingPeriod = await closeClosingPeriodService({
      organizationId: auth.organizationId,
      id: params.id,
      actorUserId: auth.actorUserId,
    });

    if (!closingPeriod) {
      return NextResponse.json(
        { error: "Closing period not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: closingPeriod });
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
