import { z } from "zod";

import { dayInputSchema, tagsFromCommaString } from "@/lib/validations/shared";

export const backtestUpsertSchema = z.object({
  strategy: z.string().trim().min(1, "Strategy is required.").max(120),
  timeframe: z.string().trim().min(1, "Timeframe is required.").max(64),
  winRate: z.coerce
    .number()
    .min(0, "Win rate must be at least 0.")
    .max(100, "Win rate cannot exceed 100."),
  expectancy: z.coerce.number().finite("Expectancy must be a number."),
  notes: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = (value ?? "").trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }),
  date: dayInputSchema,
  tags: tagsFromCommaString,
});

export type BacktestUpsertInput = z.infer<typeof backtestUpsertSchema>;
