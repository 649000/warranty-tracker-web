# warranties Specification

## Purpose
Centralizes warranty information per product: products with multiple coverages (manufacturer, retailer, international, other), expiry derivation based on purchase date and duration, status computation with a 60-day expiring-soon threshold, and claim-ready details.

## Requirements

### Requirement: Add a product

The system SHALL let a user add a product with a name, a purchase date, a category, and at least one coverage. Category SHALL be required and selected from a fixed taxonomy with an "Other" option. Brand, serial number, and retailer SHALL be optional; the default currency SHALL be SGD. If a price is provided, it SHALL be a positive number with at most 2 decimal places and SHALL NOT exceed 1,000,000.

#### Scenario: Add product with minimal input

- **WHEN** a user provides a name, selects a category, accepts the default purchase date, and picks a duration
- **THEN** a product is created with a single coverage and appears in the warranty list

#### Scenario: Category is required

- **WHEN** a user attempts to save a product without selecting a category
- **THEN** the form is not submitted and the category field indicates a validation error

#### Scenario: Optional fields are available

- **WHEN** a user opens the "more details" section while adding a product
- **THEN** brand, serial number, and retailer fields are available without being required, and if a price is provided it is validated as a positive number with at most 2 decimal places

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

The system SHALL allow a product to have multiple coverages, each with a source (manufacturer, retailer, international, other), a scope (local, international), a duration, and an optional contact and notes. Source and scope labels SHALL be presented with consistent title-case capitalization in every control that selects or displays them. If a contact email is provided, it SHALL be a valid email address. If a contact URL is provided, it SHALL be a valid URL.

#### Scenario: Add a second coverage

- **WHEN** a user adds a coverage to a product that already has one
- **THEN** both coverages are stored and shown independently

#### Scenario: Coverage start date defaults to purchase date

- **WHEN** a user does not set an explicit coverage start date
- **THEN** the coverage start date equals the product's purchase date

#### Scenario: Duration presets

- **WHEN** a user picks a coverage duration
- **THEN** preset durations (6 months, 1, 2, 3, 5 years, Lifetime, Custom) are offered, with Custom accepting a number of months or an explicit end date

#### Scenario: Custom months validation

- **WHEN** a user selects Custom duration and enters a value that is not a positive integer between 1 and 240
- **THEN** the form indicates a validation error and the coverage is not saved

#### Scenario: Contact validation

- **WHEN** a user provides a contact email that is not a valid email address, or a contact URL that is not a valid URL
- **THEN** the form indicates a validation error and the coverage is not saved

#### Scenario: Source and scope labels are consistently capitalized

- **WHEN** a user selects a coverage source or scope in any form or dialog
- **THEN** the options are shown in title case (e.g., "Manufacturer", "Retailer", "Local", "International") regardless of entry point

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

### Requirement: Product form field validation

The system SHALL validate product form fields on submission: price, if provided, SHALL be greater than 0, have at most 2 decimal places, and not exceed 1,000,000; custom months, when duration is Custom, SHALL be a positive integer between 1 and 240; manual expiry date, if provided, SHALL NOT precede the purchase date.

#### Scenario: Price must be positive

- **WHEN** a user enters a price that is zero or negative
- **THEN** the form indicates a validation error and the product is not saved

#### Scenario: Price decimal places

- **WHEN** a user enters a price with more than 2 decimal places (e.g. 0.00099)
- **THEN** the form indicates a validation error and the product is not saved

#### Scenario: Price maximum

- **WHEN** a user enters a price exceeding 1,000,000
- **THEN** the form indicates a validation error and the product is not saved

#### Scenario: Custom months is a positive integer

- **WHEN** a user selects Custom duration and enters a non-integer or a value outside 1-240
- **THEN** the form indicates a validation error and the product is not saved

#### Scenario: Manual expiry not before purchase date

- **WHEN** a user sets a manual expiry date that precedes the purchase date
- **THEN** the form indicates a validation error and the product is not saved

### Requirement: Brand and retailer autocomplete

The system SHALL provide autocomplete suggestions for brand and retailer fields in the product form, drawing from a curated catalog of known brands and Singapore/worldwide retailers. Suggestions SHALL be ranked with category-aware ordering (brands matching the selected product category appear first). The autocomplete SHALL be a free-text combobox — suggestions are offered but the user may type any value not in the catalog. The autocomplete SHALL support keyboard navigation (arrow keys, Enter to select, Escape to close), display matched substring highlighting, show a "No matches found" state when no suggestions match, and provide a clear button to reset the field.

#### Scenario: Brand suggestions appear on typing

- **WHEN** a user types in the brand field
- **THEN** a dropdown appears showing brands whose names contain the typed text, with prefix matches ranked before substring matches

#### Scenario: Category-aware brand ranking

- **WHEN** a user has selected a category and types in the brand field
- **THEN** brands associated with the selected category appear before brands without that association

#### Scenario: Retailer suggestions appear on typing

- **WHEN** a user types in the retailer field
- **THEN** a dropdown appears showing retailers whose names contain the typed text

#### Scenario: Free-text entry allowed

- **WHEN** a user types a brand or retailer name that does not match any suggestion
- **THEN** the typed value is accepted as-is when the form is submitted

#### Scenario: Keyboard navigation

- **WHEN** the suggestion dropdown is open
- **THEN** the user can navigate with arrow keys, select with Enter, and close with Escape

#### Scenario: Clear button resets field

- **WHEN** a user clicks the clear button on a brand or retailer field
- **THEN** the field value is cleared and the suggestion dropdown closes

#### Scenario: No matches found

- **WHEN** a user types text that matches no suggestions in the catalog
- **THEN** the dropdown displays a "No matches found" message
