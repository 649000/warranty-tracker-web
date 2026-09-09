## Why

Warranty status is currently visible only when a user opens the application, so a user can miss an approaching expiry despite the product's stated 60-day alert value. Proactive, low-noise email reminders make the tracker useful between visits while keeping operational costs small.

## What Changes

- Add configurable expiry-email reminders, enabled by default for verified email addresses.
- Deliver one consolidated daily email per user for coverages that reach the 30-day, 7-day, or expiry-day reminder threshold.
- Allow users to enable or disable email reminders from account settings.
- Add a daily backend reminder process with persistent delivery records to prevent duplicate sends and support reliable retries.
- Exclude lifetime and already-expired coverages from reminders.

## Capabilities

### New Capabilities

- `expiry-email-reminders`: Configurable, deduplicated email notifications for approaching warranty coverage expiries.

### Modified Capabilities

- `account-management`: Account settings gain control over expiry-email reminder delivery.

## Impact

- Affected frontend: account settings and reminder-preference data access.
- Affected Firebase systems: Firestore, Cloud Functions, Cloud Scheduler, Firebase Authentication, and Hosting deployment configuration.
- Adds a backend `functions/` workspace and a transactional-email delivery provider integration selected during implementation.
- Requires tests for reminder selection, batching, delivery deduplication, preference changes, and accessibility of account controls.
