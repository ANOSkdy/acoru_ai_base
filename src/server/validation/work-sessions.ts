import { z } from "zod";

export const workSessionIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listWorkSessionsQuerySchema = z.object({
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  userId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const approveWorkSessionSchema = z.object({
  comment: z.string().trim().max(500).nullable().optional(),
});
