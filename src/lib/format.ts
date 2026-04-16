import { format } from "date-fns";

export function formatInputDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatListDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}
