## Context

The app is Angular v22 with Angular Material 3, themed via `@use '@angular/material' as mat` + `mat.theme()` in `src/styles.scss`. Today it uses `mat.$blue-palette` / `mat.$cyan-palette`, Roboto, and the default (filled) Material Icons font via `<mat-icon>`. Components are standalone; styling lives in per-component `.css` files with raw pixel values. The shell caps content at 1100px; the warranty list uses `auto-fill minmax(280px,1fr)`; the landing page already uses `clamp()` type. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- One token-driven design system (color, type, spacing, radius, elevation) consumed by every component.
- Consistent outlined iconography and two deliberate typefaces.
- Universal responsiveness (fluid-first, minimal breakpoint guards) with no horizontal scroll at 320px+.

**Non-Goals:**
- No data model, routing, or business-logic changes.
- No new npm packages; fonts/icons via Google Fonts (self-hosting acceptable later).
- No bespoke tablet-specific layout — fluid layouts plus breakpoint guards only.

## Decisions

### 1. Token layer in `styles.scss` (custom properties)
Define design tokens as CSS custom properties on `:root` (and `html.dark` overrides), then let components reference them. This keeps the system in one place, avoids a build-time token pipeline, and matches the existing plain-CSS-per-component convention.
- Spacing: `--space-1`…`--space-16` (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px).
- Radius: `--radius-sm` (8), `--radius-md` (12), `--radius-lg` (16), `--radius-full` (999px).
- Type: `--type-display`, `--type-h1`…`--type-caption` with `clamp()`.
- Elevation: `--shadow-hover`, `--shadow-raised`.
- Utilities: `.u-truncate` (brand), overflow guards (`overflow-wrap: anywhere`, `min-width: 0`), `.visually-hidden` (already exists).
*Alternative considered*: SCSS maps + `@include` mixins. Rejected — plain custom properties are simpler to consume in per-component CSS and require no build changes.

### 2. Material 3 theme reconfigure (custom palettes + typography)
Keep `mat.theme()` but map `primary` to a custom teal palette, `secondary` to slate, `tertiary` to sage, and set typography to Inter/Newsreader. Material 3 palette maps can be derived from seed hexes (`#0E6B63`) via `mat.define-theme`, or hand-mapped onto the M3 tonal system. Semantic status colors (covered/expiring/expired/danger) stay in the `status-badge` component as light-dark token pairs (as today) so they remain decoupled from the theme's core.
*Alternative considered*: drop Material theming and hand-roll CSS. Rejected — Material components (form fields, chips, dialogs, menus) already rely on `--mat-*` tokens; reconfiguring the theme is far less risky and preserves component behavior.

### 3. Typeface loading (Inter + Newsreader)
Load Inter and Newsreader via Google Fonts `<link>` in `index.html` (replacing the Roboto link), with `font-display: swap`. Configure the Material typography token to use Inter for default/body, and apply Newsreader at the `.hero h1` / page `h1` level via a token (`--type-display`) rather than Material's typography role. Keep Roboto only if needed as a fallback stack.
*Alternative considered*: self-hosting via `@font-face`. Acceptable later; Google Fonts keeps this change dependency-free and fast.

### 4. Icon font swap (Material Symbols Outlined)
Switch the icon font from Material Icons (filled) to Material Symbols Outlined. Load the variable Symbols font and, once at the `mat-icon` layer (in `styles.scss`), set `font-family: 'Material Symbols Outlined'` and `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`. No per-component icon renames are needed (all current names exist in Symbols). Reserve `FILL 1` for a selected/active state only.
*Alternative considered*: self-hosted Symbols with a dedicated `MatIconRegistry`. Rejected — the font swap is sufficient and simplest; registry override adds complexity with no current benefit.

### 5. Elevation discipline
Standardize cards on `appearance="outlined"` (border, no shadow). Introduce exactly two shadow tokens: `--shadow-hover` (hover elevation, replacing the current `.product-card:hover` transform/shadow) and `--shadow-raised` (FAB, menus, dialogs). Remove any implicit identical card shadows.
*Alternative considered*: keep Material elevation ramp. Rejected — the current mixed usage is exactly the "identical shadows everywhere" anti-pattern being removed.

### 6. Responsiveness: fluid-first + guards
Rely on fluid techniques (CSS grid `auto-fit minmax`, `flex-wrap`, `clamp()` type) for the base layout, and add `@media` guards only where fluid cannot reflow (stacking `dt`/`dd`, header stacking, dialog full-width). Guards at 600px and 960px. Add `env(safe-area-inset-*)` padding to the FAB and shell. Enforce touch targets ≥44px by bumping icon-button hit areas where needed.
*Alternative considered*: a CSS grid/flex breakpoint framework. Rejected — overkill for this surface; plain media queries are clearer and dependency-free.

## Risks / Trade-offs

- [Material 3 palette mapping may drift from the hex spec if seeded] → Verify rendered tokens against the spec hexes and adjust tonal stops until they match; lock the final mapping in the theme file.
- [Symbols font swap could shift icon metrics/baseline] → Spot-check every icon at all three viewport widths; fix any `mat-icon` sizing with `font-size`/`line-height` normalization.
- [Inter/Newsreader swap could change text metrics and cause subtle layout shifts] → Compare before/after at 375/768/1280; rely on tokens so any adjustment is centralized.
- [Google Fonts adds an external dependency to rendering] → Use `preconnect` + `font-display: swap`; self-host as a follow-up if desired.
- [Contrast on the teal-on-cool-gray combinations may fall short at low weights] → Run an automated contrast check during the quality gate and tune token values if needed.

## Migration Plan

1. Introduce tokens + theme + icon/type swaps in `styles.scss` and `index.html` with no component changes; verify the app still builds and renders.
2. Migrate components to tokens and apply reflow rules incrementally (shell → list → detail → forms/dialogs → proof → auth → landing/legal).
3. Run the quality gate (build/lint/test + Playwright viewports + AXE + contrast), then archive the change.
- Rollback: revert the `styles.scss`/`index.html`/component CSS changes; no data or API surface is affected.

## Open Questions

None.
