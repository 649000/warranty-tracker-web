# design-system Specification

## Purpose

Defines the shared visual foundation of the application — color palette, typography, iconography, spacing, border-radius, and elevation — as a single reusable system so every screen reads as one deliberate, professional design.

## Requirements

### Requirement: Brand color palette

The system SHALL use a defined teal/slate/sage brand palette with a cool neutral background, applied consistently across light and dark modes. The primary action color SHALL be a desaturated teal, not the default Material blue.

#### Scenario: Light mode uses the brand palette

- **WHEN** the app is viewed in light mode
- **THEN** primary actions, links, and active accents use the teal primary color and the page background is a cool neutral, not a warm cream

#### Scenario: Dark mode uses the brand palette

- **WHEN** the app is viewed in dark mode
- **THEN** the same teal/slate/sage palette is presented with dark-appropriate variants and adequate contrast

#### Scenario: Semantic status colors remain distinct

- **WHEN** a warranty status is displayed
- **THEN** covered, expiring-soon, and expired states use distinct semantic colors (green, amber, muted) in addition to text, and are legible in both light and dark mode

### Requirement: Typography and type scale

The system SHALL use a two-family typography system — a UI sans (Inter) for body, labels, forms, and numerals, and a serif (Newsreader) for large display headings — with a defined, fluid type scale and no raw pixel font sizes baked into components.

#### Scenario: Display headings use the serif

- **WHEN** the landing hero or a page title is rendered
- **THEN** it uses the serif display face with fluid (clamp-based) sizing that scales across viewports

#### Scenario: Numerals align in lists

- **WHEN** prices, dates, or counts are shown in a list
- **THEN** they use tabular numerals so digits align vertically

### Requirement: Icon system

The system SHALL use Material Symbols in the outlined style consistently for all icons, with the filled variant reserved for a selected/active state.

#### Scenario: Icons render in outlined style

- **WHEN** an icon is displayed in a button, list, or empty state
- **THEN** it renders in the outlined style (unfilled) and remains legible at all sizes

### Requirement: Spacing scale

The system SHALL define a shared spacing scale based on a 4px grid and SHALL reuse those spacing tokens across components rather than ad-hoc pixel values.

#### Scenario: Consistent component spacing

- **WHEN** cards, forms, and buttons are laid out
- **THEN** their padding and gaps derive from the shared spacing tokens

### Requirement: Border-radius scale

The system SHALL define a shared border-radius scale and SHALL apply it consistently so cards, forms, buttons, and dialogs share the same rounding language.

#### Scenario: Consistent corner rounding

- **WHEN** any card, input, button, chip, or dialog is rendered
- **THEN** its corner radius matches one of the defined scale values appropriate to its size

### Requirement: Elevation and card treatment

The system SHALL use outlined cards (border, no drop shadow) as the default surface treatment, with drop shadows reserved for hover/elevated states and for floating surfaces (FAB, menus, dialogs). Cards SHALL NOT all carry an identical drop shadow.

#### Scenario: Cards are outlined by default

- **WHEN** a product or coverage card is rendered
- **THEN** it uses a border outline and no drop shadow

#### Scenario: Shadows are reserved for elevation

- **WHEN** a floating surface (FAB, menu, or dialog) is shown
- **THEN** it uses a raised shadow token distinct from any resting card

### Requirement: Editorial conventions

The system SHALL avoid all-caps labels, SHALL NOT use em-dashes as meta-text separators (using a middot instead), and SHALL render numbers with tabular figures.

#### Scenario: Labels are not all-caps

- **WHEN** any label or button text is rendered
- **THEN** it is in sentence case, not transformed to uppercase

#### Scenario: Meta text uses middot separators

- **WHEN** secondary metadata combines multiple fields (for example, category and coverage count)
- **THEN** fields are separated with a middot, not an em-dash

### Requirement: Accessible contrast

The system SHALL meet WCAG AA contrast for all text and non-text elements across both light and dark modes.

#### Scenario: Text is readable in both modes

- **WHEN** any text is displayed on its background in light or dark mode
- **THEN** its contrast ratio meets WCAG AA (at least 4.5:1 for normal text)
