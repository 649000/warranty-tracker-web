import { describe, expect, it } from 'vitest';
import {
  keyForDayStart,
  singaporeDateKey,
  singaporeDayStart,
  thresholdWindowsFor,
  REMINDER_THRESHOLDS_DAYS,
} from './calendar.js';

const DAY_MS = 86_400_000;

describe('calendar', () => {
  it('derives the Singapore midnight start and date key', () => {
    const now = new Date('2026-09-10T12:00:00Z');
    const dayStart = singaporeDayStart(now);
    expect(dayStart.getTime()).toBe(Date.UTC(2026, 8, 10) - 8 * 3_600_000);
    expect(singaporeDateKey(now)).toBe('2026-09-10');
    expect(keyForDayStart(dayStart)).toBe('2026-09-10');
  });

  it('rolls over at 00:00 Singapore time', () => {
    const before = new Date('2026-09-10T15:59:00Z');
    const after = new Date('2026-09-10T16:00:00Z');
    expect(singaporeDateKey(before)).toBe('2026-09-10');
    expect(singaporeDateKey(after)).toBe('2026-09-11');
  });

  it('builds full-day windows for each threshold', () => {
    const dayStart = singaporeDayStart(new Date('2026-09-10T12:00:00Z'));
    const windows = thresholdWindowsFor(dayStart);
    expect(windows.map((w) => w.daysAhead)).toEqual([...REMINDER_THRESHOLDS_DAYS]);

    for (const window of windows) {
      expect(window.start.getTime()).toBe(dayStart.getTime() + window.daysAhead * DAY_MS);
      expect(window.end.getTime()).toBe(window.start.getTime() + DAY_MS);
    }
  });
});
