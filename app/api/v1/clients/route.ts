import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { listClientsService } from "@/src/server/services/clients/list-clients";
import { createClientService } from "@/src/server/services/clients/create-client";
import {
  listClientsQuerySchema,
  createClientSchema,
} from "@/src/server/validation/clients";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const query = listClientsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    const items = await listClientsService({
      organizationId: auth.organizationId,
      search: query.q,
      status: query.status,
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
    const body = createClientSchema.parse(await request.json());

    const row = await createClientService({
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
      code: body.code,
      name: body.name,
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
