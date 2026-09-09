import { describe, expect, it } from 'vitest';
import { isEligibleForReminder } from './eligibility.js';

describe('eligibility', () => {
  it('is eligible for a verified address with no stored preference', () => {
    expect(isEligibleForReminder({ email: 'a@example.com', emailVerified: true })).toBe(true);
  });

  it('is eligible for a verified address with reminders enabled', () => {
    expect(
      isEligibleForReminder({
        email: 'a@example.com',
        emailVerified: true,
        preferenceEnabled: true,
      }),
    ).toBe(true);
  });

  it('excludes unverified addresses', () => {
    expect(isEligibleForReminder({ email: 'a@example.com', emailVerified: false })).toBe(false);
  });

  it('excludes missing email', () => {
    expect(isEligibleForReminder({ email: null, emailVerified: true })).toBe(false);
  });

  it('excludes users who disabled reminders', () => {
    expect(
      isEligibleForReminder({
        email: 'a@example.com',
        emailVerified: true,
        preferenceEnabled: false,
      }),
    ).toBe(false);
  });
});
