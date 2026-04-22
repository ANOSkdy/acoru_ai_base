import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { getOrganizationService } from "@/src/server/services/organizations/get-organization";
import { updateOrganizationService } from "@/src/server/services/organizations/update-organization";
import { organizationIdParamsSchema, updateOrganizationSchema } from "@/src/server/validation/organizations";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = organizationIdParamsSchema.parse(await context.params);
    const row = await getOrganizationService(id);
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
    const { id } = organizationIdParamsSchema.parse(await context.params);
    const body = updateOrganizationSchema.parse(await request.json());
    const row = await updateOrganizationService({ ...body, id, organizationId: auth.organizationId, actorUserId: auth.actorUserId });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
