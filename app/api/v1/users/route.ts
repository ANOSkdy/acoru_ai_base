import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { createUserService } from "@/src/server/services/users/create-user";
import { listUsersForMasterService } from "@/src/server/services/users/list-users";
import {
  createUserSchema,
  listUsersQuerySchema,
} from "@/src/server/validation/users";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const query = listUsersQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    const items = await listUsersForMasterService({
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
    const body = createUserSchema.parse(await request.json());

    const row = await createUserService({
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
      employeeCode: body.employeeCode,
      displayName: body.displayName,
      email: body.email,
      status: body.status,
      orgUnitId: body.orgUnitId || undefined,
      roleIds: body.roleIds,
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
