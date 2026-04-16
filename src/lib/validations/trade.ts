import { z } from "zod";

import { dayInputSchema, tagsFromCommaString } from "@/lib/validations/shared";

export const tradeDirectionSchema = z.enum(["LONG", "SHORT"]);

export const tradeSessionSchema = z.enum([
  "London",
  "New York",
  "Asia",
  "Out Of Session",
  "",
]);

export const tradeUpsertSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, "Symbol is required.")
    .max(32)
    .transform((value) => value.toUpperCase()),
  direction: tradeDirectionSchema,
  entryPrice: z.coerce.number().finite("Entry price must be a number."),
  exitPrice: z.coerce.number().finite("Exit price must be a number."),
  size: z.coerce.number().positive("Size must be greater than zero."),
  fees: z.coerce.number().min(0, "Fees cannot be negative."),
  session: tradeSessionSchema.transform((v) => (v === "" ? undefined : v)),
  entryTime: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return undefined;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }),
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

export type TradeUpsertInput = z.infer<typeof tradeUpsertSchema>;
