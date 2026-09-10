## Purpose

Explains, in plain language, what consumer warranties typically cover and exclude, so users can understand their entitlement without reading dense terms and conditions.

## ADDED Requirements

### Requirement: Curated scenario guidance

The system SHALL present a curated set of common warranty scenarios, each with a plain-language typical verdict, covering at least: manufacturing defect, accidental damage, liquid damage, wear and tear, cosmetic damage, unauthorized repair, and theft or loss.

#### Scenario: Common scenarios are listed

- **WHEN** a user views coverage guidance
- **THEN** each supported scenario is shown with a plain-language verdict of covered, excluded, or varies

#### Scenario: Covered scenario is distinguished

- **WHEN** a scenario is typically covered by a standard warranty, such as a manufacturing defect
- **THEN** the guidance indicates it is typically covered

#### Scenario: Excluded scenario is distinguished

- **WHEN** a scenario is typically excluded, such as accidental damage
- **THEN** the guidance indicates it is typically excluded

### Requirement: Singapore statutory baseline

The system SHALL include a short, plain-language note that Singapore consumer law provides baseline protections independent of a manufacturer's warranty.

#### Scenario: Baseline is available

- **WHEN** a user views coverage guidance
- **THEN** a Singapore statutory baseline note is available

### Requirement: Category-aware notes

The system SHALL provide category-specific coverage notes when the product's category is known and has associated notes.

#### Scenario: Category note is shown

- **WHEN** a product has a category with associated notes, such as "Phones & Tablets" or "Appliances"
- **THEN** the guidance includes notes relevant to that category

#### Scenario: Unknown or unmapped category

- **WHEN** a product's category is not set or has no associated notes
- **THEN** the general scenario guidance is shown without a category note

### Requirement: Guidance is general, not a guarantee

The system SHALL label coverage guidance as general information rather than a guarantee of the user's specific entitlement, and SHALL offer a link to the provider's official terms when one is available.

#### Scenario: Disclaimer is present

- **WHEN** coverage guidance is displayed
- **THEN** it is labeled as general guidance and not as a plan-specific guarantee

#### Scenario: Official terms link is offered

- **WHEN** an official terms link is available for the coverage
- **THEN** the guidance offers that link

### Requirement: Graceful absence of guidance

The system SHALL display the coverage panel without a guidance block when no guidance applies, and SHALL NOT block or degrade the rest of the coverage panel.

#### Scenario: No guidance for a coverage

- **WHEN** no guidance applies to a coverage
- **THEN** the coverage panel renders normally without a guidance block
