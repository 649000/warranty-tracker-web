## MODIFIED Requirements

### Requirement: Multiple coverages per product

The system SHALL allow a product to have multiple coverages, each with a source (manufacturer, retailer, international, other), a scope (local, international), a duration, and an optional contact and notes. Source and scope labels SHALL be presented with consistent title-case capitalization in every control that selects or displays them.

#### Scenario: Add a second coverage

- **WHEN** a user adds a coverage to a product that already has one
- **THEN** both coverages are stored and shown independently

#### Scenario: Coverage start date defaults to purchase date

- **WHEN** a user does not set an explicit coverage start date
- **THEN** the coverage start date equals the product's purchase date

#### Scenario: Duration presets

- **WHEN** a user picks a coverage duration
- **THEN** preset durations (6 months, 1, 2, 3, 5 years, Lifetime, Custom) are offered, with Custom accepting a number of months or an explicit end date

#### Scenario: Source and scope labels are consistently capitalized

- **WHEN** a user selects a coverage source or scope in any form or dialog
- **THEN** the options are shown in title case (e.g., "Manufacturer", "Retailer", "Local", "International") regardless of entry point
