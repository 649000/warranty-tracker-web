## Purpose

Provides curated, admin-managed claim contact information for products and coverages so users can see how to file a warranty claim without hunting down the manufacturer or retailer themselves.

## ADDED Requirements

### Requirement: Claim contact directory lookup

The system SHALL maintain a curated directory of claim contacts. Each entry SHALL be identified by a coverage source type (manufacturer, retailer, international, or other) and a name, and SHALL support optional aliases. The system SHALL resolve a directory entry for a coverage using the coverage's source and the product's brand (for manufacturer, international, and other sources) or the product's retailer (for retailer source), matching the name or an alias case-insensitively and ignoring surrounding whitespace.

#### Scenario: Manufacturer coverage resolves by brand

- **WHEN** a coverage has a manufacturer source and the product brand matches a directory entry
- **THEN** the matching directory entry is available for that coverage

#### Scenario: Retailer coverage resolves by retailer

- **WHEN** a coverage has a retailer source and the product retailer matches a directory entry
- **THEN** the matching directory entry is available for that coverage

#### Scenario: Alias matching

- **WHEN** a product brand differs in case or whitespace, or matches an alias of a directory entry
- **THEN** the matching directory entry is still resolved

#### Scenario: No matching entry

- **WHEN** no directory entry matches the product brand or retailer for a coverage
- **THEN** the system reports no suggested claim information for that coverage and does not block the user

### Requirement: Suggested claim information

The system SHALL present a resolved directory entry as suggested claim information within the expanded view of the corresponding coverage. Suggested claim information SHALL include the claim URL, hotline, email, ordered claim steps, service-center link, and registration link when present in the entry, and SHALL be visually distinguished from contact information the user has provided.

#### Scenario: Suggested information shown for a matching coverage

- **WHEN** a coverage resolves to a directory entry and the user expands the coverage
- **THEN** the entry's claim URL, hotline, email, claim steps, service-center link, and registration link are shown when present

#### Scenario: Suggested information is labeled

- **WHEN** suggested claim information is displayed
- **THEN** it is labeled as suggested rather than as user-provided information

#### Scenario: Actionable claim details

- **WHEN** a directory entry provides a hotline, email, or URL
- **THEN** each is presented as an actionable link

### Requirement: User override precedence

The system SHALL treat contact information entered by the user on a coverage as an override that takes precedence over any suggested directory entry. The system SHALL persist the user's contact information on the coverage and SHALL continue to show it even when a directory entry exists or later changes.

#### Scenario: User contact overrides suggestion

- **WHEN** a coverage resolves to a directory entry and the user enters their own contact information
- **THEN** the user's contact information is stored and displayed instead of the suggested entry

#### Scenario: Override survives directory changes

- **WHEN** a user has overridden the contact information for a coverage and the directory entry is later updated
- **THEN** the user's contact information remains displayed

#### Scenario: Suggestion shown when no override exists

- **WHEN** a coverage resolves to a directory entry and the user has not entered contact information
- **THEN** the suggested entry is displayed without being stored on the coverage

### Requirement: Reset to suggested

The system SHALL provide a "Reset to suggested" action when a coverage has a user override. Applying the action SHALL remove the user's contact information from the coverage so that the suggested directory entry, when one exists, is displayed again.

#### Scenario: Reset clears the override

- **WHEN** a coverage has user-provided contact information and the user activates "Reset to suggested"
- **THEN** the user's contact information is removed and the suggested directory entry is displayed when one exists

#### Scenario: Reset unavailable without override

- **WHEN** a coverage has no user-provided contact information
- **THEN** the "Reset to suggested" action is not offered

### Requirement: Claim directory access control

The system SHALL allow any authenticated user to read the claim directory and SHALL deny all client writes to it, so that directory content can only be managed administratively.

#### Scenario: Authenticated read allowed

- **WHEN** an authenticated user reads the claim directory
- **THEN** the read is permitted

#### Scenario: Unauthenticated read denied

- **WHEN** an unauthenticated client attempts to read the claim directory
- **THEN** the read is denied

#### Scenario: Client write denied

- **WHEN** any client attempts to create, update, or delete a claim directory entry
- **THEN** the write is denied
