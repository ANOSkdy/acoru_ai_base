import type { PoolClient, QueryResultRow } from "pg";

export type OrgUnitRow = QueryResultRow & {
  id: string;
  organization_id: string;
  parent_org_unit_id: string | null;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ListOrgUnitsFilters = {
  organizationId: string;
  search?: string;
  limit: number;
  offset: number;
};

export async function listOrgUnits(client: PoolClient, filters: ListOrgUnitsFilters) {
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

  const result = await client.query<OrgUnitRow>(
    `
      select
        id,
        organization_id,
        parent_org_unit_id,
        code,
        name,
        created_at::text,
        updated_at::text
      from org_units
      where ${clauses.join(" and ")}
      order by name asc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function listOrgUnitOptions(client: PoolClient, organizationId: string) {
  return listOrgUnits(client, { organizationId, limit: 500, offset: 0 });
}

export async function getOrgUnitById(client: PoolClient, organizationId: string, id: string) {
  const result = await client.query<OrgUnitRow>(
    `
      select
        id,
        organization_id,
        parent_org_unit_id,
        code,
        name,
        created_at::text,
        updated_at::text
      from org_units
      where organization_id = $1 and id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export type InsertOrgUnitInput = {
  organizationId: string;
  parentOrgUnitId?: string | null;
  code: string;
  name: string;
};

export async function insertOrgUnit(client: PoolClient, input: InsertOrgUnitInput) {
  const result = await client.query<OrgUnitRow>(
    `
      insert into org_units (organization_id, parent_org_unit_id, code, name)
      values ($1, $2, $3, $4)
      returning id, organization_id, parent_org_unit_id, code, name, created_at::text, updated_at::text
    `,
    [input.organizationId, input.parentOrgUnitId ?? null, input.code, input.name],
  );

  return result.rows[0];
}

export type UpdateOrgUnitInput = {
  parentOrgUnitId?: string | null;
  code?: string;
  name?: string;
};

export async function updateOrgUnitById(
  client: PoolClient,
  organizationId: string,
  id: string,
  input: UpdateOrgUnitInput,
) {
  const sets: string[] = ["updated_at = now()"];
  const values: unknown[] = [organizationId, id];

  if (input.parentOrgUnitId !== undefined) {
    values.push(input.parentOrgUnitId);
    sets.push(`parent_org_unit_id = $${values.length}`);
  }
  if (input.code !== undefined) {
    values.push(input.code);
    sets.push(`code = $${values.length}`);
  }
  if (input.name !== undefined) {
    values.push(input.name);
    sets.push(`name = $${values.length}`);
  }

  const result = await client.query<OrgUnitRow>(
    `
      update org_units
      set ${sets.join(", ")}
      where organization_id = $1 and id = $2
      returning id, organization_id, parent_org_unit_id, code, name, created_at::text, updated_at::text
    `,
    values,
  );

  return result.rows[0] ?? null;
}
