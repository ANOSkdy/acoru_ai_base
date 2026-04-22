import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { getUserWithRolesService } from "@/src/server/services/users/get-user";
import { updateUserService } from "@/src/server/services/users/update-user";
import {
  updateUserSchema,
  userIdParamsSchema,
} from "@/src/server/validation/users";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const { id } = userIdParamsSchema.parse(await context.params);

    const row = await getUserWithRolesService(auth.organizationId, id);

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
    const { id } = userIdParamsSchema.parse(await context.params);
    const body = updateUserSchema.parse(await request.json());

    const row = await updateUserService({
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
      id,
      ...body,
      orgUnitId: body.orgUnitId || undefined,
      roleIds: body.roleIds,
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
