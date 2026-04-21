import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getClosingPeriodById } from "@/src/server/db/queries/closing-periods";

export async function getClosingPeriodService(
  organizationId: string,
  id: string,
) {
  return withDbClient((client) => getClosingPeriodById(client, organizationId, id));
}
