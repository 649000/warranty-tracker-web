## Context

The app has full authentication (sign-in, sign-up, password recovery, email verification, account deletion) via `AuthService` backed by Firebase Auth SDK v12. There is no account management — users cannot change their email or update their password after registration. The existing auth component conventions use Reactive Forms, Material 3, `MatSnackBar` for success/error feedback, and follow a consistent pattern of `afterNextRender` + `redirectIfAuthenticated` for guest pages.

## Goals / Non-Goals

**Goals:**
- Add account settings page accessible from the authenticated shell
- Implement email change with Firebase's `verifyBeforeUpdateEmail` (verify-first flow)
- Implement password update with current-password re-authentication
- Handle `requires-recent-login` errors with friendly messaging
- Follow existing auth component patterns (Reactive Forms, Material 3, Snackbar feedback)
- Meet WCAG AA accessibility standards

**Non-Goals:**
- Display name editing (can be added later)
- Profile picture/avatar management
- Notification preferences
- Password complexity policy changes (existing 6-char minimum stands)
- Google-only account password section (Google users have no password)

## Decisions

### Route: top-level `/account` with ShellComponent layout

**Decision:** Create a new top-level route `/account` that uses `ShellComponent` as a layout wrapper, with the account settings component as the child.

**Alternatives considered:**
1. Child of `/warranties` shell (`/warranties/account`) — semantically odd (account settings are not a warranty feature), but minimal route changes
2. New shell layout component — more flexible but adds unnecessary abstraction

**Rationale:** Reusing `ShellComponent` keeps the toolbar and account menu visible without code duplication. A top-level route keeps the URL semantically clean.

### Auth service: re-authenticate with `EmailAuthProvider.credential`

**Decision:** Add three methods to `AuthService`:
- `reauthenticate(password: string)` — re-authenticates the current user with their current email/password
- `updatePassword(currentPassword: string, newPassword: string)` — re-authenticates then calls `updatePassword`
- `changeEmail(newEmail: string, currentPassword: string)` — re-authenticates then calls `verifyBeforeUpdateEmail`

**Alternatives considered:**
1. Single generic `reauthThen` wrapper — too abstract, obscures Firebase-specific flow
2. Separate re-auth component — unnecessary, re-auth is a side effect of the operation

**Rationale:** Each method encapsulates the Firebase re-auth + operation pair. The `requires-recent-login` error is surfaced as a friendly message via the existing `toFriendlyAuthError` utility.

### Form framework: Reactive Forms (follow existing convention)

**Decision:** Use `ReactiveFormsModule` with `FormGroup`/`FormControl` for all new forms, matching the existing auth components (login, signup, reset-password).

**Alternatives considered:**
1. Signal Forms (`@angular/forms/signals`) — preferred by AGENTS.md for new forms, but no existing adoption in the codebase; mixing would be inconsistent
2. Template-driven forms — not preferred for new Angular code

**Rationale:** Consistency with sibling auth components outweighs the Signal Forms preference. Signal Forms adoption should be a separate codebase-wide migration.

### Password validation: shared with existing signup flow

**Decision:** Reuse the same `Validators.required` + `Validators.minLength(6)` for new password fields, matching the existing signup and reset-password forms.

**Rationale:** No password complexity policy change; keep validation consistent.

## Risks / Trade-offs

- **Firebase recent-login window** → Users who signed in long ago may be prompted for current password even for password change. Mitigation: the re-auth prompt is standard UX; the friendly error message explains the situation.
- **`verifyBeforeUpdateEmail` silently fails if the new email is already in use** → Mitigation: check the error code and show `email-already-in-use` friendly message (already in `auth-errors.ts`).
- **ShellComponent reuse for `/account` route** → The shell's router-outlet is designed for warranty children; the account page will work but the URL path (`/account`) is outside the warranty scope. Acceptable trade-off for toolbar consistency.

## Migration Plan

1. Implement auth service methods and error util updates (no UI changes yet)
2. Implement account settings component and route (visible in app)
3. Add menu item to shell (links to new page)
4. Test end-to-end

## Open Questions

None — all key decisions resolved during planning.
