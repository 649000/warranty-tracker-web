## Context

See proposal.md for motivation. The app is zoneless Angular v22 with signals; route guards are `canMatch` functions. Authentication uses the Firebase JS SDK v12 directly (no AngularFire). The relevant state lives in `AuthService` (`src/app/core/services/auth.service.ts`): a `user` signal, an `authReady` signal, and a `readyPromise` that guards await.

Today the `AuthService` constructor runs three things concurrently and out of order: `setPersistence` is fire-and-forget (`void`), `onAuthStateChanged` resolves `readyPromise` on its first emission (which is `null` on a fresh/redirect load), and `getRedirectResult` is called fire-and-forget. This means `guestGuard` (auth pages) and `authGuard` (private pages) can read `auth.user()` while it is still `null`, even though the session is actually signed in — the classic trigger for the two guards redirecting into each other and blanking the router outlet. Local development compounds the problem: `firebase.providers.ts` forces emulator connections via `isDevMode()`, so `ng serve` cannot reach real Firebase and login cannot be exercised or debugged locally.

## Goals / Non-Goals

**Goals:**
- Make the initial auth state settle (persistence + redirect result) before any guard reads `auth.user()`.
- Guarantee the two guards can never oscillate, so a signed-in user lands on `/warranties` exactly once.
- Make the warranty list render a deterministic loading/error/content state so a failed Firestore watch never yields a blank view.
- Let `ng serve` authenticate against real Firebase by default (Google OAuth testable locally), with emulators as an explicit opt-in.

**Non-Goals:**
- Switching Google sign-in from redirect to popup (redirect is retained for mobile/third-party-cookie reliability).
- Changing the Firestore security rules or data model.
- Any backend/CI auth changes (the separate `migrate-firebase-deploy-auth` change owns deploy auth).

## Decisions

### D1 — Emulator wiring driven by a `useEmulators` environment flag

Replace the `isDevMode()` checks in `firebase.providers.ts` with a `useEmulators` boolean read from the environment. `environment.ts` sets `useEmulators: false`, so `ng serve` targets the real Firebase project by default and Google redirect sign-in works locally. Emulators become opt-in via a dedicated environment file/build configuration used by the automated Playwright and security-rules suites (which already assume emulators).

- *Rationale*: `isDevMode()` conflates "development build" with "use emulators", making local login against real Firebase impossible. An explicit flag matches the half-finished `environment.development.ts` refactor already in the tree.
- *Alternatives considered*: keeping `isDevMode()` (rejected — cannot test Google locally); an environment variable read at runtime (rejected — adds indirection for a static decision and diverges from the project's environment-file pattern).

### D2 — Auth initialization settles before guards evaluate

Restructure `AuthService` initialization to be sequential and to resolve `readyPromise` only after the auth state is fully settled: `await setPersistence(...)` → register `onAuthStateChanged` → `await getRedirectResult(...)` → `resolveReady()`. `getRedirectResult` is also called defensively on every load (it resolves `null` with no pending redirect, so it is a no-op on ordinary loads). Guards keep awaiting `readyPromise`, but it now resolves with the final `user()` value rather than the first `null`.

- *Rationale*: the root of the loop is guards reading an unsettled `user()`. Sequencing persistence and the redirect result before settling removes the race class entirely.
- *Alternatives considered*: polling `auth.currentUser` in guards (rejected — racy and not signal-friendly); adding a separate `redirectReady` promise (rejected — `readyPromise` already exists; overloading it keeps a single, clear contract).

### D3 — Guards make a single, stable decision

With D2 in place, `authGuard` returns `true` when `user()` is set and `router.createUrlTree(['/login'])` otherwise; `guestGuard` returns `router.createUrlTree(['/warranties'])` when set and `true` otherwise. Because `user()` is stable at guard time, the two guards can no longer target each other. No behavioral change beyond relying on the settled signal; the logic is kept so `redirectAfterAuth` still honors the intended return URL.

- *Rationale*: the existing rule is correct; the bug was the unsettled input. Keeping the rule simple avoids introducing a new redirect-authority mechanism.
- *Alternatives considered*: a single "resolveDestination" helper shared by both guards (rejected — unnecessary indirection for two small pure functions).

### D4 — Warranty list renders a deterministic error/empty state

Add an `error` signal to `ProductService` set on `onSnapshot` failure (and cleared on retry). `WarrantyListComponent` templates three mutually exclusive states: loading skeleton, error (with a retry action), and content/empty. This guarantees the outlet always commits a visible view.

- *Rationale*: eliminates the blank-screen failure mode when the Firestore watch fails (permission/network) and gives the user an actionable path.
- *Alternatives considered*: relying on the skeleton forever on error (rejected — indistinguishable from a hang and leaves the user stuck).

## Risks / Trade-offs

- [Exact loop trigger not yet reproduced] → The settled-signal fix (D2) addresses the whole race class regardless of the specific navigation sequence; a reproduce/instrument task confirms it on the deployed site before code changes are finalized.
- [Emulator opt-in changes the local test workflow] → Document the new `ng serve` vs emulator commands in the README and wire the Playwright/rules suites to the emulator configuration so CI/e2e is unaffected.
- [Sequential init adds a small delay before first paint of the authenticated shell] → Negligible (two awaited Firebase calls resolve in tens of ms); the landing/auth pages render on the unguarded path in the meantime.
- [Redirect sign-in vs popup on constrained browsers] → Out of scope; redirect remains the chosen method and the settled-init fix makes it reliable.

## Migration Plan

1. Land the `useEmulators` flag + environment files and reorder `AuthService` initialization; deploy to a preview channel and verify login on the live site.
2. Add the guard reliance on the settled signal and the warranty-list error state.
3. Add/adjust Vitest (auth init, guards) and Playwright (login → `/warranties`) coverage; keep the emulator-backed suites green.
4. Deploy to `main`; smoke-test email and Google login on production.

Rollback: the change is additive (no data/schema migration); reverting the affected source files restores prior behavior.

## Open Questions

None.
