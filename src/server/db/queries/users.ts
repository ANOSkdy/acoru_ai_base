import type { PoolClient, QueryResultRow } from "pg";

export type UserRow = QueryResultRow & {
  id: string;
  organization_id: string;
  org_unit_id: string | null;
  display_name: string;
  employee_code: string | null;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ListUsersFilters = {
  organizationId: string;
  search?: string;
  status?: string;
  limit: number;
  offset: number;
};

export type UserOptionRow = QueryResultRow & {
  id: string;
  display_name: string;
  employee_code: string | null;
  email: string;
  status: string;
};

export async function listUsers(client: PoolClient, filters: ListUsersFilters) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["organization_id = $1"];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const idx = values.length;
    clauses.push(`(display_name ilike $${idx} or employee_code ilike $${idx} or email ilike $${idx})`);
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const result = await client.query<UserRow>(
    `
      select
        id,
        organization_id,
        org_unit_id,
        display_name,
        employee_code,
        email,
        status,
        created_at::text,
        updated_at::text
      from users
      where ${clauses.join(" and ")}
      order by display_name asc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function listUserOptions(client: PoolClient, organizationId: string) {
  const result = await client.query<UserOptionRow>(
    `
      select id, display_name, employee_code, email, status
      from users
      where organization_id = $1
      order by case when status = 'active' then 0 else 1 end, display_name asc
    `,
    [organizationId],
  );

  return result.rows;
}

export async function getUserById(client: PoolClient, organizationId: string, id: string) {
  const result = await client.query<UserRow>(
    `
      select
        id,
        organization_id,
        org_unit_id,
        display_name,
        employee_code,
        email,
        status,
        created_at::text,
        updated_at::text
      from users
      where organization_id = $1 and id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export type InsertUserInput = {
  organizationId: string;
  orgUnitId?: string | null;
  employeeCode?: string | null;
  displayName: string;
  email: string;
  status: string;
};

export async function insertUser(client: PoolClient, input: InsertUserInput) {
  const result = await client.query<UserRow>(
    `
      insert into users (organization_id, org_unit_id, employee_code, display_name, email, status)
      values ($1, $2, $3, $4, $5, $6)
      returning id, organization_id, org_unit_id, display_name, employee_code, email, status, created_at::text, updated_at::text
    `,
    [
      input.organizationId,
      input.orgUnitId ?? null,
      input.employeeCode ?? null,
      input.displayName,
      input.email,
      input.status,
    ],
  );

  return result.rows[0];
}

export type UpdateUserInput = {
  orgUnitId?: string | null;
  employeeCode?: string | null;
  displayName?: string;
  email?: string;
  status?: string;
};

export async function updateUserById(
  client: PoolClient,
  organizationId: string,
  id: string,
  input: UpdateUserInput,
) {
  const sets: string[] = ["updated_at = now()"];
  const values: unknown[] = [organizationId, id];

  if (input.orgUnitId !== undefined) {
    values.push(input.orgUnitId);
    sets.push(`org_unit_id = $${values.length}`);
  }
  if (input.employeeCode !== undefined) {
    values.push(input.employeeCode);
    sets.push(`employee_code = $${values.length}`);
  }
  if (input.displayName !== undefined) {
    values.push(input.displayName);
    sets.push(`display_name = $${values.length}`);
  }
  if (input.email !== undefined) {
    values.push(input.email);
    sets.push(`email = $${values.length}`);
  }
  if (input.status !== undefined) {
    values.push(input.status);
    sets.push(`status = $${values.length}`);
  }

  const result = await client.query<UserRow>(
    `
      update users
      set ${sets.join(", ")}
      where organization_id = $1 and id = $2
      returning id, organization_id, org_unit_id, display_name, employee_code, email, status, created_at::text, updated_at::text
    `,
    values,
  );

  return result.rows[0] ?? null;
}
