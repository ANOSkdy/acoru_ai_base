import type { PoolClient, QueryResultRow } from "pg";

export type WorkCategoryRow = QueryResultRow & {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  category_type: string;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
};

export type ListWorkCategoriesFilters = {
  organizationId: string;
  search?: string;
  limit: number;
  offset: number;
};

export async function listWorkCategories(
  client: PoolClient,
  filters: ListWorkCategoriesFilters,
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

  const result = await client.query<WorkCategoryRow>(
    `
      select
        id,
        organization_id,
        code,
        name,
        category_type,
        is_billable,
        created_at::text,
        updated_at::text
      from work_categories
      where ${clauses.join(" and ")}
      order by name asc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function getWorkCategoryById(
  client: PoolClient,
  organizationId: string,
  id: string,
) {
  const result = await client.query<WorkCategoryRow>(
    `
      select
        id,
        organization_id,
        code,
        name,
        category_type,
        is_billable,
        created_at::text,
        updated_at::text
      from work_categories
      where organization_id = $1 and id = $2
      limit 1
    `,
    [organizationId, id],
  );

  return result.rows[0] ?? null;
}

export type InsertWorkCategoryInput = {
  organizationId: string;
  code: string;
  name: string;
  categoryType: string;
  isBillable: boolean;
};

export async function insertWorkCategory(
  client: PoolClient,
  input: InsertWorkCategoryInput,
) {
  const result = await client.query<WorkCategoryRow>(
    `
      insert into work_categories (
        organization_id,
        code,
        name,
        category_type,
        is_billable
      )
      values ($1, $2, $3, $4, $5)
      returning
        id,
        organization_id,
        code,
        name,
        category_type,
        is_billable,
        created_at::text,
        updated_at::text
    `,
    [
      input.organizationId,
      input.code,
      input.name,
      input.categoryType,
      input.isBillable,
    ],
  );

  return result.rows[0];
}

export type UpdateWorkCategoryInput = {
  code?: string;
  name?: string;
  categoryType?: string;
  isBillable?: boolean;
};

export async function updateWorkCategoryById(
  client: PoolClient,
  organizationId: string,
  id: string,
  input: UpdateWorkCategoryInput,
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
  if (input.categoryType !== undefined) {
    values.push(input.categoryType);
    sets.push(`category_type = $${values.length}`);
  }
  if (input.isBillable !== undefined) {
    values.push(input.isBillable);
    sets.push(`is_billable = $${values.length}`);
  }

  const result = await client.query<WorkCategoryRow>(
    `
      update work_categories
      set ${sets.join(", ")}
      where organization_id = $1 and id = $2
      returning
        id,
        organization_id,
        code,
        name,
        category_type,
        is_billable,
        created_at::text,
        updated_at::text
    `,
    values,
  );

  return result.rows[0] ?? null;
}
