## Why

Coverage **source** options render inconsistently across the app. In the "Add coverage" / "Edit coverage" dialog the options show as lowercase (`manufacturer`, `retailer`, `international`, `other`), while the same options in the "Add product" form and the warranty detail list show in title case (`Manufacturer`, `Retailer`, …). Coverage **scope** options are already consistently capitalized (`Local` / `International`). The mismatch looks unpolished and undercuts the professional showcase quality the app targets.

## What Changes

- Render coverage source labels in the add/edit coverage dialog in title case, matching the add-product form and the warranty detail list.
- No data model or storage changes: `CoverageSource` values stay lowercase; only their presentation is fixed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `warranties`: coverage source labels are presented with consistent title-case capitalization across all entry points and the detail list.

## Impact

- `src/app/features/warranties/coverage-dialog.component.html` — apply `| titlecase` to the source toggle label (currently `{{ s }}`).
- `src/app/features/warranties/coverage-dialog.component.ts` — import `TitleCasePipe` into the component's `imports` array.
- No API, data, dependency, or storage changes.
