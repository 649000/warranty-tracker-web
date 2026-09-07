## 1. Catalog Data

- [x] 1.1 Add `BrandEntry` interface and `BRANDS` array with category affinities to `core/models/catalog.ts`; verify it compiles with `ng build`. Include major brands (Apple, Samsung, Sony, LG, Panasonic, Dyson, Bose, Canon, Nikon, Logitech, Razer, Dell, HP, Lenovo, Xiaomi, Huawei, Oppo, Vivo, Google, Microsoft, Nintendo, Garmin, JBL, Fujifilm, GoPro, Asus, Acer, MSI).
- [x] 1.2 Add `RETAILERS` string array to `core/models/catalog.ts` with Singapore and worldwide retailers (Challenger, Courts, Harvey Norman, Best Denki, Gain City, Audio House, Parisilk, Apple Store, iStudio, Amazon.sg, Lazada, Shopee, Mustafa Centre, Takashimaya, Tangs, Samsung Experience Store, Sony Store, Epicentre, Sprint-Cass, Qoo10); verify it compiles.

## 2. Validation Utilities

- [x] 2.1 Create `core/utils/validation.ts` with `priceError(amount: number | null): { kind: string; message: string } | undefined` — validates > 0, ≤ 2 dp, ≤ 1,000,000; `null` = no price; verify it compiles.
- [x] 2.2 Add `customMonthsError(value: number | null): ValidationError | undefined` — validates positive integer 1–240; `null` = unset; verify it compiles.
- [x] 2.3 Add `optionalEmailError(email: string): ValidationError | undefined` and `optionalUrlError(url: string): ValidationError | undefined` — validate format only when non-empty; verify it compiles.
- [x] 2.4 Add `expiryNotBeforePurchase(expiry: Date, purchase: Date): ValidationError | undefined`; verify it compiles.
- [x] 2.5 Add `filterBrands(query: string, category: ProductCategory): string[]` — case-insensitive substring match, category-matching brands ranked first, prefix matches before substring matches, limit ~20 results; verify it compiles.
- [x] 2.6 Add `filterRetailers(query: string): string[]` — same ranking minus category affinity; verify it compiles.
- [x] 2.7 Create `core/utils/validation.spec.ts` with unit tests for all functions in `validation.ts`; run `npx vitest run src/app/core/utils/validation.spec.ts` and verify all pass.

## 3. Coverage Dialog → Signal Forms

- [x] 3.1 Migrate `coverage-dialog.component.ts` from `FormsModule`/`ngModel` to `@angular/forms/signals`: define a signal model, replace `[(ngModel)]` with `[formField]`, wire `submit()`; verify dialog opens and saves.
- [x] 3.2 Add schema-based validation in the `form()` callback: `required` on source/scope/duration; `validate` on customMonths (positive integer 1–240 when Custom); `applyWhen` on contactEmail (valid email if non-empty) and contactUrl (valid URL if non-empty); verify `save()` is blocked when invalid.
- [x] 3.3 Add `<mat-error>` / error display elements in `coverage-dialog.component.html` for customMonths, contactEmail, and contactUrl; verify validation errors appear on invalid fields.

## 4. Product Form → Signal Forms

- [x] 4.1 Migrate `product-form.component.ts` from `ReactiveFormsModule`/`FormControl`/`FormGroup` to `@angular/forms/signals`: define a signal model with all fields, replace `[formGroup]`/`formControlName` with `[formField]`, wire `submit()` via `submit()`; verify form renders.
- [x] 4.2 Add schema-based validation: `required` on name, category, purchaseDate, source, scope, duration; `validate` on priceAmount (priceError); `validate` on customMonths when Custom; `applyWhen` on contactEmail/contactUrl; verify submit is blocked on invalid.
- [x] 4.3 Handle nullable numerics: `priceAmount: null` and `customMonths: null` in the model mean "not provided"; `buildProductDraft()` maps `null` → `undefined`; verify the field is not persisted when left empty and that a typed `0` price is rejected.
- [x] 4.4 Model `manualExpiry` as a nullable `Date | null` form field (default `null`) bound to the datepicker via `[formField]`; read it in `buildCoverageDraft()`; verify the datepicker clears and saves correctly.
- [x] 4.5 Update the template error display to use `form.field().touched()` / `form.field().errors()` pattern; verify mat-error messages appear for required, price, and contact fields.

## 5. Autocomplete

- [x] 5.1 Add `MatAutocompleteModule` to product-form imports; add `[matAutocomplete]` to the brand `<input>` with a `#brandAuto` panel listing `filteredBrands()`; verify the panel opens on type.
- [x] 5.2 Add `filteredBrands = computed(() => filterBrands(form.brand().value(), form.category().value()))` in the component; verify category-aware ranking changes when category is changed.
- [x] 5.3 Add `[matAutocomplete]` to the retailer `<input>` with `filteredRetailers()`; verify the panel opens on type.
- [x] 5.4 Add `(optionSelected)` handler to update the model signal if `[formField]` does not auto-sync; verify selecting an option populates the input.
- [x] 5.5 Add a "No matches found" disabled `<mat-option>` when `query.length > 0 && filteredBrands().length === 0`; verify it appears.
- [x] 5.6 Add a clear button (`matSuffix mat-icon-button` with `delete` icon) to brand and retailer fields that resets the form field via `model.update()`; verify clear works.
- [x] 5.7 Verify ARIA: input has `role="combobox"`, panel has `role="listbox"`, options have `role="option"` (mat-autocomplete default); run axe-core check on the form.

## 6. Verification

- [x] 6.1 Run `ng build` and verify zero errors.
- [x] 6.2 Run `npx vitest run` and verify all tests pass.
- [x] 6.3 Run `npx ng lint` and verify zero errors (or only pre-existing warnings).
- [x] 6.4 Manual smoke test: open product form, verify category required error, price 0.00099 error, autocomplete suggestions, keyboard nav, clear button, contact format errors, and successful save.
- [x] 6.5 Manual smoke test: open coverage dialog, verify custom-months validation, contact email/URL validation, and successful save.
