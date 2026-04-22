import { z } from "zod";

export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listUsersQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createUserSchema = z.object({
  employeeCode: z.string().trim().max(40, "社員コードは40文字以内で入力してください").optional(),
  displayName: z.string().trim().min(1, "表示名は必須です").max(200, "表示名は200文字以内で入力してください"),
  email: z.string().trim().email("メールアドレス形式で入力してください").max(255, "メールアドレスは255文字以内で入力してください"),
  status: z.enum(["active", "inactive"]).default("active"),
  orgUnitId: z.union([z.string().uuid(), z.literal(""), z.null()]).optional(),
  roleIds: z.array(z.string().uuid()).max(50).optional(),
});

export const updateUserSchema = z.object({
  employeeCode: z.string().trim().max(40).optional(),
  displayName: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().max(255).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  orgUnitId: z.union([z.string().uuid(), z.literal(""), z.null()]).optional(),
  roleIds: z.array(z.string().uuid()).max(50).optional(),
});
