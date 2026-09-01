import { describe, expect, it } from 'vitest';
import {
  coverageExpiry,
  coverageStatus,
  nextExpiry,
  productStatus,
  EXPIRING_SOON_THRESHOLD_DAYS,
} from './coverage-status';
import type { Coverage } from '../models/warranty.model';

function coverage(overrides: Partial<Coverage> = {}): Coverage {
  return {
    id: 'c1',
    source: 'manufacturer',
    scope: 'local',
    duration: { months: 12 },
    startDate: new Date(2024, 0, 15),
    expiryDate: null,
    manualExpiry: false,
    ...overrides,
  };
}

describe('coverageExpiry', () => {
  it('computes expiry from start date plus months', () => {
    const c = coverage({ startDate: new Date(2024, 0, 15), duration: { months: 12 } });
    expect(coverageExpiry(c)).toEqual(new Date(2025, 0, 15));
  });

  it('handles month-end overflow', () => {
    const c = coverage({ startDate: new Date(2024, 0, 31), duration: { months: 1 } });
    expect(coverageExpiry(c)).toEqual(new Date(2024, 1, 29));
  });

  it('returns null for lifetime coverages', () => {
    const c = coverage({ duration: { lifetime: true } });
    expect(coverageExpiry(c)).toBeNull();
  });

  it('prefers an explicit expiry over duration math', () => {
    const c = coverage({
      duration: { months: 12 },
      expiryDate: new Date(2026, 5, 30),
    });
    expect(coverageExpiry(c)).toEqual(new Date(2026, 5, 30));
  });
});

describe('coverageStatus', () => {
  const today = new Date(2026, 0, 15);

  it('is active far beyond the threshold', () => {
    const c = coverage({ expiryDate: new Date(2027, 0, 15) });
    expect(coverageStatus(c, today)).toBe('active');
  });

  it('is active exactly at the threshold boundary day', () => {
    const c = coverage({ expiryDate: new Date(2026, 2, 15) });
    expect(EXPIRING_SOON_THRESHOLD_DAYS).toBe(60);
    expect(coverageStatus(c, today)).toBe('expiring-soon');
  });

  it('is expiring soon when within 60 days', () => {
    const c = coverage({ expiryDate: new Date(2026, 2, 1) });
    expect(coverageStatus(c, today)).toBe('expiring-soon');
  });

  it('is expired the day after expiry', () => {
    const c = coverage({ expiryDate: new Date(2026, 0, 14) });
    expect(coverageStatus(c, today)).toBe('expired');
  });

  it('is active on the expiry date itself', () => {
    const c = coverage({ expiryDate: new Date(2026, 0, 15) });
    expect(coverageStatus(c, today)).toBe('expiring-soon');
  });

  it('lifetime coverages are always active', () => {
    const c = coverage({ duration: { lifetime: true }, expiryDate: null });
    expect(coverageStatus(c, today)).toBe('active');
  });
});

describe('nextExpiry', () => {
  const today = new Date(2026, 0, 15);

  it('returns the earliest non-expired expiry', () => {
    const coverages = [
      coverage({ expiryDate: new Date(2026, 5, 1) }),
      coverage({ expiryDate: new Date(2026, 2, 1) }),
      coverage({ expiryDate: new Date(2026, 8, 1) }),
    ];
    expect(nextExpiry(coverages, today)).toEqual(new Date(2026, 2, 1));
  });

  it('ignores expired coverages', () => {
    const coverages = [
      coverage({ expiryDate: new Date(2025, 5, 1) }),
      coverage({ expiryDate: new Date(2026, 5, 1) }),
    ];
    expect(nextExpiry(coverages, today)).toEqual(new Date(2026, 5, 1));
  });

  it('returns null when all are expired or lifetime only', () => {
    expect(nextExpiry([coverage({ expiryDate: new Date(2025, 5, 1) })], today)).toBeNull();
    expect(
      nextExpiry([coverage({ duration: { lifetime: true }, expiryDate: null })], today),
    ).toBeNull();
  });
});

describe('productStatus', () => {
  const today = new Date(2026, 0, 15);

  it('is active when only far-future coverages exist', () => {
    const coverages = [coverage({ expiryDate: new Date(2027, 0, 15) })];
    expect(productStatus(coverages, today)).toBe('active');
  });

  it('is expiring-soon when the soonest coverage is within the window', () => {
    const coverages = [
      coverage({ expiryDate: new Date(2026, 1, 1) }),
      coverage({ expiryDate: new Date(2027, 0, 15) }),
    ];
    expect(productStatus(coverages, today)).toBe('expiring-soon');
  });

  it('is expired when all coverages expired', () => {
    const coverages = [coverage({ expiryDate: new Date(2025, 5, 1) })];
    expect(productStatus(coverages, today)).toBe('expired');
  });

  it('is expired with no coverages', () => {
    expect(productStatus([], today)).toBe('expired');
  });

  it('lifetime keeps the product active even with an expired one', () => {
    const coverages = [
      coverage({ duration: { lifetime: true }, expiryDate: null }),
      coverage({ expiryDate: new Date(2025, 5, 1) }),
    ];
    expect(productStatus(coverages, today)).toBe('active');
  });
});
