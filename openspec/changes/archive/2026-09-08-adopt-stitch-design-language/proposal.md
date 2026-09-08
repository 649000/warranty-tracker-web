## Why

The app's current visual language (teal/slate/sage Material palette, Newsreader serif display type, thin outlined cards) reads as generic and less polished than the Google Stitch reference we now own. We want a single, professional, cohesive design language across every page — public and authenticated — adapted from the Stitch screens rather than pixel-copied, while keeping all existing features, data model, routes, and Angular Material underpinnings intact.

## What Changes

- Replace the Material 3 brand palette with the Stitch language: slate/ink primary (`#0f172a`), cobalt secondary (`#2563eb`), emerald tertiary, cool surface-container ladder, and emerald/amber/rose status semantics (active / expiring-soon / expired).
- Replace the two-family typography (Inter + Newsreader serif) with Inter throughout; keep tabular numerals for data (dates, prices, serials).
- Adopt the Stitch surface/elevation language (white level-1 cards, soft shadows, 8/12/16/pill radii) while retaining Material components for interactive controls.
- Introduce a shared public `site-header` + `site-footer` so landing, auth, legal, and 404 pages share one chrome instead of each hand-rolling a header.
- Re-skin the authenticated shell header to the Stitch top-header language (logo + brand, nav, theme toggle, account menu).
- Replace the `verified_user` icon brand mark and favicon with the Stitch logo.
- Restyle page surfaces and sections per the Stitch reference while preserving every existing behavior, form flow, and data requirement:
  - Landing hero + feature sections
  - Auth pages (login, signup, forgot/reset password)
  - Legal pages and 404
  - Warranty list → dashboard (metric cards, search, status filter pills, product cards)
  - Product add/edit form (sectioned card layout)
  - Product detail (summary banner, expiring alert strip, coverage cards)
  - Account settings
- Restyle shared status badge to the Stitch pill-with-dot form; add small shared pieces (metric card, filter pill, product thumbnail fallback).
- Use Stitch photos only decoratively (landing/empty-state imagery). Never show a stock photo on a user's real product card.
- Theme behavior is unchanged: System default with a persisted Light/Dark toggle.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system`: Brand palette, typography, status colors, and card/elevation treatment change to the Stitch language. Editorial conventions are unchanged.
- `public-site`: Public pages adopt a shared site header/footer and the Stitch language.
- `warranties`: The warranty list becomes a dashboard with live metric summaries and search, plus Stitch-styled product cards; add/edit form and detail page adopt the new language.

### Unchanged Capabilities (restyle only, no requirement delta)

- `theme` — preference model and persisted toggle unchanged; palette derives from `design-system`.
- `responsive-ui` — existing breakpoint/no-overflow requirements continue to hold over the new layout; no requirement text changes.
- `account-management` — page re-skinned only.

## Impact

- `src/styles.scss` — full Material theme + token rework (palettes, typography, surfaces, status, spacing/radius/elevation).
- `src/index.html` — favicon, font load (Inter only).
- New shared components: `site-header`, `site-footer`; updated `shell/*`.
- Feature components + templates/styles: `landing`, `auth/*`, `legal/*`, `not-found`, `account/*`, `warranties/*` (list, product-form, warranty-detail, coverage-dialog, proof-input/lightbox), `shared/status-badge`.
- Assets: Stitch `logo.svg` into `public/`, favicon; decorative photos copied under `src/assets/`.
- Unit tests and Playwright e2e touching copy/selectors/theme assertions.
