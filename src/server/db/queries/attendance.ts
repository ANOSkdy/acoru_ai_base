import type { PoolClient, QueryResultRow } from "pg";

export type AttendanceLogRow = QueryResultRow & {
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

export type AttendanceLogListRow = AttendanceLogRow & {
  user_display_name: string;
  user_employee_code: string | null;
  site_name: string | null;
  work_session_status: string | null;
  work_session_session_date: string | null;
};

export type ListAttendanceLogsFilters = {
  organizationId: string;
  search?: string;
  logType?: "clock_in" | "clock_out" | "break_start" | "break_end";
  siteId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
};

export async function listAttendanceLogs(
  client: PoolClient,
  filters: ListAttendanceLogsFilters,
) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["a.organization_id = $1"];

  if (filters.logType) {
    values.push(filters.logType);
    clauses.push(`a.log_type = $${values.length}`);
  }

  if (filters.siteId) {
    values.push(filters.siteId);
    clauses.push(`a.site_id = $${values.length}`);
  }

  if (filters.dateFrom) {
    values.push(filters.dateFrom);
    clauses.push(`a.occurred_at >= $${values.length}::date`);
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);
    clauses.push(`a.occurred_at < ($${values.length}::date + interval '1 day')`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const index = values.length;
    clauses.push(
      `(u.display_name ilike $${index} or coalesce(u.employee_code, '') ilike $${index} or coalesce(s.name, '') ilike $${index})`,
    );
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const result = await client.query<AttendanceLogListRow>(
    `
      select
        a.id,
        a.organization_id,
        a.user_id,
        a.site_id,
        a.log_type,
        a.occurred_at::text,
        a.source,
        a.work_session_id,
        a.metadata,
        a.created_at::text,
        u.display_name as user_display_name,
        u.employee_code as user_employee_code,
        s.name as site_name,
        ws.status as work_session_status,
        ws.session_date::text as work_session_session_date
      from attendance_logs a
      inner join users u on u.id = a.user_id
      left join sites s on s.id = a.site_id
      left join work_sessions ws on ws.id = a.work_session_id
      where ${clauses.join(" and ")}
      order by a.occurred_at desc, a.created_at desc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function getAttendanceLogById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<AttendanceLogListRow>(
    `
      select
        a.id,
        a.organization_id,
        a.user_id,
        a.site_id,
        a.log_type,
        a.occurred_at::text,
        a.source,
        a.work_session_id,
        a.metadata,
        a.created_at::text,
        u.display_name as user_display_name,
        u.employee_code as user_employee_code,
        s.name as site_name,
        ws.status as work_session_status,
        ws.session_date::text as work_session_session_date
      from attendance_logs a
      inner join users u on u.id = a.user_id
      left join sites s on s.id = a.site_id
      left join work_sessions ws on ws.id = a.work_session_id
      where a.organization_id = $1 and a.id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

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
