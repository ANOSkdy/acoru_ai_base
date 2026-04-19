import "server-only";

import type { PoolClient } from "pg";

type WriteAuditLogInput = {
  organizationId: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
};

export async function writeAuditLog(
  client: PoolClient,
  input: WriteAuditLogInput,
): Promise<void> {
  await client.query(
    `
      insert into audit_logs (
        organization_id,
        actor_user_id,
        action,
        target_type,
        target_id,
        details
      )
      values ($1, $2, $3, $4, $5, $6::jsonb)
    `,
    [
      input.organizationId,
      input.actorUserId,
      input.action,
      input.targetType,
      input.targetId,
      JSON.stringify(input.details ?? {}),
    ],
  );
}
