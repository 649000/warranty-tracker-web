## Why

After a user signs in or signs up, the app enters an infinite router redirect loop: the `guestGuard` repeatedly redirects the authenticated user to `/warranties` (~2,400 invocations per second) without the `/warranties` `authGuard` ever being reached. The router outlet never commits a route, so the page is blank white and the browser reports "this page is slowing down". This is the same loop behind the original login white-screen bug, and it also hangs the sign-up Playwright test.

## What Changes

- Break the infinite redirect loop so that a user who becomes authenticated while on a guest page (`/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`) lands on `/warranties` exactly once, with no white screen or runaway loop.
- Replace the `canMatch` guard returning `createUrlTree(['/warranties'])` (the loop trigger) with a non-oscillating mechanism for the "already authenticated" redirect.
- Ensure the `authGuard`-protected `/warranties` route is actually reached and matched when the authenticated redirect fires.
- Add regression coverage (unit + Playwright) proving sign-up and sign-in each land on `/warranties` without a loop.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-auth`: After sign-in or sign-up, an authenticated user who is on a guest page SHALL be redirected to the warranty list exactly once and land there without an endless redirect loop or blank screen.

## Impact

- `src/app/core/guards/auth.guard.ts` — `guestGuard` (and, by symmetry, `authGuard`) redirect logic; remove the loop trigger.
- `src/app/app.routes.ts` — route/guard wiring if the redirect is moved out of the guard.
- `src/app/features/auth/*.component.ts` — auth pages may handle the "already authenticated" redirect directly.
- `src/app/core/services/auth.service.ts` — unchanged, but `redirectAfterAuth` is the reference destination.
- Tests: Vitest guard tests; Playwright sign-up and sign-in → `/warranties` smoke coverage.
