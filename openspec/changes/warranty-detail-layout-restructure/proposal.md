## Why

The `/warranties/<id>` detail page has three layout/UX problems:

1. The "Claim Info" section heading is misleading — it displays static product/purchase attributes (serial, retailer, price, proof), not claim records. There is no claim entity in the data model; the label implies a concept the app doesn't model.
2. Purchase date — a required field that anchors every coverage's start date — is never displayed on the detail page.
3. On the add/edit form, brand, serial number, retailer, price, and proof of purchase are hidden behind a "More Details (Optional)" toggle. These fields are core to the warranty-tracker value proposition and should always be visible. The toggle also creates a broken proof-of-purchase flow: the proof buttons (Type Details, Add Photo, Upload PDF) live inside the `<form>` without `type="button"`, so they submit the form and redirect to the detail page instead of activating proof capture.

## What Changes

- Rename the detail page section "Claim Info" → "Product Details" and add a Purchase Date row as the first (always-shown) field.
- Reorder the detail page so the Product Details block appears above the Coverage section.
- Remove the "More Details (Optional)" toggle from the add/edit form so brand, serial number, retailer, price, and proof of purchase are always visible.
- Reorder the add form so product fields are contiguous (name, category, brand, purchase date, serial, retailer, price, proof) followed by the Warranty block (new products only).
- Add `type="button"` to all proof-input buttons to prevent accidental form submission.

## Capabilities

### Modified Capabilities

- `warranties`: The "Claim information" requirement is being renamed to "Product details" with an updated scenario to include purchase date display. The "Add a product" requirement's "Optional fields are available" scenario is being updated to reflect that these fields are now always visible (no toggle).

### New Capabilities

None.

## Impact

- `src/app/features/warranties/warranty-detail.component.html` + `.css` — section reorder, heading rename, purchase date row, class rename.
- `src/app/features/warranties/product-form.component.html` + `.ts` + `.css` — remove `showMore` signal, toggle button, and `@if` wrapper; reorder fields.
- `src/app/features/warranties/proof-input.component.html` — add `type="button"` to all interactive buttons.
- `e2e/smoke.spec.ts` — update the "More Details (Optional)" interaction.
- `openspec/specs/warranties/spec.md` — update requirements to match new behavior.
