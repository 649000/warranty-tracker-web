## Why

The status badge (used for coverage and product status: "Covered", "Expiring soon", "Expired") fails WCAG AA color contrast in light mode. The foreground colors are too light against their tinted backgrounds (e.g. "Covered" measures 3.99:1 against the required 4.5:1), so the badge text is hard to read and fails the AXE accessibility check. This was surfaced by the now-green sign-up Playwright test in `fix-auth-redirect-loop`, which reaches the AXE assertion for the first time.

## What Changes

- Darken the three light-mode badge foreground colors in `status-badge.component.ts` so each state meets WCAG AA (≥4.5:1) against its tinted background.
- Leave the dark-mode colors unchanged (they already pass).
- Add a spec scenario requiring the status badge to meet WCAG AA contrast in both themes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `warranties`: The status badge SHALL meet WCAG AA color contrast (4.5:1) in both light and dark themes.

## Impact

- `src/app/shared/status-badge.component.ts` — light-mode `color` values for `.active`, `.expiring-soon`, `.expired`.
- Tests: the existing Playwright AXE assertion (warranty list + detail) now passes; no new test infrastructure.
