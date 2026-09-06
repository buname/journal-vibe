import { z } from "zod";

import {
  dayInputSchema,
  imagesFromJsonString,
  tagsFromCommaString,
} from "@/lib/validations/shared";

export const tradeDirectionSchema = z.enum(["LONG", "SHORT"]);

export const tradeSessionSchema = z.enum([
  "London",
  "New York",
  "Asia",
  "Out Of Session",
  "",
]);

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

export const tradeUpsertSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, "Symbol is required.")
    .max(32)
    .transform((value) => value.toUpperCase()),
  direction: tradeDirectionSchema,
  instrumentType: optionalString,
  pointValue: optionalNumber,
  stopPrice: optionalNumber,
  entryPrice: z.coerce.number().finite("Entry price must be a number."),
  exitPrice: z.coerce.number().finite("Exit price must be a number."),
  size: z.coerce.number().positive("Size must be greater than zero."),
  fees: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? 0 : value),
    z.coerce.number().min(0, "Fees cannot be negative."),
  ),
  session: tradeSessionSchema.transform((v) => (v === "" ? undefined : v)),
  entryTime: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return undefined;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }),
  exitTime: z
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
  images: imagesFromJsonString,
});

export type TradeUpsertInput = z.infer<typeof tradeUpsertSchema>;
