## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Typography and type scale

**Reason**: The Stitch language is Inter-only; the two-family system (serif Newsreader display role) is dropped so the product reads as one consistent sans face.

**Migration**: The single-face Inter requirement "Typography" replaces this requirement; Newsreader is no longer loaded and display headings render in Inter.

### Requirement: Elevation and card treatment

**Reason**: Outlined no-shadow cards are replaced by the Stitch surface-container elevation language (near-white level-1 cards with a soft shadow and hairline border).

**Migration**: The "Surface elevation and card treatment" requirement replaces this one; outlined appearance is no longer the default card treatment.

## ADDED Requirements

### Requirement: Typography

The system SHALL use a single sans-serif typeface (Inter) for all text — body, labels, forms, headings, and display — with a defined, fluid type scale and no raw pixel font sizes baked into components. Numerals in data contexts (prices, dates, serials, counts) SHALL use tabular figures.

#### Scenario: Display headings use the sans face

- **WHEN** the landing hero or a page title is rendered
- **THEN** it uses Inter with tight tracking and fluid (clamp-based) sizing that scales across viewports

#### Scenario: Numerals align in lists

- **WHEN** prices, dates, or counts are shown in a list
- **THEN** they use tabular numerals so digits align vertically

### Requirement: Surface elevation and card treatment

The system SHALL use a surface-container elevation language: resting content surfaces are near-white cards with a subtle ambient shadow and 1px hairline border, and deeper surfaces (hovered cards, menus, dialogs, floating actions) use progressively stronger shadows. Cards SHALL NOT rely on color fill alone to separate from the canvas.

#### Scenario: Cards sit on an elevated surface

- **WHEN** a product or coverage card is rendered
- **THEN** it uses a near-white surface with a soft shadow and hairline border that reads distinctly from the page canvas

#### Scenario: Floating surfaces use raised elevation

- **WHEN** a floating surface (FAB, menu, or dialog) is shown
- **THEN** it uses a raised shadow token distinct from any resting card
