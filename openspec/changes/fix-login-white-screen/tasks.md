## 1. Unblock local sign-in (environment flag)

- [x] 1.1 Add `useEmulators: false` to `src/environments/environment.ts` alongside the real `firebaseConfig`; verify `npm run build` succeeds and the config shape is consistent with `@env/environment` consumers.
- [x] 1.2 Add `src/environments/environment.development.ts` with `useEmulators: true` and the real `firebaseConfig`; verify `npx tsc --noEmit -p tsconfig.app.json` resolves the `@env` alias without errors.
- [x] 1.3 Replace the `isDevMode()` emulator gating in `src/app/core/firebase/firebase.providers.ts` with the `useEmulators` flag (connect emulators only when `useEmulators` is true); verify `npm run lint` and `npm run build` pass.
- [x] 1.4 Point the emulator-based suites (Playwright `webServer` and the rules-test command) at the development configuration; verify `npm run test:rules` passes against the emulators.
- [ ] 1.5 Start `ng serve` and confirm the login page loads without emulator connection errors in the Network tab; verify sign-in against real Firebase is reachable.

## 2. Reproduce the loop

- [ ] 2.1 Sign in locally via email/password against real Firebase and confirm the white screen reproduces; verify by observing runaway navigation in the DevTools Performance profiler with no console error.

## 3. Stabilize auth initialization

- [x] 3.1 Reorder the `AuthService` constructor to `await setPersistence` → register `onAuthStateChanged` → `await getRedirectResult` → `resolveReady()` (see design.md D2); verify `npm test` (existing `AuthService` unit tests) still passes.
- [x] 3.2 Confirm `getRedirectResult` is awaited and a Google redirect logs `sign_in`; verify a Google redirect sign-in lands on `/warranties` locally with no loop.

## 4. Non-oscillating guards

- [x] 4.1 Verify `authGuard`/`guestGuard` read the settled `user()` and cannot target each other (no logic drift beyond relying on the settled signal); verify navigating to `/login` while authenticated lands on `/warranties` exactly once.

## 5. Warranty list render states

- [x] 5.1 Add an `error` signal to `ProductService` set on `onSnapshot` failure and cleared on retry; verify a unit test covers the error path.
- [x] 5.2 Add mutually exclusive loading/error/empty branches to the warranty-list template with a retry action; verify blocking Firestore shows the error state rather than a blank view.

## 6. Tests

- [x] 6.1 Add Vitest unit tests for auth initialization ordering and guard behavior; verify `npm test` passes.
- [ ] 6.2 Add/extend Playwright coverage for email login → `/warranties` and Google login → `/warranties`; verify `npm run e2e` passes under the emulator configuration.

## 7. Verification & docs

- [x] 7.1 Run the full gate (`npm run format:check`, `npm run lint`, `npm test -- --watch=false`, `npm run build`); verify all pass.
- [x] 7.2 Update the README's local-run and emulator instructions to match the `useEmulators` flag behavior; verify the documented commands reproduce the intended environments.
- [ ] 7.3 Smoke-test email and Google login on the deployed production site after release; verify no white screen and a clean landing on `/warranties`.
