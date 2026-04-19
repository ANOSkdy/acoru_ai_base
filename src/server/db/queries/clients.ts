import type { PoolClient, QueryResultRow } from "pg";

export type ClientRow = QueryResultRow & {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ListClientsFilters = {
  organizationId: string;
  search?: string;
  status?: string;
  limit: number;
  offset: number;
};

export async function listClients(
  client: PoolClient,
  filters: ListClientsFilters,
) {
  const values: unknown[] = [filters.organizationId];
  const clauses = ["organization_id = $1"];

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

  const result = await client.query<ClientRow>(
    `
      select
        id,
        organization_id,
        code,
        name,
        status,
        created_at::text,
        updated_at::text
      from clients
      where ${clauses.join(" and ")}
      order by name asc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function getClientById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<ClientRow>(
    `
      select
        id,
        organization_id,
        code,
        name,
        status,
        created_at::text,
        updated_at::text
      from clients
      where organization_id = $1 and id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export type InsertClientInput = {
  organizationId: string;
  code: string;
  name: string;
  status: string;
};

export async function insertClient(
  client: PoolClient,
  input: InsertClientInput,
) {
  const result = await client.query<ClientRow>(
    `
      insert into clients (organization_id, code, name, status)
      values ($1, $2, $3, $4)
      returning
        id,
        organization_id,
        code,
        name,
        status,
        created_at::text,
        updated_at::text
    `,
    [input.organizationId, input.code, input.name, input.status],
  );

  return result.rows[0];
}

export type UpdateClientInput = {
  code?: string;
  name?: string;
  status?: string;
};

export async function updateClientById(
  client: PoolClient,
  organizationId: string,
  id: string,
  input: UpdateClientInput,
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

  const result = await client.query<ClientRow>(
    `
      update clients
      set ${sets.join(", ")}
      where organization_id = $1 and id = $2
      returning
        id,
        organization_id,
        code,
        name,
        status,
        created_at::text,
        updated_at::text
    `,
    values,
  );

  return result.rows[0] ?? null;
}
