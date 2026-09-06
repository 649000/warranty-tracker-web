## 1. Fix light-mode badge colors

- [x] 1.1 Update the light-mode `color` values in `status-badge.component.ts` (active `#1b6647`, expiring-soon `#7a5400`, expired `#545f5e`); verify `npm run build` passes and the dark-mode values are unchanged.

## 2. Verify

- [x] 2.1 Run the full gate (`npm run format:check`, `npm run lint`, `npm test -- --watch=false`, `npm run build`); verify all pass.
- [x] 2.2 Run the Playwright smoke suite against the emulators and verify the AXE color-contrast assertion passes on the populated list and detail pages.
