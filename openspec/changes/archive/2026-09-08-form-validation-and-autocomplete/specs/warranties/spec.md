# warranties Specification (delta)

## MODIFIED Requirements

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

## ADDED Requirements

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
