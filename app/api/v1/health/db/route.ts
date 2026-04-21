import { NextResponse } from "next/server";

import { classifyDatabaseSetupIssue } from "@/src/lib/database-setup";
import {
  getDatabaseConfig,
  getDatabaseConfigStatus,
  getMigrationDatabaseConfigStatus,
} from "@/src/server/db/client";
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
    const issue = classifyDatabaseSetupIssue(error);

    return NextResponse.json(
      {
        data: {
          status: "error",
          code: issue?.code ?? "unknown_error",
          message:
            issue?.summary ??
            (error instanceof Error ? error.message : "Database health check failed"),
          detail: issue?.detail,
          nextSteps: issue?.nextSteps ?? [
            "Check .env.local and verify the runtime database connection settings.",
            "Run pnpm db:migrate if the target database has not been initialized yet.",
          ],
          runtimeConfig: getDatabaseConfigStatus(),
          migrationConfig: getMigrationDatabaseConfigStatus(),
        },
      },
      { status: 500 },
    );
  }
}
