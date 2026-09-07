## Context

Coverage source/scope are typed as lowercase string unions (`CoverageSource`, `CoverageScope` in `src/app/core/models/warranty.model.ts`) and stored lowercase in Firestore. Display casing is applied at render time.

The add/edit coverage dialog (`coverage-dialog.component.html`) renders source toggles as the raw value `{{ s }}`, producing lowercase labels. Everywhere else the labels are capitalized: the add-product form uses `{{ source | titlecase }}` (`product-form.component.html`), and the warranty detail list uses `{{ coverage.source | titlecase }}` (`warranty-detail.component.html`). Scope toggles are hardcoded as "Local"/"International" in both forms.

## Goals / Non-Goals

**Goals:**
- Make coverage source labels display in title case in the add/edit-coverage dialog, matching the add-product form and warranty detail list.
- Minimal diff: two files changed, no model or storage changes.

**Non-Goals:**
- Changing how `CoverageSource` values are stored (they stay lowercase).
- Refactoring scope toggles to use `titlecase` pipe (hardcoded labels are fine for two values).
- Introducing a shared label mapping or enum-to-display-name utility.

## Decisions

### D1 — Apply `| titlecase` to the source toggle label

In `coverage-dialog.component.html`, change the source toggle rendering from `{{ s }}` to `{{ s | titlecase }}`. Import `TitleCasePipe` from `@angular/common` into the component's `imports` array.

- *Rationale*: mirrors the exact pattern already used in `product-form.component.html` and `warranty-detail.component.html`. No new utilities or abstractions required.
- *Alternatives considered*:
  - Hardcode "Manufacturer"/"Retailer"/"International"/"Other" like the scope toggle — rejected: duplicative, breaks DRY with the existing titlecase approach.
  - Introduce a shared label map or pipe for coverage enums — rejected: overkill for four fixed values; titlecase handles them correctly.

## Risks / Trade-offs

- [`titlecase` capitalizes the first letter of every word] — irrelevant here because all source values are single words, so the output is identical to manual capitalization.
- [Visual shift may surprise existing users] — the change is strictly cosmetic and matches what the rest of the app already shows; no functional impact.

## Migration Plan

1. Add `TitleCasePipe` to `coverage-dialog.component.ts` imports.
2. Change `coverage-dialog.component.html:11` from `{{ s }}` to `{{ s | titlecase }}`.
3. Run `ng test --watch=false`, `ng lint`, `ng build` to confirm no regressions.
4. Manual verification: open the add/edit-coverage dialog and confirm source options read "Manufacturer", "Retailer", "International", "Other".

Rollback: remove the pipe import and revert the template expression to `{{ s }}`.

## Open Questions

None.
