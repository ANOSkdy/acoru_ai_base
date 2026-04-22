import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { createRoleService } from "@/src/server/services/roles/create-role";
import { listRolesService } from "@/src/server/services/roles/list-roles";
import { createRoleSchema, listRolesQuerySchema } from "@/src/server/validation/roles";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const query = listRolesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    const items = await listRolesService({ search: query.q, limit: query.limit, offset: query.offset });
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
    const body = createRoleSchema.parse(await request.json());
    const row = await createRoleService({ ...body, organizationId: auth.organizationId, actorUserId: auth.actorUserId });
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
