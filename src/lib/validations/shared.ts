import { z } from "zod";

export const dayInputSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date (YYYY-MM-DD).")
  .transform((value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

export const tagsFromCommaString = z
  .string()
  .optional()
  .transform((raw) =>
    (raw ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 30),
  );
