import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { getOrgUnitService } from "@/src/server/services/org-units/get-org-unit";
import { updateOrgUnitService } from "@/src/server/services/org-units/update-org-unit";
import { orgUnitIdParamsSchema, updateOrgUnitSchema } from "@/src/server/validation/org-units";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const { id } = orgUnitIdParamsSchema.parse(await context.params);
    const row = await getOrgUnitService(auth.organizationId, id);
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
    const { id } = orgUnitIdParamsSchema.parse(await context.params);
    const body = updateOrgUnitSchema.parse(await request.json());
    const row = await updateOrgUnitService({
      id,
      code: body.code,
      name: body.name,
      parentOrgUnitId: body.parentOrgUnitId || undefined,
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
    });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
