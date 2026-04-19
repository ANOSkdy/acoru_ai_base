import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { approveWorkSessionService } from "@/src/server/services/work-sessions/approve-work-session";
import {
  approveWorkSessionSchema,
  workSessionIdParamsSchema,
} from "@/src/server/validation/work-sessions";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const params = workSessionIdParamsSchema.parse(await context.params);
    const rawBody = await request.text();
    const payload = approveWorkSessionSchema.parse(
      rawBody ? JSON.parse(rawBody) : {},
    );
    const workSession = await approveWorkSessionService({
      organizationId: auth.organizationId,
      workSessionId: params.id,
      actorUserId: auth.actorUserId,
      comment: payload.comment ?? null,
    });

    if (!workSession) {
      return NextResponse.json({ error: "Work session not found" }, { status: 404 });
    }

    return NextResponse.json({ data: workSession });
  } catch (error) {
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
