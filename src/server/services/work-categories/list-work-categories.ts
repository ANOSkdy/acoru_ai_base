import "server-only";

import {
  listWorkCategories,
  type ListWorkCategoriesFilters,
} from "@/src/server/db/queries/work-categories";
import { withDbClient } from "@/src/server/db/client";

export async function listWorkCategoriesService(filters: ListWorkCategoriesFilters) {
  return withDbClient((client) => listWorkCategories(client, filters));
}
