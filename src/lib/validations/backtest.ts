import { z } from "zod";

import {
  dayInputSchema,
  imagesFromJsonString,
  tagsFromCommaString,
} from "@/lib/validations/shared";

const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number().finite().optional(),
);

const optionalString = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

export const backtestUpsertSchema = z.object({
  strategy: z.string().trim().min(1, "Strategy is required.").max(120),
  timeframe: z.string().trim().min(1, "Timeframe is required.").max(64),
  direction: z
    .enum(["LONG", "SHORT", ""])
    .optional()
    .transform((value) => (value === "" || !value ? undefined : value)),
  instrumentType: optionalString,
  entryPrice: optionalNumber,
  stopPrice: optionalNumber,
  winningTrades: z.coerce
    .number()
    .int("Winning trades must be a whole number.")
    .min(0, "Winning trades cannot be negative."),
  totalTrades: z.coerce
    .number()
    .int("Total trades must be a whole number.")
    .min(1, "Total trades must be at least 1."),
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
  images: imagesFromJsonString,
})
  .refine((data) => data.winningTrades <= data.totalTrades, {
    message: "Winning trades cannot exceed total trades.",
    path: ["winningTrades"],
  });

export type BacktestUpsertInput = z.infer<typeof backtestUpsertSchema>;
