import type { PoolClient, QueryResultRow } from "pg";

export type ListApprovalRequestsFilters = {
  organizationId: string;
  status?: string;
  targetType?: string;
  requester?: string;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
};

export type ApprovalRequestListRow = QueryResultRow & {
  id: string;
  organization_id: string;
  target_type: string;
  target_id: string;
  status: string;
  requested_by: string | null;
  created_at: string;
  updated_at: string;
  requester_name: string | null;
  current_approver_id: string | null;
  current_approver_name: string | null;
  target_summary: string;
};

export async function listApprovalRequests(
  client: PoolClient,
  filters: ListApprovalRequestsFilters,
) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["ar.organization_id = $1"];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`ar.status = $${values.length}`);
  }

  if (filters.targetType) {
    values.push(filters.targetType);
    clauses.push(`ar.target_type = $${values.length}`);
  }

  if (filters.requester) {
    values.push(filters.requester);
    clauses.push(`ar.requested_by = $${values.length}`);
  }

  if (filters.dateFrom) {
    values.push(filters.dateFrom);
    clauses.push(`ar.created_at::date >= $${values.length}::date`);
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);
    clauses.push(`ar.created_at::date <= $${values.length}::date`);
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const result = await client.query<ApprovalRequestListRow>(
    `
      select
        ar.id,
        ar.organization_id,
        ar.target_type,
        ar.target_id,
        ar.status,
        ar.requested_by,
        ar.created_at::text,
        ar.updated_at::text,
        ru.display_name as requester_name,
        coalesce(ps.reviewer_user_id, ls.reviewer_user_id) as current_approver_id,
        coalesce(pu.display_name, lu.display_name) as current_approver_name,
        case
          when ar.target_type = 'work_session' then concat_ws(
            ' / ',
            wsu.display_name,
            ws.session_date::text,
            coalesce(s.name, p.name, '対象未設定')
          )
          else ar.target_id::text
        end as target_summary
      from approval_requests ar
      left join users ru on ru.id = ar.requested_by
      left join lateral (
        select
          aps.reviewer_user_id,
          aps.step_order
        from approval_steps aps
        where aps.approval_request_id = ar.id
          and aps.status = 'pending'
        order by aps.step_order asc
        limit 1
      ) ps on true
      left join users pu on pu.id = ps.reviewer_user_id
      left join lateral (
        select
          aps.reviewer_user_id,
          aps.step_order
        from approval_steps aps
        where aps.approval_request_id = ar.id
        order by aps.step_order desc
        limit 1
      ) ls on true
      left join users lu on lu.id = ls.reviewer_user_id
      left join work_sessions ws
        on ar.target_type = 'work_session'
        and ws.id = ar.target_id
        and ws.organization_id = ar.organization_id
      left join users wsu on wsu.id = ws.user_id
      left join projects p on p.id = ws.project_id
      left join sites s on s.id = ws.site_id
      where ${clauses.join(" and ")}
      order by ar.created_at desc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export type ApprovalRequestDetailRow = QueryResultRow & {
  id: string;
  organization_id: string;
  target_type: string;
  target_id: string;
  status: string;
  requested_by: string | null;
  created_at: string;
  updated_at: string;
  requester_name: string | null;
  requester_employee_code: string | null;
  current_approver_id: string | null;
  current_approver_name: string | null;
};

export async function getApprovalRequestById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<ApprovalRequestDetailRow>(
    `
      select
        ar.id,
        ar.organization_id,
        ar.target_type,
        ar.target_id,
        ar.status,
        ar.requested_by,
        ar.created_at::text,
        ar.updated_at::text,
        ru.display_name as requester_name,
        ru.employee_code as requester_employee_code,
        coalesce(ps.reviewer_user_id, ls.reviewer_user_id) as current_approver_id,
        coalesce(pu.display_name, lu.display_name) as current_approver_name
      from approval_requests ar
      left join users ru on ru.id = ar.requested_by
      left join lateral (
        select
          aps.reviewer_user_id,
          aps.step_order
        from approval_steps aps
        where aps.approval_request_id = ar.id
          and aps.status = 'pending'
        order by aps.step_order asc
        limit 1
      ) ps on true
      left join users pu on pu.id = ps.reviewer_user_id
      left join lateral (
        select
          aps.reviewer_user_id,
          aps.step_order
        from approval_steps aps
        where aps.approval_request_id = ar.id
        order by aps.step_order desc
        limit 1
      ) ls on true
      left join users lu on lu.id = ls.reviewer_user_id
      where ar.organization_id = $1 and ar.id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export type ApprovalStepRow = QueryResultRow & {
  id: string;
  approval_request_id: string;
  step_order: number;
  reviewer_user_id: string | null;
  reviewer_name: string | null;
  status: string;
  reviewed_at: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export async function listApprovalStepsByRequestId(
  client: PoolClient,
  approvalRequestId: string,
) {
  const result = await client.query<ApprovalStepRow>(
    `
      select
        aps.id,
        aps.approval_request_id,
        aps.step_order,
        aps.reviewer_user_id,
        u.display_name as reviewer_name,
        aps.status,
        aps.reviewed_at::text,
        aps.comment,
        aps.created_at::text,
        aps.updated_at::text
      from approval_steps aps
      left join users u on u.id = aps.reviewer_user_id
      where aps.approval_request_id = $1
      order by aps.step_order asc
    `,
    [approvalRequestId],
  );

  return result.rows;
}

export type WorkSessionApprovalTargetRow = QueryResultRow & {
  id: string;
  session_date: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  user_display_name: string;
  user_employee_code: string | null;
  project_name: string | null;
  site_name: string | null;
};

export async function getWorkSessionApprovalTargetSummary(
  client: PoolClient,
  organizationId: string,
  workSessionId: string,
) {
  const result = await client.query<WorkSessionApprovalTargetRow>(
    `
      select
        ws.id,
        ws.session_date::text,
        ws.status,
        ws.started_at::text,
        ws.ended_at::text,
        u.display_name as user_display_name,
        u.employee_code as user_employee_code,
        p.name as project_name,
        s.name as site_name
      from work_sessions ws
      inner join users u on u.id = ws.user_id
      left join projects p on p.id = ws.project_id
      left join sites s on s.id = ws.site_id
      where ws.organization_id = $1 and ws.id = $2
      limit 1
    `,
    [organizationId, workSessionId],
  );

  return result.rows[0] ?? null;
}

export type ApprovalRequestRow = QueryResultRow & {
  id: string;
  organization_id: string;
  target_type: string;
  target_id: string;
  status: string;
  requested_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function getApprovalRequestForUpdate(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<ApprovalRequestRow>(
    `
      select
        id,
        organization_id,
        target_type,
        target_id,
        status,
        requested_by,
        created_at::text,
        updated_at::text
      from approval_requests
      where organization_id = $1 and id = $2
      for update
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

type ReviewApprovalStepRow = QueryResultRow & {
  id: string;
  step_order: number;
};

export async function getPendingApprovalStepForUpdate(
  client: PoolClient,
  approvalRequestId: string,
) {
  const result = await client.query<ReviewApprovalStepRow>(
    `
      select
        id,
        step_order
      from approval_steps
      where approval_request_id = $1
        and status = 'pending'
      order by step_order asc
      limit 1
      for update
    `,
    [approvalRequestId],
  );

  return result.rows[0] ?? null;
}

export async function getLastApprovalStep(
  client: PoolClient,
  approvalRequestId: string,
) {
  const result = await client.query<ReviewApprovalStepRow>(
    `
      select
        id,
        step_order
      from approval_steps
      where approval_request_id = $1
      order by step_order desc
      limit 1
    `,
    [approvalRequestId],
  );

  return result.rows[0] ?? null;
}

export async function insertApprovalStepDecision(
  client: PoolClient,
  input: {
    approvalRequestId: string;
    stepOrder: number;
    actorUserId: string;
    status: "approved" | "rejected";
    comment: string | null;
  },
) {
  const result = await client.query<ReviewApprovalStepRow>(
    `
      insert into approval_steps (
        approval_request_id,
        step_order,
        reviewer_user_id,
        status,
        reviewed_at,
        comment
      )
      values ($1, $2, $3, $4, now(), $5)
      returning id, step_order
    `,
    [
      input.approvalRequestId,
      input.stepOrder,
      input.actorUserId,
      input.status,
      input.comment,
    ],
  );

  return result.rows[0];
}

export async function updateApprovalStepDecision(
  client: PoolClient,
  input: {
    stepId: string;
    actorUserId: string;
    status: "approved" | "rejected";
    comment: string | null;
  },
) {
  const result = await client.query<ReviewApprovalStepRow>(
    `
      update approval_steps
      set
        reviewer_user_id = $2,
        status = $3,
        reviewed_at = now(),
        comment = $4,
        updated_at = now()
      where id = $1
      returning id, step_order
    `,
    [input.stepId, input.actorUserId, input.status, input.comment],
  );

  return result.rows[0] ?? null;
}

export async function updateApprovalRequestStatus(
  client: PoolClient,
  organizationId: string,
  id: string,
  status: "approved" | "rejected",
) {
  const result = await client.query<ApprovalRequestRow>(
    `
      update approval_requests
      set
        status = $3,
        updated_at = now()
      where organization_id = $1 and id = $2
      returning
        id,
        organization_id,
        target_type,
        target_id,
        status,
        requested_by,
        created_at::text,
        updated_at::text
    `,
    [organizationId, id, status],
  );

  return result.rows[0] ?? null;
}

export async function setWorkSessionApprovalDecision(
  client: PoolClient,
  input: {
    organizationId: string;
    workSessionId: string;
    actorUserId: string;
    decision: "approved" | "rejected";
  },
) {
  const result = await client.query<QueryResultRow>(
    input.decision === "approved"
      ? `
        update work_sessions
        set
          status = 'approved',
          approved_at = now(),
          approved_by = $3,
          updated_at = now()
        where organization_id = $1 and id = $2
        returning id
      `
      : `
        update work_sessions
        set
          status = 'rejected',
          approved_at = null,
          approved_by = null,
          updated_at = now()
        where organization_id = $1 and id = $2
        returning id
      `,
    [input.organizationId, input.workSessionId, input.actorUserId],
  );

  return result.rows[0] ?? null;
}
