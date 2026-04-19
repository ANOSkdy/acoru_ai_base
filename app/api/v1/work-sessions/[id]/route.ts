import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { getWorkSessionService } from "@/src/server/services/work-sessions/get-work-session";
import { workSessionIdParamsSchema } from "@/src/server/validation/work-sessions";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const params = workSessionIdParamsSchema.parse(await context.params);
    const workSession = await getWorkSessionService(auth.organizationId, params.id);

    if (!workSession) {
      return NextResponse.json({ error: "Work session not found" }, { status: 404 });
    }

    return NextResponse.json({ data: workSession });
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
