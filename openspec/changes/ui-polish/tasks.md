## 1. Design Foundation

- [x] 1.1 Add the teal/slate/sage color tokens (light + dark) as CSS custom properties in `styles.scss` and verify they resolve to the spec hexes in DevTools
- [x] 1.2 Add spacing (`--space-1`…`--space-16`) and radius (`--radius-sm/md/lg/full`) tokens and verify they render on a test surface
- [x] 1.3 Add the fluid type scale tokens (`--type-display`…`--type-caption`) with `clamp()` and verify headings scale across 375/768/1280
- [x] 1.4 Reconfigure `mat.theme()` to the custom teal/slate/sage palettes and Inter typography; verify Material components pick up the new colors in light and dark mode
- [x] 1.5 Load Inter, Newsreader, and Material Symbols Outlined in `index.html` (replace Roboto) and verify the fonts are applied with no layout shift
- [x] 1.6 Switch `mat-icon` to Material Symbols Outlined (`FILL 0`, outlined) and verify every existing icon renders outlined at all three viewports
- [x] 1.7 Add elevation tokens (`--shadow-hover`, `--shadow-raised`) and overflow-guard utilities; verify outlined cards carry no default shadow

## 2. Shell & Navigation

- [x] 2.1 Migrate `shell.component.css` to tokens and add brand truncation to icon-only below ~480px; verify the toolbar stays usable and overflow-free on a 320px viewport
- [x] 2.2 Ensure theme and account controls keep ≥44px hit areas; verify tap targets in DevTools at mobile width

## 3. Warranty List

- [x] 3.1 Migrate `warranty-list.component.css` to tokens and switch the grid to `minmax(240px, 1fr)`; verify 1/2/3+ columns at 375/768/1280
- [x] 3.2 Replace the `.product-card` hover transform/shadow with the `--shadow-hover` token; verify cards remain outlined and hover elevation is consistent
- [x] 3.3 Add safe-area insets to the FAB and verify it clears the home indicator in a notched-device emulation

## 4. Warranty Detail

- [x] 4.1 Migrate `warranty-detail.component.css` to tokens; verify no horizontal scroll at 320px
- [x] 4.2 Stack the detail header (title over actions) below 600px and verify the Edit/more controls remain reachable
- [x] 4.3 Stack claim rows (`dt` above `dd`) below 600px and verify long URLs/emails wrap without overflow
- [x] 4.4 Verify the coverage summary wraps the status badge and expand icon without crowding on mobile

## 5. Forms & Dialogs

- [x] 5.1 Migrate `product-form.component.css` to tokens and collapse `.price-row` to a single column below ~480px; verify the price/currency fields stack
- [x] 5.2 Migrate `coverage-dialog.component.css` to tokens and size the dialog to fit mobile (max-width + max-height with internal scroll); verify actions stay visible on a mobile viewport
- [x] 5.3 Verify toggle and chip groups wrap within the form and dialog at 320px

## 6. Proof Input & Lightbox

- [x] 6.1 Migrate `proof-input.component.css` to tokens and verify the summary/actions wrap on mobile
- [x] 6.2 Fit the proof lightbox to the viewport on mobile and verify the close control is reachable

## 7. Auth, Landing & Legal

- [x] 7.1 Migrate `auth-page.css` to tokens and make `.links` wrap; verify the card fits 320px with no overflow
- [x] 7.2 Migrate `landing.component.css` to tokens and adapt the topbar nav to wrap/collapse on narrow screens; verify the hero and features remain readable at 375/768/1280
- [x] 7.3 Migrate `legal-page.css` to tokens and tighten mobile padding; verify readable at 320px

## 8. Editorial & Accessibility Pass

- [x] 8.1 Remove any all-caps labels and em-dash meta separators (use middot); verify via a source grep across templates/CSS
- [x] 8.2 Apply tabular numerals to price/date/count displays; verify digits align in the list and detail views
- [x] 8.3 Run an automated WCAG AA contrast check across light and dark tokens and fix any failing pairs

## 9. Responsive Verification & Quality Gate

- [x] 9.1 Add/extend Playwright viewport checks (375, 768, 1280) covering landing, auth, list, detail, and form; verify the suite passes
- [x] 9.2 Run an AXE accessibility scan at each viewport and verify zero violations
- [x] 9.3 Run `ng lint`, `ng test`, and `ng build` and verify all green
- [ ] 9.4 Manual visual smoke across all routes in light and dark mode at desktop/tablet/mobile; verify no console errors and a polished, consistent result
