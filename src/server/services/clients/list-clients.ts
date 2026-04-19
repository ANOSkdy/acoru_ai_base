import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  listClients,
  type ListClientsFilters,
} from "@/src/server/db/queries/clients";

export async function listClientsService(filters: ListClientsFilters) {
  return withDbClient((client) => listClients(client, filters));
}
