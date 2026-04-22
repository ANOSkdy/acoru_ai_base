import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getUserById } from "@/src/server/db/queries/users";

export async function getUserService(organizationId: string, id: string) {
  return withDbClient((client) => getUserById(client, organizationId, id));
}
