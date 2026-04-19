import type { PoolClient, QueryResultRow } from "pg";

export type ProjectRow = QueryResultRow & {
  id: string;
  organization_id: string;
  client_id: string | null;
  code: string;
  name: string;
  status: string;
  starts_on: string | null;
  ends_on: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectListRow = ProjectRow & {
  client_name: string | null;
  client_code: string | null;
};

export type ListProjectsFilters = {
  organizationId: string;
  search?: string;
  status?: string;
  clientId?: string;
  limit: number;
  offset: number;
};

export async function listProjects(
  client: PoolClient,
  filters: ListProjectsFilters,
) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["p.organization_id = $1"];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`p.status = $${values.length}`);
  }

  if (filters.clientId) {
    values.push(filters.clientId);
    clauses.push(`p.client_id = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const idx = values.length;
    clauses.push(`(p.name ilike $${idx} or p.code ilike $${idx})`);
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const result = await client.query<ProjectListRow>(
    `
      select
        p.id,
        p.organization_id,
        p.client_id,
        p.code,
        p.name,
        p.status,
        p.starts_on::text,
        p.ends_on::text,
        p.created_at::text,
        p.updated_at::text,
        c.name as client_name,
        c.code as client_code
      from projects p
      left join clients c on c.id = p.client_id
      where ${clauses.join(" and ")}
      order by p.name asc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function getProjectById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<ProjectListRow>(
    `
      select
        p.id,
        p.organization_id,
        p.client_id,
        p.code,
        p.name,
        p.status,
        p.starts_on::text,
        p.ends_on::text,
        p.created_at::text,
        p.updated_at::text,
        c.name as client_name,
        c.code as client_code
      from projects p
      left join clients c on c.id = p.client_id
      where p.organization_id = $1 and p.id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export type InsertProjectInput = {
  organizationId: string;
  clientId: string | null;
  code: string;
  name: string;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
};

export async function insertProject(
  client: PoolClient,
  input: InsertProjectInput,
) {
  const result = await client.query<ProjectRow>(
    `
      insert into projects (
        organization_id,
        client_id,
        code,
        name,
        status,
        starts_on,
        ends_on
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning
        id,
        organization_id,
        client_id,
        code,
        name,
        status,
        starts_on::text,
        ends_on::text,
        created_at::text,
        updated_at::text
    `,
    [
      input.organizationId,
      input.clientId,
      input.code,
      input.name,
      input.status,
      input.startsOn,
      input.endsOn,
    ],
  );

  return result.rows[0];
}

export type UpdateProjectInput = {
  clientId?: string | null;
  code?: string;
  name?: string;
  status?: string;
  startsOn?: string | null;
  endsOn?: string | null;
};

export async function updateProjectById(
  client: PoolClient,
  organizationId: string,
  id: string,
  input: UpdateProjectInput,
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
  if (input.status !== undefined) {
    values.push(input.status);
    sets.push(`status = $${values.length}`);
  }
  if ("clientId" in input) {
    values.push(input.clientId ?? null);
    sets.push(`client_id = $${values.length}`);
  }
  if ("startsOn" in input) {
    values.push(input.startsOn ?? null);
    sets.push(`starts_on = $${values.length}`);
  }
  if ("endsOn" in input) {
    values.push(input.endsOn ?? null);
    sets.push(`ends_on = $${values.length}`);
  }

  const result = await client.query<ProjectRow>(
    `
      update projects
      set ${sets.join(", ")}
      where organization_id = $1 and id = $2
      returning
        id,
        organization_id,
        client_id,
        code,
        name,
        status,
        starts_on::text,
        ends_on::text,
        created_at::text,
        updated_at::text
    `,
    values,
  );

  return result.rows[0] ?? null;
}
