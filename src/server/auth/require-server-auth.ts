import "server-only";

import type { NextRequest } from "next/server";

import type { AuthContext } from "@/src/server/db/types";
import {
  FALLBACK_ORG_ID,
  FALLBACK_USER_ID,
} from "@/src/server/auth/fallback-auth-context";

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
