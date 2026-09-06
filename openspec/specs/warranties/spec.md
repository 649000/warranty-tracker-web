# warranties Specification

## Purpose
Centralizes warranty information per product: products with multiple coverages (manufacturer, retailer, international, other), expiry derivation based on purchase date and duration, status computation with a 60-day expiring-soon threshold, and claim-ready details.

## Requirements

### Requirement: Add a product

The system SHALL let a user add a product with a name, a purchase date, and at least one coverage. Category SHALL be selected from a fixed taxonomy with an "Other" option. Brand, serial number, retailer, and price SHALL be optional; the default currency SHALL be SGD.

#### Scenario: Add product with minimal input

- **WHEN** a user provides a name, accepts the default purchase date, and picks a duration
- **THEN** a product is created with a single coverage and appears in the warranty list

#### Scenario: Optional fields are available

- **WHEN** a user opens the "more details" section while adding a product
- **THEN** brand, serial number, retailer, and price fields are available without being required

#### Scenario: Category from fixed taxonomy

- **WHEN** a user selects a category
- **THEN** only categories from the fixed list (including "Other") are offered

#### Scenario: Duplicate product name allowed

- **WHEN** a user adds a product with the same name as an existing one
- **THEN** the product is still created (no uniqueness enforced)

### Requirement: Edit and delete a product

The system SHALL let a user edit any product field and delete a product with confirmation.

#### Scenario: Edit product

- **WHEN** a user changes a product's details and saves
- **THEN** the updated details are persisted and reflected in the list

#### Scenario: Delete product

- **WHEN** a user confirms deletion of a product
- **THEN** the product, its coverages, and its proof of purchase are removed

### Requirement: Multiple coverages per product

The system SHALL allow a product to have multiple coverages, each with a source (manufacturer, retailer, international, other), a scope (local, international), a duration, and an optional contact and notes.

#### Scenario: Add a second coverage

- **WHEN** a user adds a coverage to a product that already has one
- **THEN** both coverages are stored and shown independently

#### Scenario: Coverage start date defaults to purchase date

- **WHEN** a user does not set an explicit coverage start date
- **THEN** the coverage start date equals the product's purchase date

#### Scenario: Duration presets

- **WHEN** a user picks a coverage duration
- **THEN** preset durations (6 months, 1, 2, 3, 5 years, Lifetime, Custom) are offered, with Custom accepting a number of months or an explicit end date

### Requirement: Coverage expiry derivation

The system SHALL derive a coverage's expiry date from its start date plus its duration in months, unless the coverage is lifetime (never expires) or the user provides an explicit expiry date.

#### Scenario: Duration-based expiry

- **WHEN** a coverage has a start date and a duration of months
- **THEN** its expiry date is the start date plus the duration

#### Scenario: Lifetime coverage

- **WHEN** a coverage is marked lifetime
- **THEN** it has no expiry date and is always active

#### Scenario: Manual expiry override

- **WHEN** a user sets an explicit expiry date for a coverage
- **THEN** the explicit date takes precedence over duration-based math

### Requirement: Coverage and product status

The system SHALL compute a status for each coverage (active, expiring soon, expired) where "expiring soon" means the expiry date is within 60 days, and SHALL derive the product status from its coverages: covered while any coverage is active, with the soonest expiring active coverage driving the expiring-soon signal.

#### Scenario: Coverage within 60 days is expiring soon

- **WHEN** a coverage's expiry date is between today and 60 days from today
- **THEN** the coverage status is "expiring soon"

#### Scenario: Coverage past expiry is expired

- **WHEN** a coverage's expiry date is before today
- **THEN** the coverage status is "expired"

#### Scenario: Expired coverage no longer counts as coverage

- **WHEN** a product has only expired coverages
- **THEN** the product status is "expired"

#### Scenario: Soonest expiry drives the product signal

- **WHEN** a product has multiple active coverages expiring on different dates
- **THEN** the product surfaces the soonest expiring coverage as its "expiring soon" signal while any coverage remains active

### Requirement: Product list surfacing

The system SHALL present the warranty list sorted by urgency (expiring soon first, then active, then expired) with filter chips for all/active/expiring-soon/expired and status shown as both color and text.

#### Scenario: List sorted by urgency

- **WHEN** the warranty list is displayed
- **THEN** products are ordered by soonest expiry, with expired products at the end

#### Scenario: Filter by status

- **WHEN** a user selects an expiring-soon filter
- **THEN** only products with an expiring-soon signal are shown

#### Scenario: Status is not color-only

- **WHEN** a product's status is displayed
- **THEN** both a color indicator and a text label are present

### Requirement: Claim information

The system SHALL make claim-relevant details available on the product detail page: coverage contact (hotline, email, URL), notes, serial number, retailer, and proof of purchase.

#### Scenario: Coverage contact is tappable

- **WHEN** a coverage has a contact hotline, email, or URL and the user expands the coverage
- **THEN** the contact is shown as an actionable link

### Requirement: Data isolation

The system SHALL scope all product and coverage data to the owning user.

#### Scenario: User sees only their own products

- **WHEN** a user views the warranty list
- **THEN** they see only products they created

#### Scenario: Direct access to another user's product

- **WHEN** a user requests a product belonging to another user
- **THEN** the request is denied at the data layer and the product is not shown
