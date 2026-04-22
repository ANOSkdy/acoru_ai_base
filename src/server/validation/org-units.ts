import { z } from "zod";

export const orgUnitIdParamsSchema = z.object({ id: z.string().uuid() });

export const listOrgUnitsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const parentOrgUnitIdSchema = z.union([z.string().uuid(), z.literal(""), z.null()]).optional();

export const createOrgUnitSchema = z.object({
  code: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  parentOrgUnitId: parentOrgUnitIdSchema,
});

export const updateOrgUnitSchema = z.object({
  code: z.string().trim().min(1).max(100).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  parentOrgUnitId: parentOrgUnitIdSchema,
});
