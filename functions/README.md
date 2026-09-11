# Firebase Functions — Expiry Email Reminders

The `functions/` workspace deploys a single Cloud Function that sweeps Firestore
once per day (Asia/Singapore calendar) and emails users a consolidated digest
when warranty coverage reaches the 30-day, 7-day, or expiry-day threshold.

## Architecture

- `src/index.ts` — thin scheduler entry point (`onSchedule`) wiring params,
  secrets, and the provider adapter. Delivery is **on by default**
  (`REMINDERS_ENABLED` default `true`) since the daily run is near-zero cost;
  deploy with `REMINDERS_ENABLED=false` if you need it off.
- `src/calendar.ts` — pure Singapore calendar/window math.
- `src/selection.ts` — collection-group query over `coverages.expiryDate` within
  the three threshold windows; lifetime and already-expired coverages never
  match. Paginated defensively.
- `src/eligibility.ts` — pure verified-email + opt-out predicate.
- `src/render.ts` — pure digest renderer (HTML + text) linking to
  `{APP_ORIGIN}/warranties/{productId}`.
- `src/ledger.ts` — transactional delivery ledger per `users/{uid}/reminderDeliveries/{YYYY-MM-DD}`
  with bounded retries (max 3 attempts) and a stale-processing lease.
- `src/process.ts` — orchestrator (`runDailyReminders`) shared by the scheduler
  and the emulator test suite.
- `src/delivery/adapter.ts` + `src/delivery/resend.ts` — provider-agnostic
  adapter contract and the Resend implementation (fetch-based, no SDK).

## Prerequisites

1. A Blaze (pay-as-you-go) Firebase project. Free tier only covers scheduled
   functions during the Spark plan trial, so this feature requires Blaze plus
   spend controls (see below).
2. Node 22 and `firebase-tools`.

## Clean-environment setup

Run the following against a fresh clone **before** the first production deploy
of the function:

### 1. Configure Firebase secrets

Credentials are never stored in source control or Firestore. They live in
Firebase-managed secrets:

```bash
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set EMAIL_FROM
```

`EMAIL_FROM` is the verified sender address, e.g. `reminders@yourdomain.com`.

### 2. Verify the sender domain

With Resend, add the sending domain and verify the returned DNS records
(SPF/DKIM) in the Resend dashboard. Emails only deliver from a verified sender
identity. For local/dev testing, Resend sandbox mode can send to your own
account email before the domain is verified.

### 3. Configure runtime params

Reminders are on by default once the function is deployed, and `APP_ORIGIN`
defaults to the app's hosting site. A tracked `functions/.env` file pins these
non-secret defaults so non-interactive (CI) deploys don't prompt for values:

```dotenv
# functions/.env
REMINDERS_ENABLED=true
APP_ORIGIN=https://warranty-tracker-33dc5.web.app
```

To keep reminders off during verification, override the value for your local
deploy (e.g. set `REMINDERS_ENABLED=false` in that file, or add a
project-scoped `.env.<projectId>` that wins over `.env`).

### 4. Firestore indexes and rules

`firebase deploy --only firestore` publishes:

- the composite/collection-group index for
  `collectionGroup('coverages').orderBy('expiryDate')` used by the sweep
  (`firestore.indexes.json`), and
- rules that keep products/settings owner-only and deny end users the
  `reminderDeliveries` ledger (`firestore.rules`).

## Enabling the production schedule (rollout)

Reminders default to enabled and `APP_ORIGIN` defaults to the hosting site, so
a normal deploy starts sending. To roll out gradually, deploy with reminders
off first (see the env-file override above), then remove that override:

1. Run the full verification gate (CI + the suites below).
2. Send a controlled sandbox digest to your own verified address and confirm
   delivery and content in the Resend dashboard.
3. Deploy normally (reminders on by default).
4. Monitor delivery records (`users/{uid}/reminderDeliveries/{date}`) for
   `state: success`/`terminal_error`, the function error rate, and budget
   alerts for the first week.

## Budget alerts and spend caps

