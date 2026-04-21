import type { PoolClient, QueryResultRow } from "pg";

export type ListWorkSessionsFilters = {
  organizationId: string;
  status?: string;
  userId?: string;
  siteId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
};

export type WorkSessionListRow = QueryResultRow & {
  id: string;
  organization_id: string;
  session_date: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  notes: string | null;
  user_id: string;
  project_id: string | null;
  site_id: string | null;
  work_category_id: string | null;
  approved_at: string | null;
  approved_by: string | null;
  user_display_name: string;
  project_name: string | null;
  site_name: string | null;
  approved_by_name: string | null;
};

export async function listWorkSessions(
  client: PoolClient,
  filters: ListWorkSessionsFilters,
) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["ws.organization_id = $1"];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`ws.status = $${values.length}`);
  }

  if (filters.userId) {
    values.push(filters.userId);
    clauses.push(`ws.user_id = $${values.length}`);
  }

  if (filters.siteId) {
    values.push(filters.siteId);
    clauses.push(`ws.site_id = $${values.length}`);
  }

  if (filters.dateFrom) {
    values.push(filters.dateFrom);
    clauses.push(`ws.session_date >= $${values.length}::date`);
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);
    clauses.push(`ws.session_date <= $${values.length}::date`);
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const result = await client.query<WorkSessionListRow>(
    `
      select
        ws.id,
        ws.organization_id,
        ws.session_date::text,
        ws.started_at::text,
        ws.ended_at::text,
        ws.status,
        ws.notes,
        ws.user_id,
        ws.project_id,
        ws.site_id,
        ws.work_category_id,
        ws.approved_at::text,
        ws.approved_by,
        u.display_name as user_display_name,
        p.name as project_name,
        s.name as site_name,
        au.display_name as approved_by_name
      from work_sessions ws
      inner join users u on u.id = ws.user_id
      left join projects p on p.id = ws.project_id
      left join sites s on s.id = ws.site_id
      left join users au on au.id = ws.approved_by
      where ${clauses.join(" and ")}
      order by ws.session_date desc, ws.started_at desc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export type WorkSessionDetailRow = QueryResultRow & {
  id: string;
  organization_id: string;
  user_id: string;
  project_id: string | null;
  site_id: string | null;
  work_category_id: string | null;
  session_date: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  notes: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  user_display_name: string;
  user_employee_code: string | null;
  project_name: string | null;
  site_name: string | null;
  work_category_name: string | null;
  approved_by_name: string | null;
};

export async function getWorkSessionById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<WorkSessionDetailRow>(
    `
      select
        ws.id,
        ws.organization_id,
        ws.user_id,
        ws.project_id,
        ws.site_id,
        ws.work_category_id,
        ws.session_date::text,
        ws.started_at::text,
        ws.ended_at::text,
        ws.status,
        ws.notes,
        ws.approved_at::text,
        ws.approved_by,
        ws.created_at::text,
        ws.updated_at::text,
        u.display_name as user_display_name,
        u.employee_code as user_employee_code,
        p.name as project_name,
        s.name as site_name,
        wc.name as work_category_name,
        au.display_name as approved_by_name
      from work_sessions ws
      inner join users u on u.id = ws.user_id
      left join projects p on p.id = ws.project_id
      left join sites s on s.id = ws.site_id
      left join work_categories wc on wc.id = ws.work_category_id
      left join users au on au.id = ws.approved_by
      where ws.organization_id = $1 and ws.id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export type WorkSessionAttendanceLogRow = QueryResultRow & {
  id: string;
  attendance_log_id: string | null;
  event_type: string;
  created_at: string;
  occurred_at: string | null;
  log_type: string | null;
  source: string | null;
  user_id: string | null;
  user_display_name: string | null;
  site_name: string | null;
};

export async function listWorkSessionAttendanceLogs(
  client: PoolClient,
  organizationId: string,
  workSessionId: string,
) {
  const result = await client.query<WorkSessionAttendanceLogRow>(
    `
      select
        wsl.id,
        wsl.attendance_log_id,
        wsl.event_type,
        wsl.created_at::text,
        al.occurred_at::text,
        al.log_type,
        al.source,
        al.user_id,
        u.display_name as user_display_name,
        s.name as site_name
      from work_session_logs wsl
      inner join work_sessions ws on ws.id = wsl.work_session_id
      left join attendance_logs al on al.id = wsl.attendance_log_id
      left join users u on u.id = al.user_id
      left join sites s on s.id = al.site_id
      where ws.organization_id = $1 and wsl.work_session_id = $2
      order by coalesce(al.occurred_at, wsl.created_at) asc
    `,
    [organizationId, workSessionId],
  );

  return result.rows;
}

export type WorkEntryRow = QueryResultRow & {
  id: string;
  work_session_id: string;
  entry_date: string;
  minutes_worked: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listWorkEntriesBySessionId(
  client: PoolClient,
  organizationId: string,
  workSessionId: string,
) {
  const result = await client.query<WorkEntryRow>(
    `
      select
        we.id,
        we.work_session_id,
        we.entry_date::text,
        we.minutes_worked,
        we.notes,
        we.created_at::text,
        we.updated_at::text
      from work_entries we
      inner join work_sessions ws on ws.id = we.work_session_id
      where ws.organization_id = $1 and we.work_session_id = $2
      order by we.entry_date asc, we.created_at asc
    `,
    [organizationId, workSessionId],
  );

  return result.rows;
}

export type WorkSessionApprovalSummaryRow = QueryResultRow & {
  request_id: string;
  request_status: string;
  requested_by: string | null;
  requested_by_name: string | null;
  reviewed_at: string | null;
  reviewer_user_id: string | null;
  reviewer_name: string | null;
  comment: string | null;
};

export async function getWorkSessionApprovalSummary(
  client: PoolClient,
  organizationId: string,
  workSessionId: string,
) {
  const result = await client.query<WorkSessionApprovalSummaryRow>(
    `
      select
        ar.id as request_id,
        ar.status as request_status,
        ar.requested_by,
        ru.display_name as requested_by_name,
        ast.reviewed_at::text,
        ast.reviewer_user_id,
        rv.display_name as reviewer_name,
        ast.comment
      from approval_requests ar
      left join users ru on ru.id = ar.requested_by
      left join lateral (
        select
          aps.reviewed_at,
          aps.reviewer_user_id,
          aps.comment
        from approval_steps aps
        where aps.approval_request_id = ar.id
        order by aps.step_order desc
        limit 1
      ) ast on true
      left join users rv on rv.id = ast.reviewer_user_id
      where ar.organization_id = $1
        and ar.target_type = 'work_session'
        and ar.target_id = $2
      limit 1
    `,
    [organizationId, workSessionId],
  );

  return result.rows[0] ?? null;
}

type ApprovalResultRow = QueryResultRow & {
  id: string;
  status: string;
  approved_at: string | null;
  approved_by: string | null;
};

export async function approveWorkSessionById(
  client: PoolClient,
  organizationId: string,
  id: string,
  actorUserId: string,
  comment: string | null,
) {
  const approvalRequestResult = await client.query<{ id: string }>(
    `
      insert into approval_requests (
        organization_id,
        target_type,
        target_id,
        status,
        requested_by
      )
      values ($1, 'work_session', $2, 'approved', $3)
      on conflict (organization_id, target_type, target_id)
      do update set
        status = 'approved',
        updated_at = now()
      returning id
    `,
    [organizationId, id, actorUserId],
  );

  await client.query(
    `
      insert into approval_steps (
        approval_request_id,
        step_order,
        reviewer_user_id,
        status,
        reviewed_at,
        comment
      )
      values ($1, 1, $2, 'approved', now(), $3)
      on conflict (approval_request_id, step_order)
      do update set
        reviewer_user_id = excluded.reviewer_user_id,
        status = excluded.status,
        reviewed_at = excluded.reviewed_at,
        comment = excluded.comment
    `,
    [approvalRequestResult.rows[0].id, actorUserId, comment],
  );

  const result = await client.query<ApprovalResultRow>(
    `
      update work_sessions
      set
        status = 'approved',
        approved_at = now(),
        approved_by = $3,
        updated_at = now()
      where organization_id = $1 and id = $2
      returning id, status, approved_at::text, approved_by
    `,
    [organizationId, id, actorUserId],
  );

  return result.rows[0] ?? null;
}

export type UpdateWorkSessionInput = {
  startedAt: string;
  endedAt?: string | null;
  notes?: string | null;
};

type UpdateWorkSessionResultRow = QueryResultRow & {
  id: string;
};

export async function updateWorkSessionById(
  client: PoolClient,
  organizationId: string,
  id: string,
  input: UpdateWorkSessionInput,
) {
  const sets: string[] = ["updated_at = now()"];
  const values: unknown[] = [organizationId, id];

  values.push(input.startedAt);
  const startedAtIndex = values.length;
  sets.push(`started_at = $${startedAtIndex}`);
  sets.push(`session_date = ($${startedAtIndex}::timestamptz at time zone 'Asia/Tokyo')::date`);

  if ("endedAt" in input) {
    values.push(input.endedAt ?? null);
    sets.push(`ended_at = $${values.length}`);
  }

  if ("notes" in input) {
    values.push(input.notes ?? null);
    sets.push(`notes = $${values.length}`);
  }

  const result = await client.query<UpdateWorkSessionResultRow>(
    `
      update work_sessions
      set ${sets.join(", ")}
      where organization_id = $1 and id = $2 and status <> 'approved'
      returning id
    `,
    values,
  );

  return result.rows[0] ?? null;
}
