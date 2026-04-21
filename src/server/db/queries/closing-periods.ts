import type { PoolClient, QueryResultRow } from "pg";

export type ClosingPeriodRow = QueryResultRow & {
  id: string;
  organization_id: string;
  label: string;
  period_start: string;
  period_end: string;
  status: string;
  created_by: string | null;
  created_by_name: string | null;
  closed_at: string | null;
  closed_by: string | null;
  closed_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export type ListClosingPeriodsFilters = {
  organizationId: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
};

export type InsertClosingPeriodInput = {
  organizationId: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  createdBy: string;
};

export async function insertClosingPeriod(
  client: PoolClient,
  input: InsertClosingPeriodInput,
) {
  const result = await client.query<ClosingPeriodRow>(
    `
      insert into closing_periods (
        organization_id,
        label,
        period_start,
        period_end,
        status,
        created_by
      )
      values ($1, $2, $3, $4, 'open', $5)
      returning
        id,
        organization_id,
        label,
        period_start::text,
        period_end::text,
        status,
        created_by,
        null::text as created_by_name,
        closed_at::text,
        closed_by,
        null::text as closed_by_name,
        created_at::text,
        updated_at::text
    `,
    [
      input.organizationId,
      input.label,
      input.periodStart,
      input.periodEnd,
      input.createdBy,
    ],
  );

  return result.rows[0];
}

export async function listClosingPeriods(
  client: PoolClient,
  filters: ListClosingPeriodsFilters,
) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["cp.organization_id = $1"];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`cp.status = $${values.length}`);
  }

  if (filters.dateFrom) {
    values.push(filters.dateFrom);
    clauses.push(`cp.period_start >= $${values.length}::date`);
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);
    clauses.push(`cp.period_end <= $${values.length}::date`);
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const result = await client.query<ClosingPeriodRow>(
    `
      select
        cp.id,
        cp.organization_id,
        cp.label,
        cp.period_start::text,
        cp.period_end::text,
        cp.status,
        cp.created_by,
        cu.display_name as created_by_name,
        cp.closed_at::text,
        cp.closed_by,
        uu.display_name as closed_by_name,
        cp.created_at::text,
        cp.updated_at::text
      from closing_periods cp
      left join users cu on cu.id = cp.created_by
      left join users uu on uu.id = cp.closed_by
      where ${clauses.join(" and ")}
      order by cp.period_start desc, cp.created_at desc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function getClosingPeriodById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<ClosingPeriodRow>(
    `
      select
        cp.id,
        cp.organization_id,
        cp.label,
        cp.period_start::text,
        cp.period_end::text,
        cp.status,
        cp.created_by,
        cu.display_name as created_by_name,
        cp.closed_at::text,
        cp.closed_by,
        uu.display_name as closed_by_name,
        cp.created_at::text,
        cp.updated_at::text
      from closing_periods cp
      left join users cu on cu.id = cp.created_by
      left join users uu on uu.id = cp.closed_by
      where cp.organization_id = $1 and cp.id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export async function closeClosingPeriodById(
  client: PoolClient,
  organizationId: string,
  id: string,
  actorUserId: string,
) {
  const result = await client.query<ClosingPeriodRow>(
    `
      update closing_periods
      set
        status = 'closed',
        closed_at = now(),
        closed_by = $3,
        updated_at = now()
      where organization_id = $1 and id = $2 and status = 'open'
      returning
        id,
        organization_id,
        label,
        period_start::text,
        period_end::text,
        status,
        created_by,
        null::text as created_by_name,
        closed_at::text,
        closed_by,
        null::text as closed_by_name,
        created_at::text,
        updated_at::text
    `,
    [organizationId, id, actorUserId],
  );

  return result.rows[0] ?? null;
}
