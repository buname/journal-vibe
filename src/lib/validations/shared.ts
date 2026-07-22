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

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Parses a JSON-encoded array of image URLs from a hidden form field. */
export const imagesFromJsonString = z
  .string()
  .optional()
  .transform((raw) => {
    if (!raw) return [] as string[];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [] as string[];
      return parsed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(isHttpUrl)
        .slice(0, 20);
    } catch {
      return [] as string[];
    }
  });
