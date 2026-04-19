import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const projectIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listProjectsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  clientId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createProjectSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  code: z.string().trim().min(1, "コードは必須です").max(40, "コードは40文字以内で入力してください"),
  name: z.string().trim().min(1, "名称は必須です").max(200, "名称は200文字以内で入力してください"),
  status: z.enum(["active", "inactive"]).default("active"),
  startsOn: z.string().regex(datePattern).nullable().optional(),
  endsOn: z.string().regex(datePattern).nullable().optional(),
});

export const updateProjectSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  code: z.string().trim().min(1).max(40).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  startsOn: z.string().regex(datePattern).nullable().optional(),
  endsOn: z.string().regex(datePattern).nullable().optional(),
});
