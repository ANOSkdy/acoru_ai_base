import "server-only";

import { headers } from "next/headers";

import { FALLBACK_ORG_ID } from "@/src/server/auth/fallback-auth-context";

const ORG_ID_HEADER = "x-acoru-org-id";

export async function getServerOrganizationId() {
  const requestHeaders = await headers();
  const organizationId = requestHeaders.get(ORG_ID_HEADER)?.trim();

  return organizationId || FALLBACK_ORG_ID;
}
