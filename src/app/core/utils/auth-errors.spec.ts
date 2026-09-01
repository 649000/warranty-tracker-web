import { describe, expect, it } from 'vitest';
import { toFriendlyAuthError } from './auth-errors';

describe('toFriendlyAuthError', () => {
  it('maps a known error code to a friendly message', () => {
    expect(toFriendlyAuthError({ code: 'auth/wrong-password' })).toBe(
      'Incorrect password. Try again.',
    );
  });

  it('maps email-already-in-use', () => {
    expect(toFriendlyAuthError({ code: 'auth/email-already-in-use' })).toContain('already exists');
  });

  it('falls back to a generic message for unknown codes', () => {
    expect(toFriendlyAuthError({ code: 'auth/unknown-thing' })).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('falls back gracefully for non-error values', () => {
    expect(toFriendlyAuthError('boom')).toBe('Something went wrong. Please try again.');
    expect(toFriendlyAuthError(null)).toBe('Something went wrong. Please try again.');
  });
});
