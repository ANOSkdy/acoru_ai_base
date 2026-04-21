import { z } from "zod";

export const createClosingPeriodSchema = z.object({
  label: z.string().trim().min(1).max(120),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
}).refine(
  (value) => value.periodEnd >= value.periodStart,
  {
    message: "periodEnd must be on or after periodStart",
    path: ["periodEnd"],
  },
);

export const closingPeriodIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listClosingPeriodsQuerySchema = z.object({
  status: z.enum(["open", "closed"]).optional(),
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
