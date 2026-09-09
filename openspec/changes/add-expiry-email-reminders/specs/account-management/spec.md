## MODIFIED Requirements

### Requirement: Account settings page

The system SHALL provide a guarded Account Settings page accessible from the authenticated shell, showing account information, email and password management sections, and an expiry-email reminder preference.

#### Scenario: Navigate to account settings

- **WHEN** a signed-in user selects "Account settings" from the account menu
- **THEN** the system displays the account settings page with current email, provider, verification status, and the current expiry-email reminder setting

#### Scenario: Unauthenticated user redirected

- **WHEN** an unauthenticated user navigates to account settings
- **THEN** they are redirected to the sign-in page

#### Scenario: Provider-specific sections

- **WHEN** a signed-in user views account settings with a Google-only provider
- **THEN** the password section is not displayed (no password for Google accounts)

#### Scenario: Reminder preference is updated

- **WHEN** a signed-in user enables or disables expiry-email reminders
- **THEN** the setting is saved for that user and is reflected on their account settings page

### Requirement: Accessibility

The system SHALL meet WCAG AA standards for all account management flows, including focus management, color contrast, ARIA attributes, and keyboard navigation.

#### Scenario: Form accessibility

- **WHEN** a user interacts with account settings forms
- **THEN** all form fields have associated labels, errors are announced to screen readers, and focus is managed appropriately after form submission

#### Scenario: Keyboard navigation

- **WHEN** a user navigates the account settings page using keyboard only
- **THEN** all interactive elements, including the expiry-email reminder preference, are reachable and operable via keyboard

