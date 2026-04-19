import type { QueryResultRow } from "pg";

import { dbQuery } from "@/src/server/db/client";

type HealthRow = QueryResultRow & {
  now: string;
  current_database: string;
};

export async function getDatabaseHealth() {
  const result = await dbQuery<HealthRow>(
    `select now()::text as now, current_database() as current_database`,
  );

  return result.rows[0];
}
