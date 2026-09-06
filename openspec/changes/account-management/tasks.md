## 1. Auth Service — Re-authentication and Account Management Methods

- [x] 1.1 Add `reauthenticate(password: string)` method to `AuthService` that uses `EmailAuthProvider.credential` and `reauthenticateWithCredential`, with error reporting parity via the existing `run()` helper; verify the method is exported and TypeScript compiles
- [x] 1.2 Add `updatePassword(currentPassword: string, newPassword: string)` method to `AuthService` that calls `reauthenticate` then `updatePassword` on the Firebase user, with analytics logging; verify TypeScript compiles
- [x] 1.3 Add `changeEmail(newEmail: string, currentPassword: string)` method to `AuthService` that calls `reauthenticate` then `verifyBeforeUpdateEmail` on the Firebase user, with analytics logging; verify TypeScript compiles

## 2. Auth Error Utilities — Friendly Messages

- [x] 2.1 Add `auth/requires-recent-login` entry to `FRIENDLY_MESSAGES` in `auth-errors.ts` mapping to "For security, please sign in again before doing this." and add it to `VALIDATION_CODES`; verify the existing `auth-errors.spec.ts` still passes
- [x] 2.2 Run `npx vitest run src/app/core/utils/auth-errors.spec.ts` to confirm no regressions

## 3. Account Settings Component

- [x] 3.1 Create `src/app/features/account/account-settings.component.ts` with `ReactiveFormsModule`, Material form fields, card, button, snackbar imports; add email-change form (new email + current password) and password-change form (current password + new password + confirm); include provider detection via `user()?.providerData` to conditionally show password section; verify the component compiles
- [x] 3.2 Create `src/app/features/account/account-settings.component.html` with card layout matching existing auth pages (reuse `auth-page.css` styling), two form sections with headings, inline validation errors, submit buttons, loading states, and accessibility (labels, aria-describedby for errors); verify template renders without errors
- [x] 3.3 Create `src/app/features/account/account-settings.component.css` or confirm reuse of `auth-page.css` styles for consistent layout; verify no style regressions in sibling components

## 4. Routing and Navigation

- [x] 4.1 Add a new top-level route `account` to `app.routes.ts` with `authGuard` and lazy-loaded `AccountSettingsComponent` wrapped in `ShellComponent` layout; verify the route compiles
- [x] 4.2 Add `RouterLink` import to `ShellComponent` and add "Account settings" menu item in `shell.component.html` between the email display and sign-out items, with `routerLink="/account"` and `mat-icon` of `settings`; verify the menu renders correctly

## 5. Verification and Quality

- [x] 5.1 Run `npx ng lint` and fix any lint errors; verify clean output
- [x] 5.2 Run `npx ng build` and verify the production build succeeds with no errors
- [ ] 5.3 Manually verify: navigate to `/account` while authenticated and confirm both forms render; navigate while unauthenticated and confirm redirect to login
