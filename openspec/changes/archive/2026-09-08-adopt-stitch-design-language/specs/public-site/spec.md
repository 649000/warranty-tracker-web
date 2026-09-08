## ADDED Requirements

### Requirement: Shared public site chrome

The system SHALL render all public pages (landing, auth, legal, and 404) within a shared site header and footer so the public site reads as one consistent surface. The header SHALL show the brand mark and name, expose the theme control, and offer sign-in/sign-up actions appropriate to the page. The footer SHALL show the brand and legal links.

#### Scenario: Public pages share a header and footer

- **WHEN** a visitor navigates between landing, sign-in, sign-up, terms, privacy, and an unknown URL
- **THEN** every page presents the same header and footer treatment rather than a page-local top bar

#### Scenario: Landing actions adapt to auth state

- **WHEN** a logged-out visitor views the landing page
- **THEN** the header offers sign-in and sign-up actions

#### Scenario: Legal pages keep a path home

- **WHEN** a visitor opens the Terms or Privacy page
- **THEN** the page provides a visible way back to the landing page via the shared chrome

#### Scenario: Theme control remains available

- **WHEN** a visitor views any public page
- **THEN** the shared header exposes the theme control consistent with the theme capability

## MODIFIED Requirements

### Requirement: Landing page

The system SHALL present a public landing page to logged-out visitors that communicates the value proposition, explains the core use, and offers a clear call to action to sign in or sign up. The page SHALL use the Stitch design language: an Inter display hero with a slate primary call-to-action and feature highlights on elevated surfaces. Authenticated visitors SHALL be redirected to the warranty list.

#### Scenario: Logged-out visitor sees the landing page

- **WHEN** an unauthenticated user visits the root URL
- **THEN** they see the landing page with headline, value props, and sign-in/sign-up call to action

#### Scenario: Authenticated visitor is redirected

- **WHEN** an authenticated user visits the root URL
- **THEN** they are redirected to the warranty list

#### Scenario: Landing page is responsive

- **WHEN** the landing page is viewed on a narrow (mobile) viewport
- **THEN** content reflows to a single readable column with touch-friendly targets
