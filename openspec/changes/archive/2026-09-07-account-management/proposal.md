## Why

The app has full authentication (sign-in, sign-up, password recovery, email verification, account deletion) but no way for a signed-in user to manage their own account settings. Users need to be able to change their email and update their password without contacting support.

## What Changes

- New guarded Account Settings page accessible from the existing account menu
- Change email flow: requires current password, uses `verifyBeforeUpdateEmail` so the old email remains active until the new address is verified via emailed link
- Update password flow: requires current password, new password + confirmation, validation, friendly errors
- New `AuthService` methods for re-authentication, email update, and password update
- Extended auth-error messages for re-authentication and email-in-use scenarios

## Capabilities

### New Capabilities

- `account-management`: Signed-in account settings — change email (verify-first) and change password with re-authentication, validation, and confirmation flows

### Modified Capabilities

- `user-auth`: Add friendly error messages for re-authentication (`requires-recent-login` when wrong password is entered during re-auth) and new account email change (`email-already-in-use` on the new address)

## Impact

- `src/app/core/services/auth.service.ts` — new methods: `reauthenticate`, `changeEmail`, `updatePassword`
- `src/app/core/utils/auth-errors.ts` — new friendly error messages
- New component: `src/app/features/account/account-settings.component.ts` (template + styles)
- `src/app/app.routes.ts` — new guarded `/account` route
- `src/app/shell/shell.component.html` — new "Account settings" menu item
- `src/app/shell/shell.component.ts` — import RouterLink for menu navigation
