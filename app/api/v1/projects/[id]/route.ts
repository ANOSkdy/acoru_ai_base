import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { getProjectService } from "@/src/server/services/projects/get-project";
import { updateProjectService } from "@/src/server/services/projects/update-project";
import {
  projectIdParamsSchema,
  updateProjectSchema,
} from "@/src/server/validation/projects";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const { id } = projectIdParamsSchema.parse(await context.params);

    const row = await getProjectService(auth.organizationId, id);

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: row });
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const { id } = projectIdParamsSchema.parse(await context.params);
    const body = updateProjectSchema.parse(await request.json());

    const row = await updateProjectService({
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
      id,
      ...body,
    });

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: row });
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
