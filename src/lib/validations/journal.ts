import { z } from "zod";

import { dayInputSchema, tagsFromCommaString } from "@/lib/validations/shared";

export const journalUpsertSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  content: z.string().trim().min(1, "Content is required.").max(50_000),
  date: dayInputSchema,
  tags: tagsFromCommaString,
  rating: z.coerce.number().int().min(0).max(5).transform((v) => (v === 0 ? null : v)),
});

export type JournalUpsertInput = z.infer<typeof journalUpsertSchema>;
