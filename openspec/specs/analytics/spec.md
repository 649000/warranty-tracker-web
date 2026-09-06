# analytics Specification

## Purpose
Tracks usage of Warranty Tracker with Google Analytics 4 (GA4) — page views and key user actions — without ever blocking or degrading the core experience.

## Requirements

### Requirement: Track page views

The system SHALL record page views for meaningful routes while a user is on the application.

#### Scenario: Page view recorded

- **WHEN** a user navigates to a tracked route
- **THEN** a page view event is recorded with the route name

#### Scenario: Analytics failure does not block navigation

- **WHEN** analytics initialization or an event send fails
- **THEN** the user experiences no error and navigation continues normally

### Requirement: Track key user actions

The system SHALL record analytics events for key actions: sign-in, product added, coverage added, and proof of purchase uploaded.

#### Scenario: Product added event

- **WHEN** a user successfully adds a product
- **THEN** a "product added" event is recorded

#### Scenario: Coverage added event

- **WHEN** a user successfully adds a coverage to a product
- **THEN** a "coverage added" event is recorded

#### Scenario: Sign-in event

- **WHEN** a user completes sign-in
- **THEN** a "sign-in" event is recorded

#### Scenario: Proof uploaded event

- **WHEN** a user successfully uploads proof of purchase
- **THEN** a "proof uploaded" event is recorded

### Requirement: Analytics is non-intrusive

The system SHALL load analytics in a way that does not delay first render or interfere with core functionality.

#### Scenario: Rendering is not delayed

- **WHEN** the application loads on a slow network
- **THEN** the core UI renders without waiting for analytics
