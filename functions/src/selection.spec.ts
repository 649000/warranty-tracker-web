import { describe, expect, it } from 'vitest';
import { singaporeDayStart } from './calendar.js';
import { selectDueCoverages, type CoverageRecord } from './selection.js';

const NOW = new Date('2026-09-10T12:00:00Z');
const DAY_START = singaporeDayStart(NOW); // 2026-09-09T16:00:00Z

function record(coverageId: string, productId: string, expiry: Date | null): CoverageRecord {
  return { path: `users/alice/products/${productId}/coverages/${coverageId}`, coverageId, expiry };
}

describe('selection', () => {
  it('selects coverage on the 30, 7 and expiry-day windows', () => {
    const candidates = selectDueCoverages(DAY_START, [
      record('c-today', 'p-today', new Date('2026-09-09T20:00:00Z')),
      record('c-7', 'p-7', new Date('2026-09-16T20:00:00Z')),
      record('c-30', 'p-30', new Date('2026-10-09T20:00:00Z')),
    ]);

    expect(candidates.map((c) => c.daysAhead).sort((a, b) => b - a)).toEqual([30, 7, 0]);
    expect(candidates.map((c) => c.coverageId)).toEqual(
      expect.arrayContaining(['c-today', 'c-7', 'c-30']),
    );
    expect(candidates.every((c) => c.uid === 'alice')).toBe(true);
  });

  it('excludes lifetime coverage with no expiry date', () => {
    const candidates = selectDueCoverages(DAY_START, [
      record('c-lifetime', 'p-lifetime', null),
      record('c-today', 'p-today', new Date('2026-09-09T20:00:00Z')),
    ]);
    expect(candidates.map((c) => c.coverageId)).toEqual(['c-today']);
  });

  it('excludes already-expired and off-threshold coverage', () => {
    const candidates = selectDueCoverages(DAY_START, [
      record('c-expired', 'p-expired', new Date('2026-09-08T20:00:00Z')),
      record('c-off', 'p-off', new Date('2026-09-20T20:00:00Z')),
      record('c-today', 'p-today', new Date('2026-09-09T20:00:00Z')),
    ]);
    expect(candidates.map((c) => c.coverageId)).toEqual(['c-today']);
  });

  it('includes the window start but not the exclusive window end', () => {
    const startBoundary = selectDueCoverages(DAY_START, [record('c-start', 'p-start', DAY_START)]);
    expect(startBoundary).toHaveLength(1);

    const nextDay = new Date(DAY_START.getTime() + 86_400_000);
    const endBoundary = selectDueCoverages(DAY_START, [record('c-end', 'p-end', nextDay)]);
    expect(endBoundary).toHaveLength(0);
  });
});
