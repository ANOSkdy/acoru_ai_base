import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getProjectById } from "@/src/server/db/queries/projects";

export async function getProjectService(organizationId: string, id: string) {
  return withDbClient((client) => getProjectById(client, organizationId, id));
}
