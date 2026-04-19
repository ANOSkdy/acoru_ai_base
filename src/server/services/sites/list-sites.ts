import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  listSites,
  type ListSitesFilters,
} from "@/src/server/db/queries/sites";

export async function listSitesService(filters: ListSitesFilters) {
  return withDbClient((client) => listSites(client, filters));
}
