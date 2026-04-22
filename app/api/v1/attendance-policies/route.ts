import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { createAttendancePolicyService } from "@/src/server/services/attendance-policies/create-attendance-policy";
import { listAttendancePoliciesService } from "@/src/server/services/attendance-policies/list-attendance-policies";
import {
  createAttendancePolicySchema,
  listAttendancePoliciesQuerySchema,
} from "@/src/server/validation/attendance-policies";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const query = listAttendancePoliciesQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    const items = await listAttendancePoliciesService({
      organizationId: auth.organizationId,
      search: query.q,
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
    const body = createAttendancePolicySchema.parse(await request.json());

    const row = await createAttendancePolicyService({
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
      code: body.code,
      name: body.name,
      rules: body.rules,
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
