import type { PoolClient, QueryResultRow } from "pg";

export type AttendancePolicyRow = QueryResultRow & {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  rules: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ListAttendancePoliciesFilters = {
  organizationId: string;
  search?: string;
  limit: number;
  offset: number;
};

export async function listAttendancePolicies(
  client: PoolClient,
  filters: ListAttendancePoliciesFilters,
) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["organization_id = $1"];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const idx = values.length;
    clauses.push(`(name ilike $${idx} or code ilike $${idx})`);
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const result = await client.query<AttendancePolicyRow>(
    `
      select
        id,
        organization_id,
        code,
        name,
        rules,
        created_at::text,
        updated_at::text
      from attendance_policies
      where ${clauses.join(" and ")}
      order by name asc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function getAttendancePolicyById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<AttendancePolicyRow>(
    `
      select
        id,
        organization_id,
        code,
        name,
        rules,
        created_at::text,
        updated_at::text
      from attendance_policies
      where organization_id = $1 and id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export type InsertAttendancePolicyInput = {
  organizationId: string;
  code: string;
  name: string;
  rules: Record<string, unknown>;
};

export async function insertAttendancePolicy(
  client: PoolClient,
  input: InsertAttendancePolicyInput,
) {
  const result = await client.query<AttendancePolicyRow>(
    `
      insert into attendance_policies (
        organization_id,
        code,
        name,
        rules
      )
      values ($1, $2, $3, $4::jsonb)
      returning
        id,
        organization_id,
        code,
        name,
        rules,
        created_at::text,
        updated_at::text
    `,
    [input.organizationId, input.code, input.name, JSON.stringify(input.rules)],
  );

  return result.rows[0];
}

export type UpdateAttendancePolicyInput = {
  code?: string;
  name?: string;
  rules?: Record<string, unknown>;
};

export async function updateAttendancePolicyById(
  client: PoolClient,
  organizationId: string,
  id: string,
  input: UpdateAttendancePolicyInput,
) {
  const sets: string[] = ["updated_at = now()"];
  const values: unknown[] = [organizationId, id];

  if (input.code !== undefined) {
    values.push(input.code);
    sets.push(`code = $${values.length}`);
  }
  if (input.name !== undefined) {
    values.push(input.name);
    sets.push(`name = $${values.length}`);
  }
  if (input.rules !== undefined) {
    values.push(JSON.stringify(input.rules));
    sets.push(`rules = $${values.length}::jsonb`);
  }

  const result = await client.query<AttendancePolicyRow>(
    `
      update attendance_policies
      set ${sets.join(", ")}
      where organization_id = $1 and id = $2
      returning
        id,
        organization_id,
        code,
        name,
        rules,
        created_at::text,
        updated_at::text
    `,
    values,
  );

  return result.rows[0] ?? null;
}
