import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getClientById } from "@/src/server/db/queries/clients";

export async function getClientService(organizationId: string, id: string) {
  return withDbClient((client) => getClientById(client, organizationId, id));
}
