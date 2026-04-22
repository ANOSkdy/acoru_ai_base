import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { listOrganizations, type ListOrganizationsFilters } from "@/src/server/db/queries/organizations";

export async function listOrganizationsService(filters: ListOrganizationsFilters) {
  return withDbClient((client) => listOrganizations(client, filters));
}
