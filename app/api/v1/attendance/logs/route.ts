import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { createAttendanceLog } from "@/src/server/services/attendance/create-attendance-log";
import { createAttendanceLogSchema } from "@/src/server/validation/attendance";

export const runtime = "nodejs";

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
