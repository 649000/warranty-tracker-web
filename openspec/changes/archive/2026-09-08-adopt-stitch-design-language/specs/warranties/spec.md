## ADDED Requirements

### Requirement: Dashboard overview

The system SHALL present the warranty list as a dashboard that summarizes live coverage posture and lets the user find a product quickly. It SHALL show metric cards with counts of active products, expiring-soon products, and expired products derived from the current data, and SHALL provide a free-text search that filters products by name, brand, serial number, or retailer as the user types.

#### Scenario: Metric cards reflect current data

- **WHEN** a user has products in multiple states
- **THEN** the dashboard shows a count of active, expiring-soon, and expired products that matches the filtered product set

#### Scenario: Metric card navigates to its state

- **WHEN** a user activates a metric card (for example, "Expiring Soon")
- **THEN** the list filters to products in that state

#### Scenario: Search narrows the list

- **WHEN** a user types text into the dashboard search box
- **THEN** only products whose name, brand, serial number, or retailer contains the text are shown

#### Scenario: Search is available with filters

- **WHEN** the dashboard is displayed
- **THEN** search and status filter pills can be combined, with a product shown only when it matches both

## MODIFIED Requirements

### Requirement: Product list surfacing

The system SHALL present the warranty list sorted by urgency (expiring soon first, then active, then expired) with filter pills for all/active/expiring-soon/expired and status shown as both color and text. Products SHALL render as Stitch-style cards: a status accent, product identity (thumbnail fallback icon, brand, name), key metadata (retailer, purchase date, serial with copy action), and a coverage timeline indicator. The status badge SHALL meet WCAG AA color contrast.

#### Scenario: List sorted by urgency

- **WHEN** the warranty list is displayed
- **THEN** products are ordered by soonest expiry, with expired products at the end

#### Scenario: Filter by status

- **WHEN** a user selects an expiring-soon filter
- **THEN** only products with an expiring-soon signal are shown

#### Scenario: Status is not color-only

- **WHEN** a product's status is displayed
- **THEN** both a color indicator and a text label are present

#### Scenario: Serial number can be copied

- **WHEN** a product card shows a serial number
- **THEN** a copy control is available that copies the serial and confirms the action

#### Scenario: Status badge meets WCAG AA contrast

- **WHEN** a product or coverage status badge is displayed in light or dark theme
- **THEN** its text and background meet the WCAG AA contrast ratio of at least 4.5:1
