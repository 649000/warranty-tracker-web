## Why

On the deployed Firebase site, signing in (email/password or Google) lands the user on a blank white page with no console error; the browser reports "this page is slowing down", the signature of an endless navigation loop. The same loop makes the app unusable, and local debugging is currently impossible because `ng serve` forcibly wires auth/firestore/storage to the Firebase emulators (via `isDevMode()`), so login does not work locally either.

## What Changes

- Fix the post-sign-in navigation so an authenticated user always lands on `/warranties` without entering a redirect loop between the `guestGuard` (auth pages) and `authGuard` (private pages).
- Stabilize the auth initialization ordering so guards read a settled `user()` value: `setPersistence` is awaited, `getRedirectResult` completes before guards evaluate, and guards await a dedicated settled-auth signal rather than the first `onAuthStateChanged` emission (which is `null` on a fresh load).
- Give the warranties list a guaranteed `loaded`/`error` transition and an error fallback so a failed Firestore watch can no longer leave a blank view.
- Make local login testable by replacing `isDevMode()` emulator wiring with a `useEmulators` environment flag, so `ng serve` targets real Firebase by default (real Google OAuth works locally) and emulators are opt-in.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-auth`: The system must land a signed-in user on the warranty list after sign-in and after a Google redirect, without a blank or looping state; auth initialization must settle before route guards evaluate; local development must authenticate via the `useEmulators` environment flag.

## Impact

- `src/app/core/services/auth.service.ts` — auth init ordering, `setPersistence`/`getRedirectResult` sequencing, settled-auth signal.
- `src/app/core/guards/auth.guard.ts` — `authGuard`/`guestGuard` read the settled signal; redirect logic made non-oscillating.
- `src/app/core/firebase/firebase.providers.ts` — emulator wiring driven by `useEmulators` instead of `isDevMode()`.
- `src/environments/environment.ts` (+ restored `environment.development.ts`) — `useEmulators` flag.
- `src/app/features/warranties/warranty-list.component.ts` (+ template) — error/empty fallback.
- Tests: Vitest unit tests for `AuthService`/guards; Playwright smoke coverage for login → `/warranties`.
