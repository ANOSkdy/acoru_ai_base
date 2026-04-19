import type { PoolClient, QueryResultRow } from "pg";

export type ListWorkSessionsFilters = {
  organizationId: string;
  status?: string;
  userId?: string;
  limit: number;
  offset: number;
};

type WorkSessionListRow = QueryResultRow & {
  id: string;
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
};

export async function listWorkSessions(
  client: PoolClient,
  filters: ListWorkSessionsFilters,
) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["organization_id = $1"];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }

  if (filters.userId) {
    values.push(filters.userId);
    clauses.push(`user_id = $${values.length}`);
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const result = await client.query<WorkSessionListRow>(
    `
      select
        id,
        session_date::text,
        started_at::text,
        ended_at::text,
        status,
        notes,
        user_id,
        project_id,
        site_id,
        work_category_id,
        approved_at::text,
        approved_by
      from work_sessions
      where ${clauses.join(" and ")}
      order by session_date desc, started_at desc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

type WorkSessionDetailRow = QueryResultRow & {
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
};

export async function getWorkSessionById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<WorkSessionDetailRow>(
    `
      select
        id,
        organization_id,
        user_id,
        project_id,
        site_id,
        work_category_id,
        session_date::text,
        started_at::text,
        ended_at::text,
        status,
        notes,
        approved_at::text,
        approved_by,
        created_at::text,
        updated_at::text
      from work_sessions
      where organization_id = $1 and id = $2
      limit 1
    `,
    [organizationId, id],
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
