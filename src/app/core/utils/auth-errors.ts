const FRIENDLY_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/invalid-email': 'That email address doesn’t look right. Check it and try again.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/wrong-password': 'Incorrect password. Try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'No account found for this email.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled for this app.',
  'auth/account-exists-with-different-credential':
    'An account already exists for this email with a different sign-in method.',
  'auth/unauthorized-domain': 'This domain is not authorized for sign-in.',
  'auth/popup-closed-by-user': 'Sign-in window was closed before finishing.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/redirect-cancelled-by-user': 'Sign-in was cancelled.',
  'auth/requires-recent-login': 'For security, please sign in again before doing this.',
  'auth/user-disabled': 'This account has been disabled.',
};

/** Auth codes that represent expected, user-facing validation rather than bugs. */
const VALIDATION_CODES = new Set<string>([
  'auth/email-already-in-use',
  'auth/invalid-email',
  'auth/weak-password',
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/user-not-found',
  'auth/account-exists-with-different-credential',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/redirect-cancelled-by-user',
  'auth/requires-recent-login',
]);

function authErrorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';
}

export function toFriendlyAuthError(error: unknown): string {
  return FRIENDLY_MESSAGES[authErrorCode(error)] ?? 'Something went wrong. Please try again.';
}

/** True when the error is an expected validation failure, not an operational one. */
export function isExpectedAuthError(error: unknown): boolean {
  const code = authErrorCode(error);
  return code !== '' && VALIDATION_CODES.has(code);
}
