import { addMonths, differenceInCalendarDays, startOfDay } from 'date-fns';
import type { Coverage } from '../models/warranty.model';

export const EXPIRING_SOON_THRESHOLD_DAYS = 60;

export type CoverageStatus = 'active' | 'expiring-soon' | 'expired';

/**
 * Computes the expiry date for a coverage:
 * explicit expiry wins, otherwise startDate + duration in months.
 * Lifetime coverages never expire (null).
 */
export function coverageExpiry(
  coverage: Pick<Coverage, 'startDate' | 'duration' | 'expiryDate'>,
): Date | null {
  if (coverage.expiryDate) {
    return coverage.expiryDate;
  }
  if (coverage.duration.lifetime) {
    return null;
  }
  if (coverage.duration.months != null) {
    return addMonths(coverage.startDate, coverage.duration.months);
  }
  return null;
}

export function coverageStatus(
  coverage: Pick<Coverage, 'startDate' | 'duration' | 'expiryDate'>,
  today: Date = new Date(),
  thresholdDays = EXPIRING_SOON_THRESHOLD_DAYS,
): CoverageStatus {
  const expiry = coverageExpiry(coverage);
  if (expiry === null) {
    return 'active';
  }
  const days = differenceInCalendarDays(expiry, startOfDay(today));
  if (days < 0) {
    return 'expired';
  }
  if (days <= thresholdDays) {
    return 'expiring-soon';
  }
  return 'active';
}

/**
 * The earliest non-expired expiry among coverages, or null if none.
 */
export function nextExpiry(coverages: Coverage[], today: Date = new Date()): Date | null {
  const day = startOfDay(today);
  let earliest: Date | null = null;
  for (const coverage of coverages) {
    const expiry = coverageExpiry(coverage);
    if (expiry !== null && expiry >= day) {
      if (earliest === null || expiry < earliest) {
        earliest = expiry;
      }
    }
  }
  return earliest;
}

/**
 * Product status: covered while any coverage is active, with the soonest
 * expiring coverage driving the "expiring-soon" signal. All expired (or no
 * coverages) => expired.
 */
export function productStatus(
  coverages: Pick<Coverage, 'startDate' | 'duration' | 'expiryDate'>[],
  today: Date = new Date(),
  thresholdDays = EXPIRING_SOON_THRESHOLD_DAYS,
): CoverageStatus {
  if (coverages.length === 0) {
    return 'expired';
  }
  let hasActive = false;
  let hasSoon = false;
  for (const coverage of coverages) {
    const status = coverageStatus(coverage, today, thresholdDays);
    if (status === 'expiring-soon') {
      hasSoon = true;
    } else if (status === 'active') {
      hasActive = true;
    }
  }
  if (hasSoon) {
    return 'expiring-soon';
  }
  if (hasActive) {
    return 'active';
  }
  return 'expired';
}
