import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  listWorkSessions,
  type ListWorkSessionsFilters,
} from "@/src/server/db/queries/work-sessions";

export async function listWorkSessionsService(filters: ListWorkSessionsFilters) {
  return withDbClient((client) => listWorkSessions(client, filters));
}
