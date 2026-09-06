import { format, startOfDay } from "date-fns";

export function formatInputDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Parse yyyy-MM-dd as local calendar date (avoids UTC shift). */
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

export function toDayKey(date: Date): string {
  const local = startOfDay(date);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatListDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}
