import type { PoolClient, QueryResultRow } from "pg";

export type RoleRow = QueryResultRow & {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type ListRolesFilters = {
  search?: string;
  limit: number;
  offset: number;
};

export async function listRoles(client: PoolClient, filters: ListRolesFilters) {
  const values: unknown[] = [];
  const clauses: string[] = [];

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

  const result = await client.query<RoleRow>(
    `
      select id, code, name, description, created_at::text
      from roles
      ${where}
      order by name asc
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
}

export async function listRoleOptions(client: PoolClient) {
  return listRoles(client, { limit: 500, offset: 0 });
}

export async function getRoleById(client: PoolClient, id: string) {
  const result = await client.query<RoleRow>(
    `
      select id, code, name, description, created_at::text
      from roles
      where id = $1
      limit 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export type InsertRoleInput = {
  code: string;
  name: string;
  description?: string | null;
};

export async function insertRole(client: PoolClient, input: InsertRoleInput) {
  const result = await client.query<RoleRow>(
    `
      insert into roles (code, name, description)
      values ($1, $2, $3)
      returning id, code, name, description, created_at::text
    `,
    [input.code, input.name, input.description ?? null],
  );

  return result.rows[0];
}

export type UpdateRoleInput = {
  code?: string;
  name?: string;
  description?: string | null;
};

export async function updateRoleById(client: PoolClient, id: string, input: UpdateRoleInput) {
  const sets: string[] = [];
  const values: unknown[] = [id];

  if (input.code !== undefined) {
    values.push(input.code);
    sets.push(`code = $${values.length}`);
  }

  if (input.name !== undefined) {
    values.push(input.name);
    sets.push(`name = $${values.length}`);
  }

  if (input.description !== undefined) {
    values.push(input.description);
    sets.push(`description = $${values.length}`);
  }

  if (sets.length === 0) {
    return getRoleById(client, id);
  }

  const result = await client.query<RoleRow>(
    `
      update roles
      set ${sets.join(", ")}
      where id = $1
      returning id, code, name, description, created_at::text
    `,
    values,
  );

  return result.rows[0] ?? null;
}

export type UserRoleRow = QueryResultRow & {
  role_id: string;
  code: string;
  name: string;
};

export async function listRolesByUserId(client: PoolClient, organizationId: string, userId: string) {
  const result = await client.query<UserRoleRow>(
    `
      select r.id as role_id, r.code, r.name
      from user_roles ur
      inner join roles r on r.id = ur.role_id
      inner join users u on u.id = ur.user_id
      where ur.user_id = $1 and u.organization_id = $2
      order by r.name asc
    `,
    [userId, organizationId],
  );

  return result.rows;
}

export async function replaceUserRoles(
  client: PoolClient,
  organizationId: string,
  userId: string,
  roleIds: string[],
  assignedBy: string,
) {
  const roleCheck = await client.query<{ id: string }>(
    `
      select id
      from roles
      where id = any($1::uuid[])
    `,
    [roleIds],
  );

  if (roleCheck.rowCount !== roleIds.length) {
    throw new Error("One or more roles do not exist");
  }

  const userCheck = await client.query<{ id: string }>(
    `select id from users where id = $1 and organization_id = $2 limit 1`,
    [userId, organizationId],
  );

  if (userCheck.rowCount === 0) {
    throw new Error("User not found");
  }

  await client.query(`delete from user_roles where user_id = $1`, [userId]);

  if (roleIds.length > 0) {
    await client.query(
      `
      insert into user_roles (user_id, role_id, assigned_by)
      select $1, role_id, $3
      from unnest($2::uuid[]) as role_id
      `,
      [userId, roleIds, assignedBy],
    );
  }
}
