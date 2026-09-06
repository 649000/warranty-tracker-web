## MODIFIED Requirements

### Requirement: Auth errors are user-friendly

The system SHALL present authentication failures as clear, human-readable messages rather than raw error codes.

#### Scenario: Network or provider failure

- **WHEN** an authentication request fails (e.g., network error or provider issue)
- **THEN** the user sees a readable error message and remains on the current page

#### Scenario: Re-authentication with wrong password

- **WHEN** a user enters an incorrect password during a re-authentication prompt (e.g., changing email or password)
- **THEN** the system shows "Incorrect password. Try again." and remains on the re-authentication form

#### Scenario: Email already in use during email change

- **WHEN** a user attempts to change their email to an address that already has an account
- **THEN** the system shows "An account with this email already exists. Try signing in instead." and remains on the email change form
