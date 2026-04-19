import "server-only";

import type { NextRequest } from "next/server";

import type { AuthContext } from "@/src/server/db/types";

const FALLBACK_USER_ID = "00000000-0000-0000-0000-000000000100";
const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

export function requireServerAuth(request: NextRequest): AuthContext {
  const actorUserId =
    request.headers.get("x-acoru-user-id")?.trim() || FALLBACK_USER_ID;
  const organizationId =
    request.headers.get("x-acoru-org-id")?.trim() || FALLBACK_ORG_ID;

  return {
    actorUserId,
    organizationId,
  };
}
