## Purpose

Delivers reliable, low-noise email reminders before a user's warranty coverage expires, without requiring the user to open the application.

## ADDED Requirements

### Requirement: Default reminder eligibility

The system SHALL enable expiry-email reminders by default for users with a verified email address. The system MUST NOT send expiry reminders to an unverified address, to a user who has disabled reminders, or for lifetime or already-expired coverage.

#### Scenario: Verified user receives the default setting

- **WHEN** a user has a verified email address and has not set a reminder preference
- **THEN** the user is eligible to receive expiry-email reminders

#### Scenario: Unverified user is excluded

- **WHEN** a user has an unverified email address
- **THEN** the system does not send that user an expiry-email reminder

#### Scenario: Lifetime coverage is excluded

- **WHEN** a product has coverage with no expiry date
- **THEN** the system does not include that coverage in an expiry-email reminder

### Requirement: Reminder thresholds and consolidation

The system SHALL identify coverage that reaches 30 days before expiry, 7 days before expiry, or its expiry day using the Asia/Singapore calendar. The system SHALL send at most one expiry-email message to an eligible user on a calendar day and SHALL include every coverage that reaches a threshold that day in that message.

#### Scenario: Multiple thresholds are consolidated

- **WHEN** two coverages belonging to the same eligible user reach reminder thresholds on the same calendar day
- **THEN** the system sends one email containing both coverages

#### Scenario: Coverage reaches a configured threshold

- **WHEN** an eligible coverage is 30 days, 7 days, or 0 days from expiry in Asia/Singapore
- **THEN** the system includes the coverage in that day's reminder email

### Requirement: Idempotent delivery tracking

The system SHALL persist the outcome of each attempted daily reminder delivery and SHALL ensure a coverage threshold is not sent more than once to the same user. A failed delivery MUST remain eligible for a bounded retry without duplicating coverage thresholds that were already delivered successfully.

#### Scenario: Scheduled work is retried

- **WHEN** the daily reminder process runs more than once for the same date
- **THEN** a previously delivered coverage threshold is not emailed again

#### Scenario: Delivery fails

- **WHEN** an email delivery attempt fails before success is recorded
- **THEN** the system records the failure and can retry the unsent reminder content

### Requirement: Reminder content and privacy

The system SHALL identify each included product and coverage, state its expiry date and remaining time, and link the recipient to the relevant signed-in warranty detail page. The system MUST only include data belonging to the recipient and MUST NOT expose other users' warranty data.

#### Scenario: Recipient opens a reminder

- **WHEN** an eligible user receives an expiry reminder
- **THEN** the email lists only that user's eligible coverage and provides a link to the associated warranty detail page

