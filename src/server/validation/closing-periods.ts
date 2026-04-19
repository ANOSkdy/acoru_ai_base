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
