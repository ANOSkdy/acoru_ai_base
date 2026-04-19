import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { listSitesService } from "@/src/server/services/sites/list-sites";
import { createSiteService } from "@/src/server/services/sites/create-site";
import {
  listSitesQuerySchema,
  createSiteSchema,
} from "@/src/server/validation/sites";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const query = listSitesQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    const items = await listSitesService({
      organizationId: auth.organizationId,
      search: query.q,
      status: query.status,
      projectId: query.projectId,
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
    const body = createSiteSchema.parse(await request.json());

    const row = await createSiteService({
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
      projectId: body.projectId ?? null,
      code: body.code,
      name: body.name,
      timezone: body.timezone,
      address: body.address ?? null,
      status: body.status,
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