- Create a **budget alert** in Google Cloud Billing at ~50%/90%/100% of a small
  monthly amount so unexpected email volume or invocations page you.
- The function uses the minimum practical resources (256 MiB memory, 300 s
  timeout) and runs once/day. Watch Cloud Scheduler, function invocations, and
  Resend volume in the provider dashboard.
- Consider a provider-side sending limit/alert in Resend for extra safety.

## Abuse and cost guardrails

Firestore, Storage, and Auth are client-writable, so these guardrails limit what
a scripted or throwaway account can spend. Most are enforced in security rules
(deployed with `firebase deploy --only firestore,storage`); a few are console
settings that must be configured once per project.

### Enforced in this repo

- **Verified email required.** `firestore.rules` gates all user-data reads and
  writes on `request.auth.token.email_verified == true`. Unverified password
  users are routed to `/verify-email` by `emailVerifiedGuard`; Google sign-in
  users are already verified. This removes the cheapest abuse path (throwaway
  accounts writing data).
- **Field-shape validation.** Products, coverages, and settings are checked
  against an allowlist of keys, types, enums, and string-length caps, so junk or
  oversized documents are rejected.
- **Storage upload limits.** `storage.rules` caps proofs at 5 MB and restricts
  content types to `image/*` or `application/pdf`, bounding Storage bytes/egress.
- **Bounded cleanup.** Account deletion recursively removes every proof file so
  Storage is not left billing for orphaned objects.

### Configure once in the Firebase / GCP console

1. **App Check (strongest anti-scripting control).** Enable the reCAPTCHA
   Enterprise API in Google Cloud, create a score-based **Website** key (never
   add `localhost`), then register the web app with the **reCAPTCHA Enterprise**
   provider in Firebase console → App Check → Apps and paste the site key. Put
   the same site key in `src/environments/environment.ts` (`appCheckSiteKey`),
   deploy the web app, then enable **enforcement** for Cloud Firestore and Cloud
   Storage. Start in _monitor_ mode and watch the App Check metrics for
   legitimate traffic before enforcing. For local/dev builds without the
   emulator, set `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` before bootstrapping.
2. **Budget alerts.** Google Cloud Billing → Budgets & alerts at ~50%/90%/100%
   of a small monthly amount. Firestore has no native hard cap, so alerts are
   the safety net; the reminder function's `REMINDERS_ENABLED=false` env flag and
   `gcloud scheduler jobs pause` remain the manual kill switches.
3. **Usage quotas/alerts.** Cloud console → Quotas (and Cloud Monitoring) for
   Cloud Firestore, Cloud Storage, and Identity Toolkit; alert on unusual read,
   write, storage-byte, and sign-in volume.
4. **Auth abuse protection.** Firebase console → Authentication → Settings:
   enable **email enumeration protection**. Review the default Identity Toolkit
   quotas and lower them if appropriate.
5. **Provider limit.** Set a Resend sending limit/alert for the verified sender.

## Rollback

- **Stop sending immediately:** redeploy with `REMINDERS_ENABLED=false` (via the
  env-file override above), or pause the Cloud Scheduler job
  (`gcloud scheduler jobs pause` for the `sendExpiryReminders` job) / delete the
  schedule in the Firebase console.
- Delivery records are retained, so re-enabling never resends thresholds that
  already reached `state: success`.

## Testing

```bash
# Unit tests (pure modules; no emulator)
npm run test:functions

# Rules tests (Firestore emulator)
npm run test:rules

# Emulator integration tests for the full sweep
npm run test:functions:emulator
```

## Operation decisions

- **Provider:** Resend is the first provider, isolated behind
  `src/delivery/adapter.ts`. Swapping providers only changes `delivery/`.
- **Timezone:** reminders are defined on the Asia/Singapore calendar
  (`SCHEDULE_TIME_ZONE` in `src/config.ts`); per-user timezones are out of
  scope.
- **Retries:** at most 3 send attempts per user/date; a fourth failure moves the
  record to `terminal_error`. Stale `processing` claims older than one hour can
  be reclaimed.
