## 1. Break the guard redirect loop

- [x] 1.1 Change `guestGuard` to return a plain boolean (never a `UrlTree`) and update its JSDoc; verify `npm run lint` passes.
- [x] 1.2 Add a shared `redirectIfAuthenticated` helper (or equivalent) that navigates to `/warranties` when `auth.user()` is set; verify `npm test` passes.

## 2. Redirect from the auth pages

- [x] 2.1 In `login`, `signup`, `forgot-password`, and `reset-password` components, call the helper once on init (`afterNextRender`); verify each still compiles and `npm run build` passes.
- [x] 2.2 Confirm `authGuard` still terminates (unauthenticated `/warranties` → `/login`); verify by unit test and manual check.

## 3. Tests

- [x] 3.1 Update the guard Vitest spec to assert `guestGuard` returns `true` for both states and never a redirect; verify `npm test` passes.
- [ ] 3.2 Ensure the Playwright smoke suite covers sign-up → `/warranties` and email sign-in → `/warranties`; verify `npm run e2e` passes under the emulator configuration (sign-up test goes green).

## 4. Verification & docs

- [x] 4.1 Run the full gate (`npm run format:check`, `npm run lint`, `npm test -- --watch=false`, `npm run build`); verify all pass.
- [ ] 4.2 Smoke-test email and Google login on the deployed production site; verify no white screen and a clean landing on `/warranties`.
