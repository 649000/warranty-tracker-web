## Purpose

Lets signed-in users manage their own account: change their email address (with verification) and update their password with professional UX, validation, and re-authentication.

## ADDED Requirements

### Requirement: Change email with verification

The system SHALL let a signed-in user change their email address, requiring re-authentication with their current password, and SHALL use a verify-first flow where the old email remains active until the user confirms a verification link sent to the new address.

#### Scenario: Email change form

- **WHEN** a signed-in user navigates to account settings
- **THEN** the system displays a form with fields for new email, current password, and a submit button

#### Scenario: Successful email change request

- **WHEN** a signed-in user submits a valid new email address and correct current password
- **THEN** the system sends a verification email to the new address and shows a confirmation message that the old email remains active until verified

#### Scenario: Re-authentication with wrong password

- **WHEN** a signed-in user submits an incorrect current password during email change
- **THEN** the system shows a clear error message and remains on the form without changing the email

#### Scenario: Duplicate email is rejected

- **WHEN** a signed-in user submits a new email that already has an account
- **THEN** the system shows a clear error and does not initiate the email change

#### Scenario: Invalid email is rejected

- **WHEN** a signed-in user submits a malformed email address
- **THEN** the form shows an inline validation error and no email change is initiated

#### Scenario: Email verification completes

- **WHEN** a user opens the verification link sent to the new email address
- **THEN** the email change takes effect and the account shows the new email

### Requirement: Update password

The system SHALL let a signed-in user change their password by confirming their current password and entering a new password that meets minimum requirements, with confirmation matching.

#### Scenario: Password change form

- **WHEN** a signed-in user navigates to account settings
- **THEN** the system displays a form with fields for current password, new password, confirm new password, and a submit button

#### Scenario: Successful password change

- **WHEN** a signed-in user submits correct current password and a valid new password with matching confirmation
- **THEN** the password is updated and a success confirmation is shown

#### Scenario: Re-authentication with wrong password

- **WHEN** a signed-in user submits an incorrect current password during password change
- **THEN** the system shows a clear error message and remains on the form without changing the password

#### Scenario: Passwords do not match

- **WHEN** a signed-in user submits new password and confirmation that do not match
- **THEN** the form shows an inline validation error and no password change is initiated

#### Scenario: Weak password is rejected

- **WHEN** a signed-in user submits a new password that is too short
- **THEN** the form shows an inline validation error and no password change is initiated

#### Scenario: Password change with recent re-authentication

- **WHEN** a signed-in user has authenticated recently (within Firebase's recent-login window)
- **THEN** the system accepts the password change without requiring current password entry

### Requirement: Account settings page

The system SHALL provide a guarded Account Settings page accessible from the authenticated shell, showing account information and both email and password management sections.

#### Scenario: Navigate to account settings

- **WHEN** a signed-in user selects "Account settings" from the account menu
- **THEN** the system displays the account settings page with current email, provider, and verification status

#### Scenario: Unauthenticated user redirected

- **WHEN** an unauthenticated user navigates to account settings
- **THEN** they are redirected to the sign-in page

#### Scenario: Provider-specific sections

- **WHEN** a signed-in user views account settings with a Google-only provider
- **THEN** the password section is not displayed (no password for Google accounts)

### Requirement: Account menu integration

The system SHALL add an "Account settings" item to the existing account menu in the toolbar, linking to the account settings page.

#### Scenario: Account settings menu item visible

- **WHEN** a signed-in user opens the account menu
- **THEN** an "Account settings" item is displayed between the email display and sign-out item

#### Scenario: Account settings navigation

- **WHEN** a signed-in user selects "Account settings" from the menu
- **THEN** the system navigates to the account settings page

### Requirement: Accessibility

The system SHALL meet WCAG AA standards for all account management flows, including focus management, color contrast, ARIA attributes, and keyboard navigation.

#### Scenario: Form accessibility

- **WHEN** a user interacts with account settings forms
- **THEN** all form fields have associated labels, errors are announced to screen readers, and focus is managed appropriately after form submission

#### Scenario: Keyboard navigation

- **WHEN** a user navigates the account settings page using keyboard only
- **THEN** all interactive elements are reachable and operable via keyboard
