## Context

Two warranty forms exist today with divergent patterns:

- `product-form.component.ts` uses Reactive Forms (`FormControl`/`FormGroup`) — most fields validated but `priceAmount`, `category`, `contactEmail`, `contactUrl`, `hotline`, `customMonths` have no or incomplete validation.
- `coverage-dialog.component.ts` uses template-driven forms (`ngModel`) — only `customMonths` is gated via a manual `valid()` method; `contactEmail`/`contactUrl` can save invalid values.

Angular Material (`MatAutocompleteModule`) is already a project dependency. Brand and retailer fields are plain `<input>` with no catalog or suggestion support.

The project is Angular v22, AGENTS.md prefers Signal Forms for new forms, and there is no existing data in Firestore — so forms can be restructured freely.

## Goals / Non-Goals

**Goals:**
- Unify both warranty forms on `@angular/forms/signals` for consistency with AGENTS.md and to gain built-in schema-based validation.
- Enforce category-required, price (> 0, ≤ 2 dp, ≤ 1,000,000), contact format, custom-months integer range, and manual-expiry-after-purchase-date.
- Provide a professional autocomplete UX for brand (category-aware) and retailer, matching the behavior of major e-commerce sites.
- Keep validation logic as pure, unit-testable functions in `core/utils/validation.ts`.

**Non-Goals:**
- Migrate auth forms (login, signup, forgot, reset, account-settings) — they already have adequate validation and the churn has no benefit.
- Firestore migration or server-side validation — no data exists yet; client-side validation is sufficient.
- Fuzzy or external autocomplete services (Algolia, Google Places) — the catalog is static, matching the free-tier constraint.
- Password complexity rules (beyond existing `minLength(6)`) — out of scope.

## Decisions

### 1. Signal Forms for both warranty forms

**Decision:** Migrate both `product-form` and `coverage-dialog` to `@angular/forms/signals`.

**Rationale:** AGENTS.md recommends Signal Forms for Angular v22+. The coverage dialog had zero validation infrastructure; migrating rather than bolting `ngModel` validation gives schema-based validation, `submit()` with auto-touched, and consistency with the product form.

**Alternative considered:** Keep Reactive Forms on product-form, patch ngModel on coverage-dialog. Rejected because it leaves two paradigms in one feature and gains nothing from Angular's modern form primitives.

### 2. Validation as pure functions

**Decision:** Extract all custom validators and autocomplete filter logic into `core/utils/validation.ts` with a corresponding `validation.spec.ts` test file.

**Rationale:** Follows the existing `coverage-status.ts` / `coverage-status.spec.ts` pattern. Pure functions are framework-agnostic, easy to test, and reusable across both forms. Signal Forms' `validate()` callback invokes these functions directly.

### 3. Nullable price and custom-months fields

**Decision:** Model `priceAmount` and `customMonths` as nullable numbers (`number | null`, initialized to `null`). An empty `type="number"` input parses to `null`, meaning "no price" / "not a custom duration". `null` maps to `undefined` (not persisted) in the build methods.

**Rationale:** A `0` sentinel was originally chosen under the assumption that Signal Forms cannot hold `null`; with null-supported models an empty field correctly stays empty instead of showing a literal `0`, and the "zero is an invalid price" spec scenario is preserved (only `null` means "no price").

**Alternative considered:** `0` as the "no price" sentinel. Rejected — it renders `0` in the input, conflates "empty" with a real value, and makes "price must be positive" unreachable for the empty state.

### 4. Manual expiry as a nullable form field

**Decision:** Model `manualExpiry` as a normal Signal Form field typed `Date | null` (initialized to `null`) and bind it to the mat-datepicker via `[formField]`.

**Rationale:** Initial research assumed Signal Forms could not hold `null`, so the field was planned as a standalone signal. Angular v22 documentation explicitly blesses `null` as the empty value for date inputs (`Date | null` model), and `[formField]` binds to `MatDatepickerInput` through its `ControlValueAccessor`. Keeping the field in the form model means validation, touched state, and reset all work uniformly without a manual datepicker binding shim.

**Alternative considered:** Standalone `signal<Date | null>` outside the form. Rejected — the datepicker would have no value accessor and require hand-wired `dateChange`/`dateInput` listeners plus manual text formatting.

### 5. Category-aware autocomplete data model

**Decision:** Brand entries carry optional category affinity tags:

```ts
interface BrandEntry { name: string; categories?: ProductCategory[] }
```

Retailers are a flat string array (no category affinity needed — all retailers sell all categories).

**Rationale:** Category-aware ranking requires knowing which brands belong to which category. Tagging individual entries is simpler than a `Record<ProductCategory, string[]>` map (avoids duplication for brands in multiple categories, like Samsung appearing in both "Phones & Tablets" and "TVs & Monitors").

### 6. Autocomplete ranking algorithm

**Decision:** `filterBrands(query, category)` computes:
1. Filter entries whose name contains query (case-insensitive substring).
2. Sort: (a) category-matching brands first, (b) prefix matches before substring matches, (c) alphabetical within each group.
3. Limit to ~20 results for performance.

Same algorithm for retailers but without category affinity (skip step a).

**Rationale:** Prefix-first ranking mirrors Google/Apple search behavior. Category affinity surfaces the most relevant brands when the user has already narrowed the product type. Limiting results avoids rendering 100+ options.

### 7. Mat-autocomplete + [formField] coexistence

**Decision:** Use `[formField]` on the input (Signal Forms binding) alongside `[matAutocomplete]` for the dropdown. In `(optionSelected)`, manually update the model signal if the autocomplete's native value propagation does not sync with `[formField]`.

**Rationale:** Mat-autocomplete internally sets `input.value` and dispatches an `input` event — `[formField]` listens for input events. This should work. If it doesn't, the `(optionSelected)` handler provides a fallback path.

**Mitigation:** Verify during implementation with a quick spike (add the binding, log `form.brand().value()` after option selection). If `[formField]` doesn't pick up the value, wire `(optionSelected)` to `model.update(m => ({...m, brand: event.option.value}))`.

## Risks / Trade-offs

- **`mat-autocomplete` + `[formField]` not syncing on option selection** → Fallback: update model in `(optionSelected)` handler. Low risk; verified in spike.
- **Existing products without category** → No Firestore migration needed. Edit form shows an empty required category the user must fill. The `loadExisting()` method sets `category: product.category ?? ''`, which triggers the required error on submit. Acceptable — there is no data to migrate.
- **Floating-point precision** → `String(1.99)` = `"1.99"` (2 dp). Edge case: `String(0.1 + 0.2)` = `"0.30000000000000004"` (17 dp). Practically unreachable from user input on a `type="number"` field. Acceptable; a follow-up could parse the raw input string instead of the number.
- **Nullable date fields** → `manualExpiry` is `Date | null`, matching Angular's guidance for date inputs. The `buildCoverageDraft()` maps `null` → not-a-manual-expiry exactly as before.

## Open Questions

- None. All key decisions are resolved.
