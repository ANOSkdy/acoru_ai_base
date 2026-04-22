import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { listRoleOptions, listRoles, type ListRolesFilters } from "@/src/server/db/queries/roles";

export async function listRolesService(filters: ListRolesFilters) {
  return withDbClient((client) => listRoles(client, filters));
}

export async function listRoleOptionsService() {
  return withDbClient((client) => listRoleOptions(client));
}
