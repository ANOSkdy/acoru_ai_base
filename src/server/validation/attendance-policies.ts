import { z } from "zod";

const rulesObjectSchema = z
  .object({})
  .catchall(z.unknown())
  .refine((value) => !Array.isArray(value), {
    message: "ルールはJSONオブジェクトで入力してください",
  });

export const attendancePolicyIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listAttendancePoliciesQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createAttendancePolicySchema = z.object({
  code: z.string().trim().min(1, "コードは必須です").max(40, "コードは40文字以内で入力してください"),
  name: z.string().trim().min(1, "名称は必須です").max(200, "名称は200文字以内で入力してください"),
  rules: rulesObjectSchema,
});

export const updateAttendancePolicySchema = z.object({
  code: z.string().trim().min(1).max(40).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  rules: rulesObjectSchema.optional(),
});
