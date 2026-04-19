import { NextResponse } from "next/server";

import { getDatabaseConfig } from "@/src/server/db/client";
import { getDatabaseHealth } from "@/src/server/db/queries/health";

export const runtime = "nodejs";

export async function GET() {
  try {
    const health = await getDatabaseHealth();
    const config = getDatabaseConfig();

    return NextResponse.json({
      data: {
        status: "ok",
        checkedAt: health.now,
        database: health.current_database,
        connectionSource: config.source,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: {
          status: "error",
          message: error instanceof Error ? error.message : "Database health check failed",
        },
      },
      { status: 500 },
    );
  }
}
