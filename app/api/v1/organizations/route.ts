import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { createOrganizationService } from "@/src/server/services/organizations/create-organization";
import { listOrganizationsService } from "@/src/server/services/organizations/list-organizations";
import { createOrganizationSchema, listOrganizationsQuerySchema } from "@/src/server/validation/organizations";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const query = listOrganizationsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    const items = await listOrganizationsService({ search: query.q, status: query.status, limit: query.limit, offset: query.offset });
    return NextResponse.json({ data: items, meta: { limit: query.limit, offset: query.offset } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid query string", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const body = createOrganizationSchema.parse(await request.json());
    const row = await createOrganizationService({ ...body, organizationId: auth.organizationId, actorUserId: auth.actorUserId });
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
