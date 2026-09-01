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

export function toFriendlyAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  return FRIENDLY_MESSAGES[code] ?? 'Something went wrong. Please try again.';
}
