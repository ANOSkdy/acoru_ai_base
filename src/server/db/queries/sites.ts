import type { PoolClient, QueryResultRow } from "pg";

export type SiteRow = QueryResultRow & {
  id: string;
  organization_id: string;
  project_id: string | null;
  code: string;
  name: string;
  timezone: string;
  address: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SiteListRow = SiteRow & {
  project_name: string | null;
  project_code: string | null;
};

export type ListSitesFilters = {
  organizationId: string;
  search?: string;
  status?: string;
  projectId?: string;
  limit: number;
  offset: number;
};

export async function listSites(
  client: PoolClient,
  filters: ListSitesFilters,
) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["s.organization_id = $1"];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`s.status = $${values.length}`);
  }

  if (filters.projectId) {
    values.push(filters.projectId);
    clauses.push(`s.project_id = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const idx = values.length;
    clauses.push(`(s.name ilike $${idx} or s.code ilike $${idx})`);
  }

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const result = await client.query<SiteListRow>(
    `
      select
        s.id,
        s.organization_id,
        s.project_id,
        s.code,
        s.name,
        s.timezone,
        s.address,
        s.status,
        s.created_at::text,
        s.updated_at::text,
        p.name as project_name,
        p.code as project_code
      from sites s
      left join projects p on p.id = s.project_id
      where ${clauses.join(" and ")}
      order by s.name asc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function getSiteById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<SiteListRow>(
    `
      select
        s.id,
        s.organization_id,
        s.project_id,
        s.code,
        s.name,
        s.timezone,
        s.address,
        s.status,
        s.created_at::text,
        s.updated_at::text,
        p.name as project_name,
        p.code as project_code
      from sites s
      left join projects p on p.id = s.project_id
      where s.organization_id = $1 and s.id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export type InsertSiteInput = {
  organizationId: string;
  projectId: string | null;
  code: string;
  name: string;
  timezone: string;
  address: string | null;
  status: string;
};

export async function insertSite(
  client: PoolClient,
  input: InsertSiteInput,
) {
  const result = await client.query<SiteRow>(
    `
      insert into sites (
        organization_id,
        project_id,
        code,
        name,
        timezone,
        address,
        status
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning
        id,
        organization_id,
        project_id,
        code,
        name,
        timezone,
        address,
        status,
        created_at::text,
        updated_at::text
    `,
    [
      input.organizationId,
      input.projectId,
      input.code,
      input.name,
      input.timezone,
      input.address,
      input.status,
    ],
  );

  return result.rows[0];
}

export type UpdateSiteInput = {
  projectId?: string | null;
  code?: string;
  name?: string;
  timezone?: string;
  address?: string | null;
  status?: string;
};

export async function updateSiteById(
  client: PoolClient,
  organizationId: string,
  id: string,
  input: UpdateSiteInput,
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
  if (input.timezone !== undefined) {
    values.push(input.timezone);
    sets.push(`timezone = $${values.length}`);
  }
  if ("address" in input) {
    values.push(input.address ?? null);
    sets.push(`address = $${values.length}`);
  }
  if (input.status !== undefined) {
    values.push(input.status);
    sets.push(`status = $${values.length}`);
  }
  if ("projectId" in input) {
    values.push(input.projectId ?? null);
    sets.push(`project_id = $${values.length}`);
  }

  const result = await client.query<SiteRow>(
    `
      update sites
      set ${sets.join(", ")}
      where organization_id = $1 and id = $2
      returning
        id,
        organization_id,
        project_id,
        code,
        name,
        timezone,
        address,
        status,
        created_at::text,
        updated_at::text
    `,
    values,
  );

  return result.rows[0] ?? null;
}
