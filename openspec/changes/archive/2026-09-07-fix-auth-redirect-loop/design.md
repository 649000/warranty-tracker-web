## Context

See proposal.md for motivation. Instrumentation of the sign-up flow (browser console + CDP stack sampling against the Firebase emulators) confirmed the failure precisely: after `createUserWithEmailAndPassword`, `onAuthStateChanged` fires exactly twice (`null`, then the signed-up user) — the auth state is stable, not flip-flopping. The loop is the `guestGuard` (`src/app/core/guards/auth.guard.ts`) being re-invoked ~2,400 times/second with the user non-null, each time returning `router.createUrlTree(['/warranties'])`; the `/warranties` `authGuard` is **never** reached. This is the same class of failure as Angular issue #43040 ("createUrlTree … infinite loop"). The `fix-login-white-screen` change fixed auth-init ordering (redirect result settling) but not this guard redirect loop — this is the actual cause of the original production white screen.

## Goals / Non-Goals

**Goals:**
- Eliminate the infinite redirect so an authenticated user lands on `/warranties` exactly once.
- Keep the "authenticated users are kept off guest pages" behavior intact.
- Add regression tests that fail on the loop.

**Non-Goals:**
- Changing the auth-init ordering (already addressed in `fix-login-white-screen`).
- Migrating from `canMatch` to a different guard type wholesale.
- Reworking the Firestore security rules or data model.

## Decisions

### D1 — Move the "already authenticated" redirect out of `guestGuard`

`guestGuard` stops returning a `UrlTree`; it returns a plain boolean (`true`) so guest routes always match. The redirect to `/warranties` moves into the auth-page components (`login`, `signup`, `forgot-password`, `reset-password`), which check `auth.user()` once on init (via `afterNextRender`) and `navigateByUrl('/warranties')` if already authenticated.

- *Rationale*: the loop is the guard returning a redirect while the router is matching. Removing the redirect from the `canMatch` phase eliminates the re-entrant navigation entirely. The component-level redirect is a single, non-cyclic `navigateByUrl`, and `authGuard` on `/warranties` returns `true` for an authenticated user, so the redirect terminates.
- *Alternatives considered*:
  - `redirectTo` with a function — rejected: the function cannot inject `AuthService` (no DI context in route config), so it would need a global singleton.
  - A single consolidated guard — rejected: more churn for the same result; the component-level redirect is smaller and clearer.
  - Keep the guard redirect and "fix" `createUrlTree` — rejected: the loop is inherent to re-entrant matching, and a component redirect is more robust.

### D2 — Keep `authGuard`'s redirect, verify it terminates

`authGuard` (on `/warranties`) redirects unauthenticated users to `/login`. This is safe: `guestGuard` on `/login` returns `true` for a null user (no redirect), so the chain `/warranties → /login` terminates. Leave it unchanged, but add a unit test asserting the two guards no longer redirect into each other.

### D3 — Regression tests

Add Vitest coverage asserting `guestGuard` returns `true` (never a `UrlTree`) for both authenticated and unauthenticated users, and Playwright smoke coverage for sign-up and email sign-in landing on `/warranties` (no loop). The existing sign-up e2e test is currently red because of this bug; it will go green once fixed.

## Risks / Trade-offs

- [Component-level redirect briefly flashes the guest page before redirecting] → The redirect runs in `afterNextRender`, so the flash is one frame; acceptable, and `guestGuard` still prevents a logged-in user from doing anything meaningful on the page.
- [Multiple auth pages each duplicate the redirect] → Extract a tiny shared helper (e.g., a `redirectIfAuthenticated(auth, router)` function or a base class) to keep it DRY.
- [The exact router-internal reason `authGuard` is never reached remains unconfirmed] → It does not change the chosen fix (D1 removes the loop trigger outright); a task records the observation for future reference.

## Migration Plan

1. Implement D1 (guard returns boolean; components redirect) and D2 (verify authGuard).
2. Add/adjust unit and Playwright tests (D3); confirm the previously-red sign-up e2e now passes and sign-in lands on `/warranties`.
3. Deploy and smoke-test email + Google login on production.

Rollback: revert to the guard-based redirect (reintroduces the loop) — not a recommended state, but the change is isolated to the guard + auth components.

## Open Questions

None.
