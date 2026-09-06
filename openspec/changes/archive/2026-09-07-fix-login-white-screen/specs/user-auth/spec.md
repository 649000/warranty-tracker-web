## ADDED Requirements

### Requirement: Local development sign-in

The system SHALL allow a developer to sign in during local development against either the live Firebase project or the Firebase emulators, selected by environment configuration.

#### Scenario: Emulators enabled

- **WHEN** the application is served in development with the emulator option enabled
- **THEN** authentication, Firestore, and Storage requests target the local Firebase emulators

#### Scenario: Emulators disabled

- **WHEN** the application is served in development with the emulator option disabled
- **THEN** sign-in, including Google redirect sign-in, targets the live Firebase project so it can be tested locally

## MODIFIED Requirements

### Requirement: Sign in with Google

The system SHALL allow a user to sign in with a Google account in a single action, creating an account on first use, and SHALL land the signed-in user on the warranty list without a blank or looping screen.

#### Scenario: Successful Google sign-in

- **WHEN** an unauthenticated user chooses "Continue with Google" on the sign-in page
- **THEN** the user is authenticated and redirected to the warranty list

#### Scenario: First-time Google sign-in creates an account

- **WHEN** a user signs in with Google for the first time
- **THEN** the system creates an account tied to their Google identity and signs them in

#### Scenario: Google redirect completes before route guards evaluate

- **WHEN** the browser returns from the Google sign-in redirect
- **THEN** the authentication state is resolved and the user lands on the warranty list, with no blank white screen or redirect loop

### Requirement: Sign in with email and password

The system SHALL let a registered user sign in with their email and password and SHALL land them on the warranty list.

#### Scenario: Successful email sign-in

- **WHEN** a registered user submits the correct email and password
- **THEN** the user is authenticated and redirected to the warranty list

#### Scenario: Sign-in renders the warranty list without a blank screen

- **WHEN** a user completes email sign-in
- **THEN** the warranty list renders a loading or content state, never a blank white screen

#### Scenario: Wrong credentials

- **WHEN** a user submits an incorrect password
- **THEN** the system shows a clear error and keeps the user unauthenticated

### Requirement: Guarded routes

The system SHALL prevent unauthenticated users from accessing private pages and SHALL prevent authenticated users from accessing the sign-in/sign-up pages, redirecting each exactly once without an endless loop.

#### Scenario: Unauthenticated user redirected to sign-in

- **WHEN** an unauthenticated user navigates to a private page such as the warranty list
- **THEN** they are redirected to the sign-in page and, after signing in, are returned to the page they intended

#### Scenario: Authenticated user redirected from auth pages

- **WHEN** an authenticated user navigates to the sign-in or sign-up page
- **THEN** they are redirected to the warranty list

#### Scenario: Guards do not oscillate

- **WHEN** a signed-in or signed-out user navigates between the auth pages and the private pages
- **THEN** the router settles on a single destination without an endless redirect loop or a blank screen
