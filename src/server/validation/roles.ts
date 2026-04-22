import { z } from "zod";

export const roleIdParamsSchema = z.object({ id: z.string().uuid() });

export const listRolesQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createRoleSchema = z.object({
  code: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional(),
});

export const updateRoleSchema = z.object({
  code: z.string().trim().min(1).max(100).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(500).optional(),
});
