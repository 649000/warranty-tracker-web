## MODIFIED Requirements

### Requirement: Add a product

The system SHALL let a user add a product with a name, a purchase date, a category, and at least one coverage. Category SHALL be required and selected from a fixed taxonomy with an "Other" option. Brand, serial number, retailer, price, and proof of purchase SHALL be optional and always visible in the form (no toggle or collapsible section). The default currency SHALL be SGD. If a price is provided, it SHALL be a positive number with at most 2 decimal places and SHALL NOT exceed 1,000,000.

#### Scenario: Add product with minimal input

- **WHEN** a user provides a name, selects a category, accepts the default purchase date, and picks a duration
- **THEN** a product is created with a single coverage and appears in the warranty list

#### Scenario: Category is required

- **WHEN** a user attempts to save a product without selecting a category
- **THEN** the form is not submitted and the category field indicates a validation error

#### Scenario: Optional fields are available

- **WHEN** a user opens the add-product form
- **THEN** brand, serial number, retailer, price/currency, and proof of purchase fields are all visible without toggling any section

#### Scenario: Category from fixed taxonomy

- **WHEN** a user selects a category
- **THEN** only categories from the fixed list (including "Other") are offered

#### Scenario: Duplicate product name allowed

- **WHEN** a user adds a product with the same name as an existing one
- **THEN** the product is still created (no uniqueness enforced)

### Requirement: Product details

The system SHALL display product and purchase details on the product detail page: purchase date (always shown), serial number, retailer, price (when set), and proof of purchase. The section heading SHALL be "Product Details". The purchase date SHALL be displayed as the first row of the Product Details card.

#### Scenario: Purchase date is displayed

- **WHEN** a user views the product detail page
- **THEN** the purchase date is visible in the Product Details section

#### Scenario: Product details appear before coverage

- **WHEN** a user views the product detail page
- **THEN** the Product Details section appears above the Coverage section

#### Scenario: Coverage contact is tappable

- **WHEN** a coverage has a contact hotline, email, or URL and the user expands the coverage
- **THEN** the contact is shown as an actionable link
