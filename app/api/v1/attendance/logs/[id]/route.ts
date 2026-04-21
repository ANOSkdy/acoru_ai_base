import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { getAttendanceLogService } from "@/src/server/services/attendance/get-attendance-log";
import { attendanceLogIdParamsSchema } from "@/src/server/validation/attendance";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const params = attendanceLogIdParamsSchema.parse(await context.params);
    const attendanceLog = await getAttendanceLogService(auth.organizationId, params.id);

    if (!attendanceLog) {
      return NextResponse.json({ error: "Attendance log not found" }, { status: 404 });
    }

    return NextResponse.json({ data: attendanceLog });
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
