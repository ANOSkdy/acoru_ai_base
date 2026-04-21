import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  listAttendanceLogs,
  type ListAttendanceLogsFilters,
} from "@/src/server/db/queries/attendance";

export async function listAttendanceLogsService(
  filters: ListAttendanceLogsFilters,
) {
  return withDbClient((client) => listAttendanceLogs(client, filters));
}
