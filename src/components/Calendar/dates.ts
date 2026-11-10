/**
 * Plain calendar dates as ISO strings (`2026-11-10`): no time and no time zone, so a date picked in Dublin is the same
 * date in Lahore. Strings compare in date order, and they are what forms and APIs already exchange.
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const pad = (n: number, width = 2) => String(n).padStart(width, "0");

/** `2026-11-10` from a Date's local year, month and day. */
export const toISODate = (date: Date) =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** A Date at local midnight, or null when `iso` is not a real date (2026-02-30 is not). */
export function fromISODate(iso: string): Date | null {
  const m = ISO.exec(iso.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  date.setFullYear(y); // years below 100 would otherwise be read as 19xx
  return date.getMonth() === mo - 1 && date.getDate() === d ? date : null;
}

/** Whether `iso` is a real date, written `YYYY-MM-DD`. */
export const isISODate = (iso: string) => fromISODate(iso) !== null;

export const addDays = (iso: string, days: number) => {
  const date = fromISODate(iso) as Date;
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

/** Months later (or earlier), keeping the day where it exists: 31 January plus a month is 28 or 29 February. */
export function addMonths(iso: string, months: number) {
  const date = fromISODate(iso) as Date;
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  return toISODate(date);
}

/** `iso` kept within `min` and `max` (either may be absent). */
export const clampDate = (iso: string, min?: string, max?: string) =>
  min && iso < min ? min : max && iso > max ? max : iso;

/** The weekday a week starts on in `locale` (0 Sunday to 6 Saturday), where the browser knows it; else Monday. */
export function firstDayOfWeek(locale?: string): number {
  try {
    // `getWeekInfo()` is the standard; `weekInfo` is the older accessor some engines still have.
    const loc = new Intl.Locale(locale ?? navigator.language) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) return info.firstDay % 7;
  } catch {
    // An unknown locale falls through to Monday.
  }
  return 1;
}
