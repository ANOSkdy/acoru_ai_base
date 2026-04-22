import "server-only";

import { writeAuditLog } from "@/src/server/audit/write-audit-log";
import { withDbClient } from "@/src/server/db/client";
import { updateWorkCategoryById } from "@/src/server/db/queries/work-categories";

type UpdateWorkCategoryInput = {
  organizationId: string;
  actorUserId: string;
  id: string;
  code?: string;
  name?: string;
  categoryType?: string;
  isBillable?: boolean;
};

export async function updateWorkCategoryService(input: UpdateWorkCategoryInput) {
  return withDbClient(async (client) => {
    await client.query("begin");
    try {
      const row = await updateWorkCategoryById(client, input.organizationId, input.id, {
        code: input.code,
        name: input.name,
        categoryType: input.categoryType,
        isBillable: input.isBillable,
      });

      if (!row) {
        await client.query("rollback");
        return null;
      }

      await writeAuditLog(client, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: "work_category.updated",
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
