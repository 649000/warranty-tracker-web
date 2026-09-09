## Context

The Angular application is a static Firebase Hosting client with Firebase Authentication, Firestore, and Storage. Coverage records are stored under each product, and expiry status is derived at read time; no backend runtime or persisted reminder state currently exists. See proposal.md for motivation and the delta specifications for required behavior.

## Goals / Non-Goals

**Goals:**

- Add a small Firebase Functions workspace alongside the Angular workspace, deployed to the existing Blaze project.
- Run one daily Asia/Singapore reminder sweep, batch reminders per recipient, and make repeated execution safe.
- Keep Firestore reads, writes, scheduler jobs, function invocations, and email volume low.
- Keep provider-specific email code isolated from reminder selection and persistence.

**Non-Goals:**

- Push notifications, SMS, arbitrary reminder schedules, timezone selection, reminder-history UI, and automated warranty renewal workflows.
- Sending an email immediately when a coverage is created or edited.
- Replacing Firebase Authentication's verification and password-reset emails.

## Decisions

### Separate Firebase Functions workspace

Create a top-level `functions/` Node/TypeScript workspace next to `src/`, with its own package manifest, TypeScript configuration, tests, and Firebase Functions entry point. `firebase.json` will define both Hosting and Functions deployment targets.

The Angular bundle remains browser-only: it reads and edits user preferences through the Firebase web SDK, while privileged scheduled work and provider credentials remain in Functions/Secret Manager. Embedding scheduled code or provider credentials in Angular would make reliable unattended delivery impossible and expose credentials.

### One daily scheduled function, scoped query

Run one scheduled function once per day after the Asia/Singapore date rolls over. It queries coverages through a Firestore collection-group query constrained to the three reminder-date windows, rather than scanning all products or users. Expiry fields must have an index appropriate to this query before deployment.

A single job is cheaper and easier to operate than one job per user or per coverage. It also fits the three free Cloud Scheduler jobs per billing account. A daily run deliberately favors predictable, calendar-day delivery over exact time-of-day delivery.

### Per-user preferences and authoritative server-side checks

Store a user-owned notification-preference document beneath the user path. A missing preference represents the default enabled state. The scheduled function consults the preference and the current Firebase Auth user record; it only sends to a verified email address.

The client may render the setting optimistically but is not authoritative for delivery eligibility. This prevents old clients, direct Firestore edits, or a changed Auth email state from causing inappropriate sends.

### Idempotent reminder ledger and daily digest

Persist one daily delivery record per user and reminder date, with a deterministic identifier, processing state, candidate coverage thresholds, provider message identifier, attempt count, and terminal outcome. Claim the record transactionally before delivery. Successful records block duplicate sends; failures have a bounded retry policy and a terminal error state.

The digest record is intentionally per user/day rather than per coverage because it produces one email. Each included coverage threshold is stored within the record so that retried sweeps neither omit nor repeat eligible content.

### Email provider adapter and secrets

Expose a narrow delivery adapter that accepts a rendered recipient digest and returns a provider message identifier or classified error. Configure the chosen transactional-email provider's API key and sender identity as Firebase-managed secrets; do not store them in source control or Firestore.

Using the Firestore Trigger Email extension was rejected: it still requires a scheduler and reminder ledger, adds an additional mail-queue data model, and ties delivery behavior to extension configuration. A direct adapter makes testing and a future provider migration simpler.

## Risks / Trade-offs

- [Scheduled execution or deployment requires Blaze services] -> Use a single job, minimum resources, budget alerts/spend caps, and monitor function/email usage.
- [A collection-group query needs an index and can grow with data] -> Add the narrow index, query only threshold dates, and paginate defensively.
- [Email is sent after a user disables reminders or changes address] -> Check preference and verified Auth email immediately before delivery; allow only one active processing claim.
- [Provider outage causes lost or duplicate reminders] -> Persist attempts and delivery state, use bounded retries, and make successful completion idempotent.
- [Links expose data through forwarded email] -> Link only to the authenticated application route; authorization continues to be enforced after sign-in.
- [Daily delivery time is not user-selectable] -> Use the documented Singapore calendar consistently and defer per-user timezones to a future capability.

## Migration Plan

1. Add the Functions workspace, required Firebase configuration, indexes, and secrets without enabling the schedule in production.
2. Deploy the function and verify it against emulator/test data and a controlled provider sandbox recipient.
3. Enable the single production schedule and monitor delivery records, function metrics, and budget alerts.
4. To roll back, pause the scheduler or disable the function trigger; retain delivery records so re-enabling does not resend completed thresholds.

## Open Questions

- Which transactional email provider and sender domain will be used? This is isolated behind the delivery adapter and can be selected during implementation without changing behavior or task structure.
