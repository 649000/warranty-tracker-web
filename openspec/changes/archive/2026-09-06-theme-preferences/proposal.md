## Why

The app's light/dark mode is currently a manual two-state toggle: it reads the OS `prefers-color-scheme` only once at startup and persists the last toggle, so it never re-follows the user's system setting. Users expect the theme to track their system preference automatically, while still being able to override it.

## What Changes

- Introduce a three-state theme preference: **System / Light / Dark**, defaulting to System.
- Follow the OS theme automatically, updating live when the OS setting changes (via a `matchMedia` listener) while in System mode.
- Replace the two-state `toggle()` with a `cycle()` (System → Light → Dark → System) and update both theme buttons (app shell and landing page) to reflect the current mode with the appropriate icon and accessible label.
- Persist only the mode (not the resolved theme) so System remains automatic across sessions; prior `light`/`dark` stored values remain valid.
- **BREAKING**: none — existing `light`/`dark` stored values map to the new modes unchanged.

## Capabilities

### New Capabilities

- `theme`: theme preference model (System/Light/Dark), automatic system following with live updates, and the three-state toggle UI.

### Modified Capabilities

None.

## Impact

- **Code**: `core/services/theme.service.ts` (mode + resolved-theme signals, `matchMedia` listener, `cycle()`), `shell.component.ts`/`shell.component.html` and `landing.component.ts`/`landing.component.html` (three-state button + labels), plus a new `theme.service.spec.ts`.
- **Dependencies**: none.
- **Config**: none.
