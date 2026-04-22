import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { listOrgUnitOptions, listOrgUnits, type ListOrgUnitsFilters } from "@/src/server/db/queries/org-units";

export async function listOrgUnitsService(filters: ListOrgUnitsFilters) {
  return withDbClient((client) => listOrgUnits(client, filters));
}

export async function listOrgUnitOptionsService(organizationId: string) {
  return withDbClient((client) => listOrgUnitOptions(client, organizationId));
}
