import { z } from "zod";

export const organizationIdParamsSchema = z.object({ id: z.string().uuid() });

export const listOrganizationsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createOrganizationSchema = z.object({
  code: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateOrganizationSchema = z.object({
  code: z.string().trim().min(1).max(100).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
