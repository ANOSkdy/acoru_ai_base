import { z } from "zod";

export const workSessionIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listWorkSessionsQuerySchema = z.object({
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  userId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
}).refine(
  (value) => {
    if (!value.dateFrom || !value.dateTo) {
      return true;
    }

    return value.dateFrom <= value.dateTo;
  },
  {
    message: "日付範囲が不正です",
    path: ["dateTo"],
  },
);

export const approveWorkSessionSchema = z.object({
  comment: z.string().trim().max(500).nullable().optional(),
});

export const updateWorkSessionSchema = z.object({
  startedAt: z.string().datetime("開始日時を正しく入力してください"),
  endedAt: z.string().datetime("終了日時を正しく入力してください").nullable().optional(),
  notes: z.string().trim().max(1000, "備考は1000文字以内で入力してください").nullable().optional(),
}).superRefine((value, ctx) => {
  if (value.endedAt && new Date(value.endedAt).getTime() < new Date(value.startedAt).getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "終了日時は開始日時以降で入力してください",
      path: ["endedAt"],
    });
  }
});
