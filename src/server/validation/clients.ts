import { z } from "zod";

export const clientIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listClientsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createClientSchema = z.object({
  code: z.string().trim().min(1, "コードは必須です").max(40, "コードは40文字以内で入力してください"),
  name: z.string().trim().min(1, "名称は必須です").max(200, "名称は200文字以内で入力してください"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateClientSchema = z.object({
  code: z.string().trim().min(1).max(40).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
