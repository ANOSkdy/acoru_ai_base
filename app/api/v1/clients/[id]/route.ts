import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireServerAuth } from "@/src/server/auth/require-server-auth";
import { getClientService } from "@/src/server/services/clients/get-client";
import { updateClientService } from "@/src/server/services/clients/update-client";
import {
  clientIdParamsSchema,
  updateClientSchema,
} from "@/src/server/validation/clients";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const { id } = clientIdParamsSchema.parse(await context.params);

    const row = await getClientService(auth.organizationId, id);

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: row });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid route params", issues: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = requireServerAuth(request);
    const { id } = clientIdParamsSchema.parse(await context.params);
    const body = updateClientSchema.parse(await request.json());

    const row = await updateClientService({
      organizationId: auth.organizationId,
      actorUserId: auth.actorUserId,
      id,
      ...body,
    });

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: row });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
