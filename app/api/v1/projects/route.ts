import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { listProjectsService } from "@/src/server/services/projects/list-projects";
import { createProjectService } from "@/src/server/services/projects/create-project";
import {
  listProjectsQuerySchema,
  createProjectSchema,
} from "@/src/server/validation/projects";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const query = listProjectsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    const items = await listProjectsService({
      organizationId: auth.organizationId,
      search: query.q,
      status: query.status,
      clientId: query.clientId,
      limit: query.limit,
      offset: query.offset,
    });

    return NextResponse.json({
      data: items,
      meta: { limit: query.limit, offset: query.offset },
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

export async function POST(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const body = createProjectSchema.parse(await request.json());

    const row = await createProjectService({
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
      clientId: body.clientId ?? null,
      code: body.code,
      name: body.name,
      status: body.status,
      startsOn: body.startsOn ?? null,
      endsOn: body.endsOn ?? null,
    });

    return NextResponse.json({ data: row }, { status: 201 });
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
