import { z } from "zod";

export const workCategoryIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listWorkCategoriesQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createWorkCategorySchema = z.object({
  code: z.string().trim().min(1, "コードは必須です").max(40, "コードは40文字以内で入力してください"),
  name: z.string().trim().min(1, "名称は必須です").max(200, "名称は200文字以内で入力してください"),
  categoryType: z.string().trim().min(1, "区分は必須です").max(40, "区分は40文字以内で入力してください").default("standard"),
  isBillable: z.boolean().default(true),
});

export const updateWorkCategorySchema = z.object({
  code: z.string().trim().min(1).max(40).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  categoryType: z.string().trim().min(1).max(40).optional(),
  isBillable: z.boolean().optional(),
});
