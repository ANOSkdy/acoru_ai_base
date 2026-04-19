import type { PoolClient, QueryResultRow } from "pg";

type ClosingPeriodRow = QueryResultRow & {
  id: string;
  organization_id: string;
  label: string;
  period_start: string;
  period_end: string;
  status: string;
  closed_at: string | null;
  closed_by: string | null;
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
        closed_at::text,
        closed_by
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
      where organization_id = $1 and id = $2
      returning
        id,
        organization_id,
        label,
        period_start::text,
        period_end::text,
        status,
        closed_at::text,
        closed_by
    `,
    [organizationId, id, actorUserId],
  );

  return result.rows[0] ?? null;
}
