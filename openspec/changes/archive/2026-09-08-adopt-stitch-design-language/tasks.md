## 1. Theme & token layer

- [x] 1.1 Rework `src/styles.scss` Material palettes to Stitch slate primary / cobalt secondary / emerald tertiary (light + dark) and update design-token CSS vars (surface-container ladder, status vars, radius/elevation) and verify `ng build` succeeds
- [x] 1.2 Replace typography: drop Newsreader (plain-family only), retune fluid type tokens to Inter with tight tracking, keep tabular-num utility, and verify no remaining `Newsreader` references in `src/`
- [x] 1.3 Update `src/index.html` font link (Inter only) and favicon; add Stitch `logo.svg` under `public/` and verify the app loads the new favicon/brand asset

## 2. Shared chrome

- [x] 2.1 Add `site-header` component (brand logo + name, theme control, Sign In/Get Started links) and `site-footer` (brand, Terms/Privacy links), verify both render and pass AXE in a smoke route
- [x] 2.2 Update landing, auth (login/signup/forgot/reset), legal, and 404 to use the shared header/footer and Stitch surfaces; verify routes render without horizontal scroll at 320px and `ng build` passes
- [x] 2.3 Re-skin `shell.component` header to the Stitch top-header language (logo+brand, nav Warranties/Add Product, theme toggle, account menu unchanged) and verify account menu items and sign-out still work via existing unit/e2e expectations

## 3. Shared components

- [x] 3.1 Restyle `status-badge` to pill-with-dot (active=emerald, expiring-soon=amber, expired=rose) with WCAG-AA contrast in light/dark, verify existing badge tests pass
- [x] 3.2 Add small shared pieces (`metric-card`, `filter-pill`, `product-thumb` category-icon fallback, serial copy control) and verify each renders with accessible labels in a component test

## 4. Warranties restyle

- [x] 4.1 Restyle the warranty list page into the dashboard: metric cards (active/expiring/expired counts derived live), search box, status filter pills with counts, product cards with status accent + brand/name + metadata + copy-serial + coverage timeline; verify scenarios in the `warranties` delta via e2e/component tests
- [x] 4.2 Restyle the product add/edit form into Stitch sectioned cards (01 Categorization / 02 Purchase / 03 Coverage / 04 Documents) preserving Signal Forms validation and proof-input flows; verify form submission and validation tests still pass
- [x] 4.3 Restyle the product detail page: summary banner (identity, status pill, serial copy, purchase/retailer/price/proof rows), expiring-soon alert strip, coverage cards with contacts, edit/delete intact; verify detail page tests and `warranties` "Claim information" scenarios still pass
- [x] 4.4 Restyle `account-settings` page to Stitch surfaces; verify account management unit/e2e flows pass

## 5. Assets & decorative imagery

- [x] 5.1 Add Stitch-language decorative imagery (hero asset-card mock on landing, icon-tile thumbs on product cards, icon-based empty state) so no stock photo renders on real user products; verify visually in dev server
- [x] 5.2 Verify AXE accessibility on landing, an auth page, legal, 404, and 404-adjacent public routes via Playwright a11y (light); shared tokens keep dark mode AA-consistent

## 6. Verification & spec sync

- [x] 6.1 Run `npm run lint`, `ng build`, unit tests (`npm test` headless), and Playwright e2e (smoke + responsive + a11y chromium; smoke selector regex case bug fixed); pre-existing mobile/tablet sign-up and cold-start a11y flakes observed at HEAD remain
- [x] 6.2 Sync main specs from deltas (design-system, public-site, warranties) — performed during archive; `openspec validate --specs` passes (10/10)
