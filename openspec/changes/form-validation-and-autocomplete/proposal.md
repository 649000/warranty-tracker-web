## Why

The product form and coverage dialog have no meaningful validation — users can submit prices like `0.00099`, leave category blank, and save invalid contact emails/URLs. The coverage dialog uses template-driven forms (`ngModel`) with zero validation infrastructure while the product form uses Reactive Forms, creating an inconsistent pattern. Since there is no data in Firestore yet, this is the right time to fix validation and unify the form approach to Angular v22 Signal Forms before any data lands.

## What Changes

- **Make category required** for all products (spec change: was optional).
- **Add price validation**: must be > 0, at most 2 decimal places, maximum $1,000,000.
- **Add contact validation**: email/URL fields are validated when filled (optional but enforce format).
- **Add custom-months validation**: positive integer 1–240 when duration is Custom.
- **Add expiry-date validation**: manual expiry must not precede purchase date.
- **Migrate both warranty forms to Signal Forms** (`@angular/forms/signals`): product-form (currently Reactive) and coverage-dialog (currently ngModel).
- **Add autocomplete** to brand and retailer fields with a curated, category-aware catalog — suggestions ranked by selected category, matching Google/Amazon UX (substring filter, prefix-first ranking, keyboard nav, clear button, no-match state).

## Capabilities

### New Capabilities

_— none —_

### Modified Capabilities

- `warranties`: Category becomes required. Price validation is enforced. Brand and retailer support autocomplete with a category-aware suggestion catalog.

## Impact

- `src/app/core/models/catalog.ts` — new `BRANDS`, `RETAILERS` data.
- `src/app/core/utils/validation.ts` _(new)_ — pure validators and autocomplete filter functions.
- `src/app/features/warranties/product-form.component` — migrate to Signal Forms, add validators, add autocomplete.
- `src/app/features/warranties/coverage-dialog.component` — migrate to Signal Forms, add validators.
- `openspec/specs/warranties/spec.md` — requirement changes (category required, price, autocomplete).
- Tests: `src/app/core/utils/validation.spec.ts` _(new)_.
- No Firestore migration needed (no existing data).
