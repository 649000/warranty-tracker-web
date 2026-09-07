## 1. Fix source label casing in coverage dialog

- [x] 1.1 Add `TitleCasePipe` to the `imports` array in `src/app/features/warranties/coverage-dialog.component.ts`
- [x] 1.2 Update `src/app/features/warranties/coverage-dialog.component.html` line 11: change `{{ s }}` to `{{ s | titlecase }}`

## 2. Verify

- [x] 2.1 Run the full gate (`npm run lint`, `npm test -- --watch=false`, `npm run build`); verify all pass.
- [x] 2.2 Open the add/edit-coverage dialog and confirm source options display as "Manufacturer", "Retailer", "International", "Other".
