import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getSiteById } from "@/src/server/db/queries/sites";

export async function getSiteService(organizationId: string, id: string) {
  return withDbClient((client) => getSiteById(client, organizationId, id));
}
