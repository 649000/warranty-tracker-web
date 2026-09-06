# user-auth Specification

## Purpose
Handles user identity for Warranty Tracker: sign-up and sign-in (Google and email/password), session persistence, email verification, password recovery, account deletion, and guarding of private pages.

## Requirements

### Requirement: Sign in with Google

The system SHALL allow a user to sign in with a Google account in a single action, creating an account on first use.

#### Scenario: Successful Google sign-in

- **WHEN** an unauthenticated user chooses "Continue with Google" on the sign-in page
- **THEN** the user is authenticated and redirected to the warranty list

#### Scenario: First-time Google sign-in creates an account

- **WHEN** a user signs in with Google for the first time
- **THEN** the system creates an account tied to their Google identity and signs them in

### Requirement: Sign up with email and password

The system SHALL let a user create an account with a valid email address and a password, and SHALL reject invalid or duplicate email addresses and weak passwords.

#### Scenario: Successful email sign-up

- **WHEN** a user submits a valid email and a password meeting the minimum requirements on the sign-up page
- **THEN** an account is created and the user is signed in

#### Scenario: Duplicate email is rejected

- **WHEN** a user submits sign-up with an email that already has an account
- **THEN** the system shows a clear error and does not create a second account

#### Scenario: Invalid email is rejected

- **WHEN** a user submits sign-up with a malformed email address
- **THEN** the form shows an inline validation error and no account is created

### Requirement: Sign in with email and password

The system SHALL let a registered user sign in with their email and password.

#### Scenario: Successful email sign-in

- **WHEN** a registered user submits the correct email and password
- **THEN** the user is authenticated and redirected to the warranty list

#### Scenario: Wrong credentials

- **WHEN** a user submits an incorrect password
- **THEN** the system shows a clear error and keeps the user unauthenticated

### Requirement: Password recovery

The system SHALL let a user request a password reset for their email address.

#### Scenario: Request password reset

- **WHEN** a user submits their email address on the forgot-password flow
- **THEN** the system sends a password reset email and confirms the request

#### Scenario: Reset with link

- **WHEN** a user follows the password reset link and sets a new password
- **THEN** the new password takes effect and the user can sign in with it

### Requirement: Email verification

The system SHALL mark new email/password accounts as unverified and SHALL verify them when the user confirms the emailed link.

#### Scenario: New account is unverified

- **WHEN** a user signs up with email and password
- **THEN** the account is unverified and the system surfaces a prompt to verify the email

#### Scenario: Confirm verification link

- **WHEN** a user opens the verification link sent to their email
- **THEN** the account becomes verified and the prompt is cleared

### Requirement: Persistent session

The system SHALL keep the user signed in across visits to the application.

#### Scenario: Session survives a reload

- **WHEN** a signed-in user reloads the page or returns later
- **THEN** the user remains authenticated without re-entering credentials

### Requirement: Sign out

The system SHALL let a signed-in user sign out of their account.

#### Scenario: User signs out

- **WHEN** a signed-in user chooses to sign out
- **THEN** the session ends and the user is redirected to the landing page

### Requirement: Account deletion

The system SHALL let a user delete their account and SHALL remove the user's stored data.

#### Scenario: User deletes account

- **WHEN** a signed-in user confirms account deletion
- **THEN** their products, coverages, and proof-of-purchase files are removed and the session ends

### Requirement: Guarded routes

The system SHALL prevent unauthenticated users from accessing private pages and SHALL prevent authenticated users from accessing the sign-in/sign-up pages.

#### Scenario: Unauthenticated user redirected to sign-in

- **WHEN** an unauthenticated user navigates to a private page such as the warranty list
- **THEN** they are redirected to the sign-in page and, after signing in, are returned to the page they intended

#### Scenario: Authenticated user redirected from auth pages

- **WHEN** an authenticated user navigates to the sign-in or sign-up page
- **THEN** they are redirected to the warranty list

### Requirement: Auth errors are user-friendly

The system SHALL present authentication failures as clear, human-readable messages rather than raw error codes.

#### Scenario: Network or provider failure

- **WHEN** an authentication request fails (e.g., network error or provider issue)
- **THEN** the user sees a readable error message and remains on the current page
