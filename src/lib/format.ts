import { format, startOfDay } from "date-fns";

export function formatInputDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Parse yyyy-MM-dd as local calendar date (avoids UTC shift). */
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

/**
 * Parse trade clock times as timezone-free wall clock.
 * "2026-09-16T13:25:00" always means 13:25 — never shifted by browser/server TZ.
 * Stored via Date.UTC so display can read UTC hours back as the typed time.
 */
export function parseWallClockDateTime(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!match) {
    const fallback = new Date(trimmed);
    return Number.isNaN(fallback.getTime()) ? undefined : fallback;
  }

  const [, y, mo, d, hh, mm, ss] = match;
  return new Date(
    Date.UTC(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      Number(ss ?? "0"),
      0,
    ),
  );
}

/** Show the exact HH:mm the trader typed (UTC wall clock). */
export function formatWallClockTime(
  value: Date | string | null | undefined,
  withSeconds = false,
): string | null {
  if (value == null || value === "") return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  if (!withSeconds) return `${hh}:${mm}`;
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/** Map a stored wall-clock Date into a picker Date using local getters. */
export function wallClockToPickerDate(value: Date): Date {
  return new Date(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
    value.getUTCHours(),
    value.getUTCMinutes(),
    value.getUTCSeconds(),
    0,
  );
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
