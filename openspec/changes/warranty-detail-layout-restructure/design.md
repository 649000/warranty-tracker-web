## Context

The warranty detail page (`/warranties/<id>`) currently shows: header → Coverage cards → "Claim Info" card. The "Claim Info" heading is misleading (no claim entity exists), purchase date is never displayed, and the add/edit form hides product fields behind a collapsible toggle that also breaks proof-of-purchase buttons via accidental form submission.

## Goals / Non-Goals

**Goals:**
- Rename "Claim Info" → "Product Details" and add purchase date as the first row.
- Reorder the detail page so Product Details appears above Coverage.
- Remove the "More Details (Optional)" toggle from the product form; always show brand, serial, retailer, price, and proof fields.
- Reorder the add form so product fields are contiguous before the Warranty block.
- Fix proof-input buttons that default to `type="submit"` by adding explicit `type="button"`.
- Update the Playwright smoke test to match the new layout.

**Non-Goals:**
- Adding inline proof editing on the detail page (proof remains managed via the edit form).
- Renaming "Coverage" headings to "Warranty" across the app (terminology unification is a separate concern).
- Adding a claims feature or claim entity.

## Decisions

### 1. Product Details block structure

Add a `<section>` with heading "Product Details" and a `<dl>` card containing: Purchase Date (always shown), Serial Number (conditional), Retailer (conditional), Price (conditional), Proof of Purchase (always shown with view/delete/add). Place this section above the Coverage `<section>` in the template.

**Rationale:** Purchase date is the most warranty-relevant fact and is currently invisible on the read page. Making it the first row and always visible keeps the detail page honest about what was collected at entry.

### 2. Remove toggle, not progressive disclosure elsewhere

Delete `showMore` signal, the `.more-toggle` button, and the `@if (showMore())` wrapper in `product-form.component.html`. Brand, serial, retailer, price, and proof fields move outside the conditional and render unconditionally.

**Rationale:** Progressive disclosure for these fields adds friction with no real benefit — the form is short enough to scroll, and the fields are core to the product record.

### 3. Add form field order

Reorder the template so the add form reads: Name → Category → Brand → Purchase Date → Serial Number → Retailer → Price+Currency → Proof of Purchase → Warranty block (new only) → Actions. This puts all product facts contiguous before the warranty section.

**Rationale:** The current form interleaves the Warranty block between Purchase Date and the optional fields. Making product fields contiguous gives a natural product→warranty reading order.

### 4. Proof button fix via `type="button"`

Add `type="button"` to all buttons inside `proof-input.component.html` that are not intended to submit: Type Details, Add Photo, Upload PDF (empty state), Replace (summary state), Choose File/Replace File, Remove Proof (editing state). This stops clicks from triggering form submission.

**Alternatives considered:**
- Moving proof-input outside the `<form>` — too invasive, breaks the `[(current)]` / `[(pendingFile)]` two-way binding pattern.
- Using `(click)="$event.preventDefault()"` on each — works but `type="button"` is the semantic standard.

### 5. CSS class rename

Rename `.claim-card`, `.claim-row` → `.product-card`, `.product-row` in `warranty-detail.component.css` and update the template. The heading gets `id="product-heading"` and the section gets `aria-labelledby="product-heading"`.

### 6. Smoke test update

Remove the `page.getByRole('button', { name: 'More Details (Optional)' }).click()` line in `e2e/smoke.spec.ts`. Brand/price autocomplete interactions remain unchanged since those fields are now always visible. Optionally add a `Product Details` heading assertion.

## Risks / Trade-offs

- **Longer initial form view** — Without the toggle, the add form is taller. Mitigation: the form is still short (~10 fields + warranty block) and scrolls naturally on mobile.
- **Spec drift** — The existing `warranties/spec.md` "Claim information" requirement references claim-relevant details. Mitigation: this change includes a spec delta that renames and updates the requirement.
