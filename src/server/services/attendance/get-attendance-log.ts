import "server-only";

import { withDbClient } from "@/src/server/db/client";
import { getAttendanceLogById } from "@/src/server/db/queries/attendance";

export async function getAttendanceLogService(
  organizationId: string,
  id: string,
) {
  return withDbClient((client) => getAttendanceLogById(client, organizationId, id));
}
