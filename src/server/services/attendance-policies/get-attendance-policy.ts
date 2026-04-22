import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getAttendancePolicyById } from "@/src/server/db/queries/attendance-policies";

export async function getAttendancePolicyService(organizationId: string, id: string) {
  return withDbClient((client) => getAttendancePolicyById(client, organizationId, id));
}
