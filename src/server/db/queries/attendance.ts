import type { PoolClient, QueryResultRow } from "pg";

type AttendanceLogRow = QueryResultRow & {
  id: string;
  organization_id: string;
  user_id: string;
  site_id: string | null;
  log_type: string;
  occurred_at: string;
  source: string;
  work_session_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type InsertAttendanceLogInput = {
  organizationId: string;
  userId: string;
  siteId?: string | null;
  logType: "clock_in" | "clock_out" | "break_start" | "break_end";
  occurredAt: string;
  source: "manual" | "mobile" | "web" | "system";
  workSessionId?: string | null;
  metadata: Record<string, unknown>;
};

export async function insertAttendanceLog(
  client: PoolClient,
  input: InsertAttendanceLogInput,
) {
  const result = await client.query<AttendanceLogRow>(
    `
      insert into attendance_logs (
        organization_id,
        user_id,
        site_id,
        log_type,
        occurred_at,
        source,
        work_session_id,
        metadata
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      returning
        id,
        organization_id,
        user_id,
        site_id,
        log_type,
        occurred_at::text,
        source,
        work_session_id,
        metadata,
        created_at::text
    `,
    [
      input.organizationId,
      input.userId,
      input.siteId ?? null,
      input.logType,
      input.occurredAt,
      input.source,
      input.workSessionId ?? null,
      JSON.stringify(input.metadata),
    ],
  );

  if (input.workSessionId) {
    await client.query(
      `
        insert into work_session_logs (
          work_session_id,
          attendance_log_id,
          event_type,
          created_by
        )
        values ($1, $2, $3, $4)
      `,
      [input.workSessionId, result.rows[0].id, input.logType, input.userId],
    );
  }

  return result.rows[0];
}
