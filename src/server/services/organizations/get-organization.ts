import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getOrganizationById } from "@/src/server/db/queries/organizations";

export async function getOrganizationService(id: string) {
  return withDbClient((client) => getOrganizationById(client, id));
}
