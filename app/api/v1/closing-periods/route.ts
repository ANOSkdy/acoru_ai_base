import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { createClosingPeriodService } from "@/src/server/services/closing-periods/create-closing-period";
import { createClosingPeriodSchema } from "@/src/server/validation/closing-periods";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const payload = createClosingPeriodSchema.parse(await request.json());
    const closingPeriod = await createClosingPeriodService({
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
      label: payload.label,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
    });

    return NextResponse.json({ data: closingPeriod }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
