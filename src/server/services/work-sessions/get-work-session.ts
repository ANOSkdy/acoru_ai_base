import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  getWorkSessionApprovalSummary,
  getWorkSessionById,
  listWorkEntriesBySessionId,
  listWorkSessionAttendanceLogs,
} from "@/src/server/db/queries/work-sessions";

export async function getWorkSessionService(
  organizationId: string,
  id: string,
) {
  return withDbClient(async (client) => {
    const workSession = await getWorkSessionById(client, organizationId, id);

    if (!workSession) {
      return null;
    }

    const [attendanceLogs, workEntries, approvalSummary] = await Promise.all([
      listWorkSessionAttendanceLogs(client, organizationId, id),
      listWorkEntriesBySessionId(client, organizationId, id),
      getWorkSessionApprovalSummary(client, organizationId, id),
    ]);

    return {
      ...workSession,
      attendanceLogs,
      workEntries,
      approvalSummary,
    };
  });
}
