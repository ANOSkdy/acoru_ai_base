import type { PoolClient, QueryResultRow } from "pg";

export type UserOptionRow = QueryResultRow & {
  id: string;
  display_name: string;
  employee_code: string | null;
  email: string;
  status: string;
};

export async function listUserOptions(
  client: PoolClient,
  organizationId: string,
) {
  const result = await client.query<UserOptionRow>(
    `
      select
        id,
        display_name,
        employee_code,
        email,
        status
      from users
      where organization_id = $1
      order by
        case when status = 'active' then 0 else 1 end,
        display_name asc
    `,
    [organizationId],
  );

  return result.rows;
}
