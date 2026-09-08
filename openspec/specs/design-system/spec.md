# design-system Specification

## Purpose

Defines the shared visual foundation of the application — color palette, typography, iconography, spacing, border-radius, and elevation — as a single reusable system so every screen reads as one deliberate, professional design.

## Requirements

### Requirement: Brand color palette

The system SHALL use the Stitch-derived brand palette — a slate/ink primary (#0f172a family), cobalt secondary (#2563eb family), and emerald tertiary — over a cool near-white canvas (#f8f9ff family) with white level-1 surfaces, applied consistently across light and dark modes. The primary action color SHALL be the slate/ink primary, not the default Material blue.

#### Scenario: Light mode uses the brand palette

- **WHEN** the app is viewed in light mode
- **THEN** primary actions, links, and active accents use the slate primary color and the page background is a cool near-white

#### Scenario: Dark mode uses the brand palette

- **WHEN** the app is viewed in dark mode
- **THEN** the same slate/cobalt/emerald palette is presented with dark-appropriate variants and adequate contrast

#### Scenario: Semantic status colors remain distinct

- **WHEN** a warranty status is displayed
- **THEN** active, expiring-soon, and expired states use distinct semantic colors (emerald, amber, rose) in addition to text, and are legible in both light and dark mode

### Requirement: Typography

The system SHALL use a single sans-serif typeface (Inter) for all text — body, labels, forms, headings, and display — with a defined, fluid type scale and no raw pixel font sizes baked into components. Numerals in data contexts (prices, dates, serials, counts) SHALL use tabular figures.

#### Scenario: Display headings use the sans face

- **WHEN** the landing hero or a page title is rendered
- **THEN** it uses Inter with tight tracking and fluid (clamp-based) sizing that scales across viewports

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

### Requirement: Surface elevation and card treatment

The system SHALL use a surface-container elevation language: resting content surfaces are near-white cards with a subtle ambient shadow and 1px hairline border, and deeper surfaces (hovered cards, menus, dialogs, floating actions) use progressively stronger shadows. Cards SHALL NOT rely on color fill alone to separate from the canvas.

#### Scenario: Cards sit on an elevated surface

- **WHEN** a product or coverage card is rendered
- **THEN** it uses a near-white surface with a soft shadow and hairline border that reads distinctly from the page canvas

#### Scenario: Floating surfaces use raised elevation

- **WHEN** a floating surface (FAB, menu, or dialog) is shown
- **THEN** it uses a raised shadow token distinct from any resting card

### Requirement: Editorial conventions

The system SHALL use Title Case for user-facing UI text — headings, labels, buttons, links, statuses, chips, and short messages — capitalizing every major word while keeping minor words (articles, conjunctions, and short prepositions such as `of`, `in`, `to`, `the`, `a`, `an`, `and`, `or`, `with`, `for`) lowercase unless they are the first or last word. The system SHALL keep long-form prose (legal and marketing body copy, descriptive error paragraphs) in sentence case, SHALL avoid all-caps labels, SHALL NOT use em-dashes as meta-text separators (using a middot instead), and SHALL render numbers with tabular figures.

#### Scenario: Labels are not all-caps

- **WHEN** any label or button text is rendered
- **THEN** it is in Title Case, not transformed to uppercase

#### Scenario: Headings and statuses use Title Case

- **WHEN** a page title, card title, section heading, status, or chip is rendered
- **THEN** each major word is capitalized and minor words are lowercase (for example, "My Warranties", "Account Settings", "Expiring Soon", "Lifetime Coverage", "Proof of Purchase")

#### Scenario: Proper nouns keep their capitalization

- **WHEN** a proper noun such as "Warranty Tracker", "Google", or "Firebase" appears in any copy
- **THEN** its capitalization is preserved regardless of Title Case

#### Scenario: Long-form prose stays sentence case

- **WHEN** legal body copy, a marketing lede, or a multi-clause error paragraph is rendered
- **THEN** it uses sentence case rather than Title Case

#### Scenario: Meta text uses middot separators

- **WHEN** secondary metadata combines multiple fields (for example, category and coverage count)
- **THEN** fields are separated with a middot, not an em-dash

### Requirement: Accessible contrast

The system SHALL meet WCAG AA contrast for all text and non-text elements across both light and dark modes.

#### Scenario: Text is readable in both modes

- **WHEN** any text is displayed on its background in light or dark mode
- **THEN** its contrast ratio meets WCAG AA (at least 4.5:1 for normal text)
