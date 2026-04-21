export type DatabaseSetupIssueCode =
  | "missing_env"
  | "missing_schema"
  | "connection_failed";

export type DatabaseSetupIssue = {
  code: DatabaseSetupIssueCode;
  title: string;
  summary: string;
  nextSteps: string[];
  detail: string;
};

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return "Unknown database error";
}

export function classifyDatabaseSetupIssue(
  error: unknown,
): DatabaseSetupIssue | null {
  const detail = extractErrorMessage(error);
  const normalized = detail.toLowerCase();

  if (normalized.includes("missing database connection string")) {
    return {
      code: "missing_env",
      title: "Database environment variables are not configured.",
      summary:
        "The app could not find a server-side database connection string for this page.",
      nextSteps: [
        "Create or update .env.local.",
        "Set DATABASE_URL_DIRECT, DATABASE_URL, or NEON_DATABASE_URL for the app runtime.",
        "If migrations use a different target, verify MIGRATION_DATABASE_URL points at the same database you expect locally.",
        "Restart pnpm dev after changing server-side env values.",
      ],
      detail,
    };
  }

  if (
    /relation\s+"[^"]+"\s+does not exist/i.test(detail) ||
    normalized.includes("undefined table")
  ) {
    return {
      code: "missing_schema",
      title: "The current database is reachable, but the baseline tables are missing.",
      summary:
        "This usually means migrations have not been applied yet, or the app and migration runner are pointed at different databases.",
      nextSteps: [
        "Run pnpm db:migrate.",
        "Verify the app runtime and migration runtime point to the same target database.",
        "Check DATABASE_URL_DIRECT, DATABASE_URL, and MIGRATION_DATABASE_URL for mismatches.",
        "Re-open /api/v1/health/db to confirm the runtime database after migrating.",
      ],
      detail,
    };
  }

  if (
    normalized.includes("password authentication failed") ||
    normalized.includes("database") && normalized.includes("does not exist") ||
    normalized.includes("getaddrinfo") ||
    normalized.includes("enotfound") ||
    normalized.includes("econnrefused") ||
    normalized.includes("etimedout") ||
    normalized.includes("timeout expired") ||
    normalized.includes("connection terminated unexpectedly") ||
    normalized.includes("server closed the connection unexpectedly") ||
    normalized.includes("no pg_hba.conf entry")
  ) {
    return {
      code: "connection_failed",
      title: "The app could not connect to the configured database.",
      summary:
        "The configured database target is unreachable or rejected the connection.",
      nextSteps: [
        "Confirm the database host, database name, username, and password in .env.local.",
        "If you use Neon, verify the branch/database still exists and the URL is current.",
        "Check whether DATABASE_URL_DIRECT, DATABASE_URL, and MIGRATION_DATABASE_URL are pointing at the intended local verification target.",
        "Use /api/v1/health/db after updating env values to confirm the runtime connection source.",
      ],
      detail,
    };
  }

  return null;
}
