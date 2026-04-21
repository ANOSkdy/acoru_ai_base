import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  listApprovalRequests,
  type ListApprovalRequestsFilters,
} from "@/src/server/db/queries/approvals";

export async function listApprovalsService(filters: ListApprovalRequestsFilters) {
  return withDbClient((client) => listApprovalRequests(client, filters));
}
