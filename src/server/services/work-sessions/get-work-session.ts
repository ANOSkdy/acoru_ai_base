import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getWorkSessionById } from "@/src/server/db/queries/work-sessions";

export async function getWorkSessionService(
  organizationId: string,
  id: string,
) {
  return withDbClient((client) => getWorkSessionById(client, organizationId, id));
}
