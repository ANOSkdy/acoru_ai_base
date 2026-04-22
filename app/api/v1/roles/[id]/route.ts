import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { getRoleService } from "@/src/server/services/roles/get-role";
import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { updateRoleService } from "@/src/server/services/roles/update-role";
import { roleIdParamsSchema, updateRoleSchema } from "@/src/server/validation/roles";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = roleIdParamsSchema.parse(await context.params);
    const row = await getRoleService(id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid route params", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const { id } = roleIdParamsSchema.parse(await context.params);
    const body = updateRoleSchema.parse(await request.json());
    const row = await updateRoleService({ ...body, id, organizationId: auth.organizationId, actorUserId: auth.actorUserId });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
