import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  listUserOptions,
  listUsers,
  type ListUsersFilters,
} from "@/src/server/db/queries/users";

export async function listUsersService(organizationId: string) {
  return withDbClient((client) => listUserOptions(client, organizationId));
}

export async function listUsersForMasterService(filters: ListUsersFilters) {
  return withDbClient((client) => listUsers(client, filters));
}
