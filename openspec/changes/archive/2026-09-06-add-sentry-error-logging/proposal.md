## Why

The app has no structured error monitoring. Uncaught errors only reach `console.error` (via `provideBrowserGlobalErrorListeners()` and the `bootstrapApplication(...).catch(...)` fallback in `main.ts`), and Firebase Auth/Firestore/Storage failures either propagate silently or surface only as friendly snackbar messages. This gives zero visibility into real production failures, making regressions hard to detect and diagnose.

## What Changes

- Integrate Sentry for error logging.
- Capture global uncaught exceptions and unhandled promise rejections via a Sentry-backed Angular `ErrorHandler`.
- Capture `console.error` / `console.warn` output.
- Report unexpected Firebase Auth/Firestore/Storage operational failures (with operation context) while keeping expected auth validation errors as friendly messages only.
- Add a `sentryDsn` configuration value to `src/environments/environment.ts`.
- Disable reporting in local development (`isDevMode()`) to avoid dev noise.

## Capabilities

### New Capabilities

- `error-logging`: Captures and reports application errors to Sentry — global uncaught errors, console errors, and unexpected Firebase/Auth/Firestore/Storage failures.

### Modified Capabilities

<!-- None. This change adds a new capability and does not alter the requirements of existing specs. -->

## Impact

- **Dependencies**: add `@sentry/angular` (with a documented fallback to `@sentry/browser` if Angular 22 peer-dependency compatibility is an issue).
- **Code**:
  - `src/main.ts` — Sentry `init()` before bootstrap.
  - `src/app/app.config.ts` — register Sentry `ErrorHandler` provider.
  - New `src/app/core/services/error-reporting.service.ts` — thin wrapper around Sentry capture APIs.
  - `src/app/core/services/{auth,product,proof-storage}.service.ts` and auth feature components — report unexpected failures.
  - `src/environments/environment.ts` — `sentryDsn` value.
- **Services**: Sentry SaaS (free tier), consistent with the "keep on Firebase free tier / avoid unnecessary paid services" constraint.
- **Privacy**: error context is sent to Sentry as-is (no PII scrubbing in this change).
