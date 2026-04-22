import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getWorkCategoryById } from "@/src/server/db/queries/work-categories";

export async function getWorkCategoryService(organizationId: string, id: string) {
  return withDbClient((client) => getWorkCategoryById(client, organizationId, id));
}
