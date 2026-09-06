## Purpose

Ensures the entire application is usable and well-laid-out on mobile, tablet, and desktop viewports, using fluid layouts first with minimal breakpoint guards so no screen overflows or becomes hard to use at any size.

## ADDED Requirements

### Requirement: No horizontal scroll

The system SHALL render every screen without horizontal scrolling on viewports of 320px and wider.

#### Scenario: Narrow viewport has no horizontal overflow

- **WHEN** any screen is viewed at 320px width
- **THEN** all content fits within the viewport and no horizontal scrollbar appears

### Requirement: Shell toolbar reflow

The system SHALL keep the app toolbar usable on narrow viewports by collapsing the brand to its icon when space is limited while preserving the theme and account actions as touch-friendly icon buttons.

#### Scenario: Brand collapses on small screens

- **WHEN** the shell toolbar is viewed on a narrow screen
- **THEN** the brand text is hidden or truncated to its icon and the theme and account controls remain accessible

### Requirement: Warranty list grid

The system SHALL lay out the warranty list as a responsive grid that shows one column on mobile, two on tablet, and three or more on desktop.

#### Scenario: List adapts to viewport

- **WHEN** the warranty list is viewed across mobile, tablet, and desktop widths
- **THEN** cards reflow into one, two, or three-plus columns respectively without overflow

### Requirement: Warranty detail reflow

The system SHALL reflow the product detail page on narrow viewports so the title and actions stack and claim-info rows display their label above the value instead of side by side.

#### Scenario: Detail header stacks on narrow screens

- **WHEN** a product detail page is viewed on a narrow screen
- **THEN** the product title and its edit/more actions stack vertically without crowding

#### Scenario: Claim rows stack label over value

- **WHEN** claim information is viewed on a narrow screen
- **THEN** each row shows its label above its value rather than side by side

### Requirement: Product form reflow

The system SHALL reflow the product form on narrow viewports so multi-column field groups (for example, price amount and currency) collapse to a single column and toggle and chip groups wrap.

#### Scenario: Price fields stack on narrow screens

- **WHEN** the price amount and currency fields are shown on a narrow screen
- **THEN** they stack into a single column

### Requirement: Dialog and lightbox sizing

The system SHALL size dialogs and the proof lightbox to fit the viewport on mobile, constraining height with internal scrolling while keeping actions reachable.

#### Scenario: Dialog fits a mobile viewport

- **WHEN** a dialog (for example, add coverage) opens on a mobile viewport
- **THEN** it is no wider than the viewport and its content scrolls while the action buttons remain visible

#### Scenario: Lightbox fits the viewport

- **WHEN** an image proof is opened in the lightbox on a mobile viewport
- **THEN** the image is scaled to fit and the close control is reachable

### Requirement: Auth page reflow

The system SHALL render the authentication pages on a narrow viewport so the card fits the width and the secondary links (for example, forgot password and create account) wrap without overflow.

#### Scenario: Auth links wrap on narrow screens

- **WHEN** the sign-in or sign-up page is viewed on a narrow screen
- **THEN** the card fits the viewport and the secondary action links wrap cleanly

### Requirement: Landing page reflow

The system SHALL reflow the landing page so the top navigation and feature grid adapt without overflow on narrow viewports.

#### Scenario: Landing navigation adapts on narrow screens

- **WHEN** the landing page is viewed on a narrow screen
- **THEN** the top navigation remains usable and its controls wrap or collapse without overflow

### Requirement: Touch targets

The system SHALL provide touch targets of at least 44px for interactive elements on touch viewports.

#### Scenario: Interactive elements are easy to tap

- **WHEN** the app is used on a touch device
- **THEN** interactive controls have a hit area of at least 44px

### Requirement: Safe-area handling

The system SHALL respect device safe-area insets so fixed controls (for example, the floating action button) are not obscured on notched devices.

#### Scenario: Fixed controls clear the safe area

- **WHEN** the app is used on a device with a notch or home indicator
- **THEN** fixed controls are inset within the safe area and remain reachable
