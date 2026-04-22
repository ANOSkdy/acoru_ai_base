import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getOrgUnitById } from "@/src/server/db/queries/org-units";

export async function getOrgUnitService(organizationId: string, id: string) {
  return withDbClient((client) => getOrgUnitById(client, organizationId, id));
}
