## Context

`ThemeService` (in `src/app/core/services/theme.service.ts`) currently stores a resolved `'light' | 'dark'` value under `warranty-tracker-theme`, reads `prefers-color-scheme` once in its constructor, and applies the `dark` class to `<html>`. Two icon buttons (app shell + landing page) call `toggle()`. The app is a non-SSR Angular v22 SPA, so `window.matchMedia` and `localStorage` are always available.

## Goals / Non-Goals

**Goals:**
- Three-state preference (System/Light/Dark) with System as the default.
- Live re-resolution when the OS theme changes while in System mode.
- Backward compatibility with existing stored `'light'`/`'dark'` values.

**Non-Goals:**
- No change to the color palettes or tokens (handled by `design-system`).
- No server-side or persisted-per-device behavior beyond `localStorage`.

## Decisions

### 1. Separate `mode` (preference) from `theme` (resolved)
Expose a `mode` signal (`'system' | 'light' | 'dark'`) that is the persisted user intent, and a `theme` signal (`'light' | 'dark'`) derived from `mode` plus the current `matchMedia('(prefers-color-scheme: dark)').matches`. `apply()` reads the resolved `theme`; only `mode` is written to `localStorage`. This keeps "what the user chose" and "what is actually shown" distinct, which is required for live System-mode updates.
*Alternative considered*: keep a single signal and re-read storage on OS change. Rejected — conflates preference and resolution and makes cycle/override semantics harder to test.

### 2. `matchMedia` change listener
Subscribe to `change` events on the dark-scheme media query; when `mode === 'system'`, re-resolve `theme` and re-apply. Clean up on service destroy to avoid leaks.
*Alternative considered*: poll `prefers-color-scheme`. Rejected — the `matchMedia` event is the idiomatic, instant mechanism.

### 3. `cycle()` instead of `toggle()`
`cycle()` advances `system → light → dark → system`, persists `mode`, and re-resolves. Both components call `cycle()` and render the mode icon (`brightness_auto` / `light_mode` / `dark_mode`) with a descriptive `aria-label`.
*Alternative considered*: a `mat-menu` with three options. Rejected — overkill for a single toggle; a cycle is the common pattern and matches the existing single button.

### 4. Backward compatibility
The existing storage key is reused and existing `'light'`/`'dark'` strings are valid modes, so returning users keep their explicit choice; only absent values default to `system`.

## Risks / Trade-offs

- [Users with a prior saved `light`/`dark` will not default to `system`] → Acceptable; their previous explicit choice is preserved as an override rather than silently reset.
- [`matchMedia` change events are supported in all evergreen browsers] → Guard with optional chaining as today.

## Migration Plan

No data migration; storage format is compatible. Rollback is a revert of `theme.service.ts` and the two component templates.
