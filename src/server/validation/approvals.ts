import { z } from "zod";

export const approvalIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listApprovalsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  targetType: z.string().trim().min(1).max(80).optional(),
  requester: z.string().uuid().optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
}).refine(
  (value) => {
    if (!value.dateFrom || !value.dateTo) {
      return true;
    }

    return value.dateFrom <= value.dateTo;
  },
  {
    message: "dateTo must be on or after dateFrom",
    path: ["dateTo"],
  },
);

export const reviewApprovalSchema = z.object({
  comment: z.string().trim().max(500).nullable().optional(),
});
