import type { PoolClient, QueryResultRow } from "pg";

export type OrganizationRow = QueryResultRow & {
  id: string;
  code: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ListOrganizationsFilters = {
  search?: string;
  status?: string;
  limit: number;
  offset: number;
};

export async function listOrganizations(client: PoolClient, filters: ListOrganizationsFilters) {
  const values: unknown[] = [];
  const clauses: string[] = [];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const idx = values.length;
    clauses.push(`(name ilike $${idx} or code ilike $${idx})`);
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const result = await client.query<OrganizationRow>(
    `
      select id, code, name, status, created_at::text, updated_at::text
      from organizations
      ${where}
      order by name asc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function getOrganizationById(client: PoolClient, id: string) {
  const result = await client.query<OrganizationRow>(
    `
      select id, code, name, status, created_at::text, updated_at::text
      from organizations
      where id = $1
      limit 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export type InsertOrganizationInput = {
  code: string;
  name: string;
  status: string;
};

export async function insertOrganization(client: PoolClient, input: InsertOrganizationInput) {
  const result = await client.query<OrganizationRow>(
    `
      insert into organizations (code, name, status)
      values ($1, $2, $3)
      returning id, code, name, status, created_at::text, updated_at::text
    `,
    [input.code, input.name, input.status],
  );

  return result.rows[0];
}

export type UpdateOrganizationInput = {
  code?: string;
  name?: string;
  status?: string;
};

export async function updateOrganizationById(client: PoolClient, id: string, input: UpdateOrganizationInput) {
  const sets: string[] = ["updated_at = now()"];
  const values: unknown[] = [id];

  if (input.code !== undefined) {
    values.push(input.code);
    sets.push(`code = $${values.length}`);
  }

  if (input.name !== undefined) {
    values.push(input.name);
    sets.push(`name = $${values.length}`);
  }

  if (input.status !== undefined) {
    values.push(input.status);
    sets.push(`status = $${values.length}`);
  }

  const result = await client.query<OrganizationRow>(
    `
      update organizations
      set ${sets.join(", ")}
      where id = $1
      returning id, code, name, status, created_at::text, updated_at::text
    `,
    values,
  );

  return result.rows[0] ?? null;
}
