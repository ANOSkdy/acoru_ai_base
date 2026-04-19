import "server-only";

import { withDbClient } from "@/src/server/db/client";
import {
  listProjects,
  type ListProjectsFilters,
} from "@/src/server/db/queries/projects";

export async function listProjectsService(filters: ListProjectsFilters) {
  return withDbClient((client) => listProjects(client, filters));
}
