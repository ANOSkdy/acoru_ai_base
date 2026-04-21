import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  listClosingPeriods,
  type ListClosingPeriodsFilters,
} from "@/src/server/db/queries/closing-periods";

export async function listClosingPeriodsService(
  filters: ListClosingPeriodsFilters,
) {
  return withDbClient((client) => listClosingPeriods(client, filters));
}
