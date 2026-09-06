## MODIFIED Requirements

### Requirement: Product list surfacing

The system SHALL present the warranty list sorted by urgency (expiring soon first, then active, then expired) with filter chips for all/active/expiring-soon/expired and status shown as both color and text, with the status badge meeting WCAG AA color contrast.

#### Scenario: List sorted by urgency

- **WHEN** the warranty list is displayed
- **THEN** products are ordered by soonest expiry, with expired products at the end

#### Scenario: Filter by status

- **WHEN** a user selects an expiring-soon filter
- **THEN** only products with an expiring-soon signal are shown

#### Scenario: Status is not color-only

- **WHEN** a product's status is displayed
- **THEN** both a color indicator and a text label are present

#### Scenario: Status badge meets WCAG AA contrast

- **WHEN** a product or coverage status badge is displayed in light or dark theme
- **THEN** its text and background meet the WCAG AA contrast ratio of at least 4.5:1
