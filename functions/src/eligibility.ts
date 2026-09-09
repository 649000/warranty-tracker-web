export interface EligibilityInput {
  email: string | null | undefined;
  emailVerified: boolean | undefined;
  /** Notification preference: `false` disables; absent means enabled by default. */
  preferenceEnabled?: boolean;
}

/** Verified address, reminders enabled (default), non-disabled preference. */
export function isEligibleForReminder(input: EligibilityInput): boolean {
  return Boolean(input.email && input.emailVerified === true && input.preferenceEnabled !== false);
}
