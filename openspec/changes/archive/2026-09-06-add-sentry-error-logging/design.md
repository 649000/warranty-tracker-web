## Context

Angular v22 standalone app (signals, zoneless-ready), Firebase native JS SDK v12 (no AngularFire), Material 3. Providers are wired in `app.config.ts` and `core/firebase/firebase.providers.ts`; config lives in `src/environments/environment.ts` (public identifiers only). Errors are currently handled ad hoc: `provideBrowserGlobalErrorListeners()` + a `console.error` catch in `main.ts`, friendly auth messages via `toFriendlyAuthError()`, and several silent `catch {}` blocks. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Report uncaught errors, console errors, and unexpected Firebase failures to Sentry.
- Keep the integration isolated behind a small service so the rest of the app stays testable and Sentry-free.
- Disable reporting in local dev without requiring separate builds.

**Non-Goals:**
- Performance tracing, session replay, and source-map upload.
- PII scrubbing (error context is sent as-is per product decision).
- Alerting/notification workflows or Sentry release/commit tracking.

## Decisions

### 1. Use `@sentry/angular`, fall back to `@sentry/browser`

`@sentry/angular` re-exports `init`, `createErrorHandler`, `captureException`, and `captureConsoleIntegration`, which is exactly what we need. The project already avoids AngularFire because of missing Angular-22 support; `@sentry/angular` declares Angular as a peer dependency, so we must verify compatibility at install time.

- **Alternative:** `@sentry/browser` with a hand-rolled `ErrorHandler`. Chosen as the fallback: if `@sentry/angular`'s peer range excludes Angular 22, we use `@sentry/browser`'s `init`/`captureException` directly and implement a tiny `ErrorHandler` class that calls `captureException` then re-throws. The `ErrorReportingService` wrapper makes this swap transparent to the rest of the app.

### 2. Init in `main.ts` before bootstrap

Call `Sentry.init(...)` before `bootstrapApplication` so startup/early errors are captured (Sentry documents this order). Config: `dsn`, `integrations: [captureConsoleIntegration({ levels: ['error', 'warn'] })]`, and `enabled: !isDevMode()`. No tracing integrations.

### 3. Register Sentry `ErrorHandler` in `app.config.ts`

Add `{ provide: ErrorHandler, useValue: createErrorHandler() }` (or a custom `ErrorHandler` class in the fallback path). This replaces the default handler for uncaught errors; `provideBrowserGlobalErrorListeners()` stays in place for rejection/`window.onerror` wiring.

### 4. Thin `ErrorReportingService` wrapper

New `core/services/error-reporting.service.ts` exposing `captureException(error, context)` and `captureMessage(message)`. It gates on `isDevMode()` internally and wraps calls in try/catch so reporting never throws. This mirrors `AnalyticsService`'s "non-blocking by design" pattern and isolates the Sentry import for Vitest mocking.

### 5. Instrument unexpected Firebase failures, not validation errors

Auth validation errors (wrong password, email-in-use, etc.) are expected and already become friendly messages — they are not bugs and are excluded. We report *unexpected* failures only: Firestore/Storage I/O, network, and quota errors in `auth.service.ts`, `product.service.ts`, and `proof-storage.service.ts`, plus unexpected errors in the auth feature components (`login`, `signup`, `forgot-password`, `reset-password`). Each report carries a context label (e.g., operation name) so issues are traceable without leaking full user state.

### 6. DSN via `environment.ts`

Add `sentryDsn` alongside `firebaseConfig`. The DSN is a public ingest key (not a secret) and ships in the client bundle, consistent with how Firebase config is already handled. The repo has a single `environment.ts` (no prod/dev file replacement), so the same file serves all builds and `isDevMode()` gates enablement.

## Risks / Trade-offs

- **[Angular 22 peer-dep mismatch]** `@sentry/angular` may not yet list Angular 22 in its peer range → install fails or warns. Mitigation: verify at install; fall back to `@sentry/browser` + custom `ErrorHandler` (Decision 1).
- **[Noise / quota]** Capturing `console.warn` and unexpected failures could exhaust the free-tier quota. Mitigation: exclude expected validation errors and disable reporting in dev.
- **[Privacy]** Error context is sent as-is and may contain personal data (per product decision). Mitigation: accepted for now; PII scrubbing can be layered on later without changing the specs.
- **[Startup timing]** If `init` runs after a real error, early failures are missed. Mitigation: `init` runs first in `main.ts`, before bootstrap.
