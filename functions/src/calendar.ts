export const REMINDER_THRESHOLDS_DAYS = [30, 7, 0] as const;

const SG_TIME_ZONE = 'Asia/Singapore';
const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

export interface ThresholdWindow {
  /** How many days before expiry this window targets. */
  daysAhead: number;
  /** Inclusive lower bound of the window. */
  start: Date;
  /** Exclusive upper bound of the window. */
  end: Date;
}

function sgDateParts(now: Date): { year: string; month: string; day: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SG_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '';
  return { year: value('year'), month: value('month'), day: value('day') };
}

/** 00:00 Asia/Singapore on the Singapore calendar day of `now`. */
export function singaporeDayStart(now: Date = new Date()): Date {
  const { year, month, day } = sgDateParts(now);
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)) - 8 * HOUR_MS);
}

/** YYYY-MM-DD key of the Singapore calendar day a midnight +08 Date falls on. */
export function singaporeDateKey(now: Date = new Date()): string {
  const { year, month, day } = sgDateParts(now);
  return `${year}-${month}-${day}`;
}

/** YYYY-MM-DD key for a date produced by `singaporeDayStart`. */
export function keyForDayStart(dayStart: Date): string {
  return singaporeDateKey(dayStart);
}

export function thresholdWindowsFor(dayStart: Date): ThresholdWindow[] {
  return REMINDER_THRESHOLDS_DAYS.map((daysAhead) => {
    const start = new Date(dayStart.getTime() + daysAhead * DAY_MS);
    return { daysAhead, start, end: new Date(start.getTime() + DAY_MS) };
  });
}
