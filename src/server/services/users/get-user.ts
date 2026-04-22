import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getUserById } from "@/src/server/db/queries/users";
import { listRolesByUserId } from "@/src/server/db/queries/roles";

export async function getUserService(organizationId: string, id: string) {
  return withDbClient((client) => getUserById(client, organizationId, id));
}

export async function getUserWithRolesService(organizationId: string, id: string) {
  return withDbClient(async (client) => {
    const user = await getUserById(client, organizationId, id);
    if (!user) return null;

    const roles = await listRolesByUserId(client, organizationId, id);
    return {
      ...user,
      roles,
    };
  });
}
