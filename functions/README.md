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

Reminders are on by default once the function is deployed, so the only required
input is the public app origin used in email links:

```bash
# APP_ORIGIN is the public app origin used in email links (hosting site).
firebase deploy --only functions \
  --set-env-vars APP_ORIGIN=https://<your-project>.web.app
```

If you are not ready to email yet (for example during verification of a fresh
environment), deploy with reminders off:

```bash
firebase deploy --only functions \
  --set-env-vars REMINDERS_ENABLED=false,APP_ORIGIN=https://<your-project>.web.app
```

### 4. Firestore indexes and rules

`firebase deploy --only firestore` publishes:

- the composite/collection-group index for
  `collectionGroup('coverages').orderBy('expiryDate')` used by the sweep
  (`firestore.indexes.json`), and
- rules that keep products/settings owner-only and deny end users the
  `reminderDeliveries` ledger (`firestore.rules`).

## Enabling the production schedule (rollout)

The default is enabled: any deploy of the function with the secrets and
`APP_ORIGIN` configured starts sending. To roll out gradually, deploy with
`REMINDERS_ENABLED=false` first, then flip it on:

1. Run the full verification gate (CI + the suites below).
2. Send a controlled sandbox digest to your own verified address and confirm
   delivery and content in the Resend dashboard.
3. Deploy with reminders on (default, or explicit `REMINDERS_ENABLED=true`):
   ```bash
   firebase deploy --only functions \
     --set-env-vars APP_ORIGIN=https://<your-project>.web.app
   ```
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

## Rollback

- **Stop sending immediately:** redeploy (or set the env var) with
  `REMINDERS_ENABLED=false`, or pause the Cloud Scheduler job
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
