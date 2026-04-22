import "server-only";

import {
  listAttendancePolicies,
  type ListAttendancePoliciesFilters,
} from "@/src/server/db/queries/attendance-policies";
import { withDbClient } from "@/src/server/db/client";

export async function listAttendancePoliciesService(filters: ListAttendancePoliciesFilters) {
  return withDbClient((client) => listAttendancePolicies(client, filters));
}
