## Context

The app is Angular v22 + Angular Material (Material 3 theming via `mat.theme`), Firebase, SCSS with design tokens, and standalone components using signal state. Today it uses teal/slate/sage palettes, Newsreader serif for display headings, and thin outlined cards (see `proposal.md`). We own four Google Stitch reference screens + a logo (`reference/screens/*.html|png`, `logo.svg`) that define the target language. Requirements are defined by the modified capabilities in the delta specs.

## Goals / Non-Goals

**Goals:**
- One cohesive Stitch-derived design language applied identically in light and dark modes across all routes.
- Keep Material as the interaction layer (buttons, chips, form fields, menus, dialogs, snackbars) and re-theme it; build only small bespoke pieces where Material has no equivalent.
- Preserve every route, feature, behavior, data model, and accessibility (WCAG AA) contract.
- Theme behavior untouched: System default, persisted Light/Dark cycle.

**Non-Goals:**
- No new pages (no Categories / Export & Claims), no new data fields, no claims/OCR/demo features shown in the reference.
- Not a pixel-for-pixel port of the reference HTML (its layout uses hardcoded demo content).
- No new styling framework (no Tailwind); Stitch tokens are re-expressed in our SCSS token system and Material theme.

## Decisions

### D1 — Token strategy: single source in `styles.scss`
Define the Stitch palette as Material 3 palette maps and re-theme through `mat.theme` (primary/secondary/tertiary), and keep a parallel set of plain CSS custom properties (`--surface-container-low`, status vars, radius/elevation/type) that components use. Reason: Material drives the interactive controls; CSS vars drive custom chrome; both already exist, so no new architecture. Alternative (Tailwind utility port) rejected — would add a framework and fight Material.

### D2 — Typography: Inter only, tabular numerals retained
Drop the Newsreader serif role and the global `h1 { font-family: serif }` rule; use Inter for all text. Keep `font-variant-numeric: tabular-nums` on data-bearing text (dates, prices, serials, counts). Keep the existing fluid type-scale tokens, retuned to Inter. Headline hierarchy follows Stitch (tight tracking `-0.02em` on display/headline).

### D3 — Elevation/surface: cards get soft shadows + hairline border
Replace the "outlined cards, no shadow" convention with the Stitch level system: canvas `#f8f9ff`, level-1 cards white with `0 1px 3px` slate-tinted shadow and 1px border, floating surfaces raised. Implement via Material outlined/filled card appearances plus CSS var overrides so `mat-card` and custom surfaces stay consistent. Radius ladder: 8 (inputs/chips/buttons), 12 (cards/sections), 16 (dialogs/sheets), pill (status/badges).

### D4 — Shared public chrome components
New `site-header` and `site-footer` standalone components used by landing/auth/legal/404 routes, and the authenticated `shell` is re-skinned to match their look while keeping its own content (theme toggle + account menu, nav to Warranties/Add Product/Account Settings). The public header omits app nav and shows Sign In / Get Started. Reason: today each public page duplicates a header; a shared pair removes drift.

### D5 — Status visuals
Map `CoverageStatus` → pill-with-dot: active=emerald, expiring-soon=amber, expired=rose. Introduce the "status rail" (left accent on product cards) and status-tinted chips using the surface/on-surface token pairs defined in D1. Keep label text so color is never the only signal. Extend the existing `status-badge` rather than forking per page.

### D6 — Product imagery fallback
Product cards never show a stock photo. Render the user's proof-of-purchase image only when it is genuinely a product photo; otherwise show a category icon tile (`devices_other`, `tv`, `coffee_maker`, etc. keyed by category). Stitch photos are used only in decorative marketing/empty-state contexts via copied assets under `src/assets/`.

### D7 — Dashboard = existing list page, not new route
The list component (`/warranties`) is restyled in place: metric cards (derived Active/Expiring/Expired counts + "needs review"), search filter, status filter pills with counts, and product cards. No new route; all behavior (signals, product service) reused. Category filter and grid/table toggle are not added (no model support for grid modes; keep scope tight).

### D8 — Theme mode remains a service-level concern
`ThemeService` (System default, persisted cycle, `html.dark`) is unchanged. Its resolved class drives both `mat.theme` color schemes and the new CSS-var dark values in `styles.scss`.

## Risks / Trade-offs

- [Broad visual change may regress AXE/AA contrast or break tests/copy selectors] → Restyle to the new tokens, then run `ng build`, unit tests, and Playwright; update only selectors/copy the redesign legitimately changes.
- [Semantic status recolor (expired "muted" → rose) conflicts with prior editorial spec] → Intentional; delta spec for `design-system` records it; status text remains non-color signal.
- [Removing Newsreader changes brand feel on marketing pages] → Accepted (Stitch is Inter-only); headline tracking/size tuned so hero retains polish.
- [Mixed Material custom chrome can drift] → Centralize all shared look in `styles.scss` tokens and a small shared component set; avoid per-page raw colors.
- [Hardcoded reference demo values (counts, names) tempt 1:1 copying] → Non-goal: all data comes from live services.

## Migration Plan

Single forward change; deploy normally via existing CI. Rollback = revert the change (styles/component templates are self-contained). No data migration, no schema change. Landing/auth/legal/account restyle and app restyle may land in the same tasks sequence; each step keeps the app compiling and tests passing.

## Open Questions

None.
