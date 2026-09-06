## MODIFIED Requirements

### Requirement: Guarded routes

The system SHALL prevent unauthenticated users from accessing private pages and SHALL prevent authenticated users from accessing the sign-in/sign-up pages, redirecting an authenticated user to the warranty list exactly once without an endless redirect loop.

#### Scenario: Unauthenticated user redirected to sign-in

- **WHEN** an unauthenticated user navigates to a private page such as the warranty list
- **THEN** they are redirected to the sign-in page and, after signing in, are returned to the page they intended

#### Scenario: Authenticated user redirected from auth pages

- **WHEN** an authenticated user navigates to the sign-in or sign-up page
- **THEN** they are redirected to the warranty list

#### Scenario: Newly authenticated user lands without a loop

- **WHEN** a user becomes authenticated while on a guest page (for example, by submitting sign-up or sign-in)
- **THEN** the system redirects them to the warranty list exactly once and renders it, without an endless redirect loop or a blank screen
