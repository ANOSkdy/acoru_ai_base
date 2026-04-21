import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { listUserOptions } from "@/src/server/db/queries/users";

export async function listUsersService(organizationId: string) {
  return withDbClient((client) => listUserOptions(client, organizationId));
}
