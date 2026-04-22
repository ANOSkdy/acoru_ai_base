import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getRoleById } from "@/src/server/db/queries/roles";

export async function getRoleService(id: string) {
  return withDbClient((client) => getRoleById(client, id));
}
