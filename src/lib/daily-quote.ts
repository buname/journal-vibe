import type { DailyQuote } from "@/data/daily-quotes";

/** Local calendar day for the quote: rolls forward at 03:00 (3 AM) in the user's timezone */
export function getQuotePeriodKey(at: Date): string {
  const y = at.getFullYear();
  const m = at.getMonth();
  const d = at.getDate();
  const h = at.getHours();

  const period = new Date(y, m, d);
  if (h < 3) {
    period.setDate(period.getDate() - 1);
  }

  const yy = period.getFullYear();
  const mm = String(period.getMonth() + 1).padStart(2, "0");
  const dd = String(period.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function pickDailyQuote(quotes: DailyQuote[], periodKey: string): DailyQuote {
  if (quotes.length === 0) {
    return { text: "Add quotes to your catalog." };
  }
  const idx = hashString(periodKey) % quotes.length;
  return quotes[idx]!;
}
