## 1. Fix proof-of-purchase redirect bug

- [x] 1.1 Add `type="button"` to all buttons in `proof-input.component.html`: Type Details, Add Photo, Upload PDF (empty state), Replace (summary state), Choose File/Replace File, and Remove Proof (editing state). Verify the component compiles and no buttons default to `type="submit"`.
- [x] 1.2 Run `ng build` and confirm no build errors.

## 2. Restructure warranty detail page

- [x] 2.1 In `warranty-detail.component.html`, rename the "Claim Info" heading to "Product Details" and update `id`/`aria-labelledby` to `product-heading`. Verify the section is properly labeled in the DOM.
- [x] 2.2 Add a Purchase Date row as the first row in the Product Details `<dl>`, always shown (not conditional). Use `product.purchaseDate` formatted with `date-fns` `format()`. Verify the date appears in the rendered page.
- [x] 2.3 Move the entire Product Details `<section>` above the Coverage `<section>` in the template. Verify the rendering order is: header → Product Details → Coverage.
- [x] 2.4 In `warranty-detail.component.css`, rename `.claim-card` → `.product-card`, `.claim-row` → `.product-row`, `.claim-row dt` → `.product-row dt`, `.claim-row dd` → `.product-row dd`, `.claim-row:last-child` → `.product-row:last-child`. Update the template class names to match. Verify no broken styles.

## 3. Restructure product form

- [x] 3.1 In `product-form.component.ts`, remove the `showMore` signal. Verify no remaining references to `showMore` in the component.
- [x] 3.2 In `product-form.component.html`, remove the "More Details (Optional)" toggle button and the `@if (showMore())` wrapper. Move brand, serial number, retailer, price/currency, and proof-of-purchase fields outside the conditional so they always render. Verify all fields are visible in the rendered form.
- [x] 3.3 In `product-form.component.html`, reorder the add form so product fields are contiguous: Name → Category → Brand → Purchase Date → Serial Number → Retailer → Price+Currency → Proof → Warranty block → Actions. Keep the edit form unchanged (product fields only, no warranty block). Verify field order matches the target layout.
- [x] 3.4 In `product-form.component.css`, remove `.more-toggle` styles. Verify no orphaned CSS rules.

## 4. Update e2e tests

- [x] 4.1 In `e2e/smoke.spec.ts`, remove the `page.getByRole('button', { name: 'More Details (Optional)' }).click()` line. Brand and price fields are now always visible — verify the existing brand autocomplete and price validation steps still pass.
- [x] 4.2 Optionally add an assertion for the "Product Details" heading on the detail page after navigating to it.

## 5. Verify and lint

- [x] 5.1 Run `ng lint` and fix any lint errors.
- [x] 5.2 Run `npx playwright test e2e/smoke.spec.ts` and confirm the smoke suite passes.
- [x] 5.3 Run `ng build` to confirm production build succeeds.
