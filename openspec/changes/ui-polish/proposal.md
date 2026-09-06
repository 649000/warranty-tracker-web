## Why

The app works but does not yet look or behave like a professionally designed product. It relies on the default Material blue/cyan palette and Roboto, mixes ad-hoc raw pixel values across components, and has no shared spacing, radius, or elevation system. Responsiveness is accidental: some screens reflow via `auto-fill`/`flex-wrap`/`clamp()`, but others (warranty detail header and claim rows, auth links, landing topbar, toolbar brand, dialogs) crowd or overflow on narrow viewports. For a professional showcase, the UI needs one deliberate design system and consistent desktop/tablet/mobile behavior.

## What Changes

- **Visual design system**: replace the default Material blue/cyan theme with a calm, trustworthy teal/slate/sage palette (light + dark); introduce Inter (UI/body/numerals) and Newsreader (display serif for hero and page headings); standardize icons on Material Symbols Outlined.
- **Shared scales**: define spacing (4px base) and border-radius (8/12/16/999px) scales as tokens and reuse them across cards, forms, buttons, and dialogs so the app reads as one system.
- **Elevation discipline**: outlined cards (border, no shadow) by default, one hover shadow token, one raised token for FAB/menus/dialogs only — no identical drop-shadow on every card.
- **Editorial anti-patterns codified**: no all-caps labels, no em-dashes in meta text (middot `·` instead), tabular numerals for price/date/count data.
- **Universal responsiveness**: fluid-first layout with minimal `@media` guards so every screen works on mobile (320px+), tablet, and desktop — no horizontal scroll, touch targets ≥44px, safe-area insets, and per-screen reflow (list, detail, forms, dialogs, auth, landing, legal, shell).
- **BREAKING**: none — visual and layout-only; no data model, routing, or behavior changes.

## Capabilities

### New Capabilities

- `design-system`: the shared visual foundation — color palette (light + dark), typography and type scale, icon system, spacing and border-radius scales, elevation rules, and editorial anti-pattern rules.
- `responsive-ui`: consistent desktop/tablet/mobile reflow and usability for every screen — fluid layout guarantees, touch targets, safe-area handling, and per-screen stacking behavior.

### Modified Capabilities

None — no existing requirement text changes. `public-site` already declares the landing page is responsive; this change adds the underlying system without narrowing or contradicting that requirement.

## Impact

- **Code**: `src/styles.scss` (Material 3 `mat.theme()` reconfigure with custom palettes and Inter/Newsreader typography, global tokens and utilities), the icon font setup in `index.html`, and component CSS across `shell`, `warranties` (list, detail, product form, coverage dialog, proof input), `auth`, `landing`, and `legal` to reference tokens instead of raw px and to apply reflow rules.
- **Dependencies added**: self-hosted or Google Fonts loads for Inter and Newsreader and Material Symbols Outlined. No new npm packages.
- **Config**: none.
- **Free tier**: no change (fonts/icons self-hosted or via Google Fonts, no paid services).
