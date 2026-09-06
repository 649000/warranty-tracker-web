## 1. Dependency & configuration

- [x] 1.1 Add `@sentry/angular` to `package.json` and verify install succeeds with no Angular-22 peer-dependency conflict (`npm install`). If it conflicts, use `@sentry/browser` instead and note it for later tasks.
- [x] 1.2 Add `sentryDsn` to `src/environments/environment.ts` and verify `npm run build` still compiles.

## 2. Sentry initialization

- [x] 2.1 Call `init({ dsn, integrations: [captureConsoleIntegration({ levels: ['error', 'warn'] })], enabled: !isDevMode() })` in `src/main.ts` before `bootstrapApplication`, and verify `npm run build` passes and a dev server starts without errors.
- [x] 2.2 Register the Sentry `ErrorHandler` provider in `src/app/app.config.ts` (or a custom `ErrorHandler` if using the `@sentry/browser` fallback), and verify `npm run lint` and `npm run test` pass.

## 3. Error reporting service

- [x] 3.1 Create `src/app/core/services/error-reporting.service.ts` exposing `captureException(error, context)` and `captureMessage(message)` with dev-mode gating and non-throwing behavior, and verify a Vitest unit test for the service passes (`npm run test`).

## 4. Instrument Firebase failures

- [x] 4.1 Report unexpected failures in `auth.service.ts` (network/operational errors, not validation) and verify existing auth service behavior is unchanged.
- [x] 4.2 Report unexpected Firestore failures in `product.service.ts` and Storage failures in `proof-storage.service.ts`, and verify the unit/component test suite passes (`npm run test`).
- [x] 4.3 Report unexpected (non-validation) errors in the auth feature components (`login`, `signup`, `forgot-password`, `reset-password`) while keeping friendly messages, and verify tests pass.

## 5. Verification

- [x] 5.1 Run `npm run lint`, `npm run test`, and `npm run build` and confirm all pass.
- [x] 5.2 Manually verify via dev server that a triggered error (e.g., an unhandled exception in a component) is reported in the Sentry project dashboard in a non-dev build, and that dev mode produces no Sentry events.
