import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { insertWorkCategory } from "@/src/server/db/queries/work-categories";

type CreateWorkCategoryInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  name: string;
  categoryType: string;
  isBillable: boolean;
};

export async function createWorkCategoryService(input: CreateWorkCategoryInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await insertWorkCategory(client, {
        organizationId: input.organizationId,
        code: input.code,
        name: input.name,
        categoryType: input.categoryType,
        isBillable: input.isBillable,
      });

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "work_category.created",
        targetType: "work_category",
        targetId: row.id,
        details: { code: row.code, name: row.name },
      });

      await client.query("commit");
      return row;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
