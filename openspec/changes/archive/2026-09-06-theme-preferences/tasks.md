## 1. Theme Service

- [x] 1.1 Refactor `theme.service.ts` to a `mode` signal (`'system' | 'light' | 'dark'`, default `system`) and a derived resolved `theme` signal; verify `ng test` passes with a new `theme.service.spec.ts`
- [x] 1.2 Add a `matchMedia('(prefers-color-scheme: dark)')` change listener that re-resolves `theme` while in System mode; verify the OS change is reflected in a unit test
- [x] 1.3 Replace `toggle()` with `cycle()` (system → light → dark → system) that persists `mode`; verify the cycle order and persistence in unit tests

## 2. UI

- [x] 2.1 Update the shell theme button to cycle modes and show `brightness_auto`/`light_mode`/`dark_mode` with an accessible label; verify with a component test or manual review
- [x] 2.2 Update the landing page theme button to the same three-state behavior; verify with a component test or manual review

## 3. Verification

- [x] 3.1 Run `ng lint`, `ng test`, and `ng build` and verify all green
- [x] 3.2 Run the Playwright smoke/accessibility suites and verify no regressions
