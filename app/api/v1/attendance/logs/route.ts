import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { createAttendanceLog } from "@/src/server/services/attendance/create-attendance-log";
import { listAttendanceLogsService } from "@/src/server/services/attendance/list-attendance-logs";
import {
  createAttendanceLogSchema,
  listAttendanceLogsQuerySchema,
} from "@/src/server/validation/attendance";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = requireServerAuth(request);
    const query = listAttendanceLogsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    const items = await listAttendanceLogsService({
      organizationId: auth.organizationId,
      search: query.q,
      logType: query.logType,
      siteId: query.siteId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      limit: query.limit,
      offset: query.offset,
    });

    return NextResponse.json({
      data: items,
      meta: {
        limit: query.limit,
        offset: query.offset,
      },
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
    const payload = createAttendanceLogSchema.parse(await request.json());
    const attendanceLog = await createAttendanceLog({
      organizationId: auth.organizationId,
      userId: auth.actorUserId,
      siteId: payload.siteId ?? null,
      logType: payload.logType,
      occurredAt: payload.occurredAt,
      source: payload.source,
      workSessionId: payload.workSessionId ?? null,
      metadata: payload.metadata,
    });

    return NextResponse.json({ data: attendanceLog }, { status: 201 });
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
