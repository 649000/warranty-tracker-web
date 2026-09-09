## 1. Firebase backend foundation

- [x] 1.1 Create the top-level TypeScript Firebase Functions workspace, add the Firebase Functions deployment target, and verify the functions build succeeds.
- [x] 1.2 Add the daily Asia/Singapore scheduler configuration with minimum practical resources and verify Firebase configuration validates.
- [x] 1.3 Define Firestore indexes, notification-preference storage, and delivery-ledger storage with owner/privileged-access security rules; verify the rules tests cover owner isolation and privileged function access.
- [x] 1.4 Add documented Firebase-managed secret configuration and transactional-email provider adapter contracts; verify no provider credential or sender secret is committed to source control.

## 2. Reminder selection and delivery

- [x] 2.1 Implement collection-group selection for the 30-day, 7-day, and expiry-day Singapore calendar windows while excluding lifetime and expired coverage; verify focused unit tests cover each threshold and exclusion.
- [x] 2.2 Implement recipient grouping and daily digest rendering that lists only the recipient's products and coverage and links to authenticated warranty detail routes; verify rendering tests cover a multi-coverage digest.
- [x] 2.3 Implement verified-email and opt-out eligibility checks against Firebase Auth and the stored preference; verify tests cover verified defaults, unverified users, and disabled reminders.
- [x] 2.4 Implement transactional daily delivery claims, success/failure persistence, and bounded retry behavior; verify repeat scheduler executions do not duplicate a successful coverage threshold.
- [x] 2.5 Integrate the selected transactional email provider through the adapter and verify sandbox delivery plus classified provider-error handling.

## 3. Account preference experience

- [x] 3.1 Add a notification-preference service using the Firebase web SDK and verify it reads the enabled default when no preference document exists.
- [x] 3.2 Add an accessible expiry-email reminder control to Account Settings with save/error feedback and verify component tests and axe coverage for keyboard operation, labeling, and announcement behavior.
- [x] 3.3 Update the account settings data and Firestore rules tests so users can change only their own notification preference; verify existing account-management behavior remains intact.

## 4. Verification and rollout

- [x] 4.1 Add Functions emulator/integration coverage for scheduled selection, batching, idempotency, retries, and privacy boundaries; verify the test suite passes against emulator-backed data.
- [x] 4.2 Add deployment documentation for provider setup, sender verification, Firebase secrets, schedule enablement, budget alerts/spend caps, and rollback; verify the documented setup is sufficient for a clean environment.
- [x] 4.3 Run formatting, linting, frontend tests, Functions tests, security-rules tests, production builds, and Playwright accessibility smoke tests; verify all required checks pass before enabling the production schedule.
