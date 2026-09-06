# error-logging Specification

## Purpose

Captures and reports application errors to Sentry so production failures — uncaught exceptions, console errors, and unexpected backend operation failures — are visible and diagnosable.

## Requirements

### Requirement: Global error capture

The system SHALL report uncaught exceptions and unhandled promise rejections to Sentry. When reporting fails, it SHALL NOT throw or otherwise affect the running application.

#### Scenario: Uncaught exception is reported

- **WHEN** an uncaught exception occurs at runtime
- **THEN** the error is sent to Sentry
- **AND** the application continues to run

#### Scenario: Reporting failure does not break the app

- **WHEN** an error occurs but reporting to Sentry itself fails
- **THEN** the reporting failure is swallowed
- **AND** the original error still surfaces through normal error handling

### Requirement: Console error capture

The system SHALL capture `console.error` and `console.warn` output and report it to Sentry.

#### Scenario: Console error is captured

- **WHEN** application code calls `console.error` with an error or message
- **THEN** the entry is reported to Sentry

#### Scenario: Console warning is captured

- **WHEN** application code calls `console.warn` with a message
- **THEN** the entry is reported to Sentry

### Requirement: Unexpected Firebase operation failure capture

The system SHALL report unexpected failures from Firebase Auth, Firestore, and Storage operations to Sentry with context describing the operation. Expected user-facing validation failures (for example wrong password or email already in use) SHALL NOT be reported as errors.

#### Scenario: Firestore operation failure is reported

- **WHEN** a Firestore read or write fails unexpectedly
- **THEN** the error is reported to Sentry with context identifying the operation

#### Scenario: Storage operation failure is reported

- **WHEN** a Storage upload, download, or delete fails unexpectedly
- **THEN** the error is reported to Sentry with context identifying the operation

#### Scenario: Expected auth validation failure is not reported

- **WHEN** a sign-in fails due to an expected validation error such as an incorrect password
- **THEN** the error is shown to the user as a friendly message
- **AND** it is NOT reported to Sentry

### Requirement: Environment configuration

The system SHALL obtain the Sentry DSN from environment configuration, and SHALL disable error reporting in local development.

#### Scenario: Reporting disabled in development

- **WHEN** the application runs in development mode
- **THEN** error reporting to Sentry is disabled

#### Scenario: Reporting enabled in production

- **WHEN** the application runs in a non-development build with a configured DSN
- **THEN** errors are reported to Sentry using the configured DSN
