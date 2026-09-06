## Context

The status badge (`src/app/shared/status-badge.component.ts`) renders three states with `color: light-dark(<light>, <dark>)` and a background of `color-mix(in srgb, currentColor 14%, transparent)` over the Material 3 surface. The badge text is 13px at normal weight, so it needs 4.5:1 (WCAG AA). Computed contrast ratios in light mode (14% tint over white):

| State | Current light | Ratio | Target light | Ratio |
|---|---|---|---|---|
| active ("Covered") | `#2e7d5b` | ~4.0 (AXE 3.99) | `#1b6647` | 5.61 |
| expiring-soon | `#9a6b00` | ~3.9 | `#7a5400` | 5.50 |
| expired | `#6b7574` | ~4.0 | `#545f5e` | 5.42 |

Dark-mode colors (`#82c9a8`, `#e8c36a`, `#aeb8b6`) already pass (7.3–8.1:1), so they are unchanged.

## Goals / Non-Goals

**Goals:**
- Make all three badge states meet ≥4.5:1 in light mode, with a comfortable margin above the threshold.
- Keep the badge's visual character (a tinted background keyed to the text color).

**Non-Goals:**
- Redesigning the badge or its layout.
- Changing dark-mode colors (already compliant).
- Broadening the fix to other components' contrast (out of scope).

## Decisions

### D1 — Darken light-mode foreground colors only

Set the light-mode `color` values to `#1b6647` (active), `#7a5400` (expiring-soon), and `#545f5e` (expired), keeping the existing `color-mix(… 14%, transparent)` background and `light-dark()` structure.

- *Rationale*: minimal, targeted change; each target reaches ≥5.4:1 against the 14% tint over white, leaving headroom for the real (slightly off-white) Material 3 surface. The tinted background darkens proportionally with the text, so contrast stays high.
- *Alternatives considered*:
  - Reduce the tint percentage (lighter background) — rejected: washes out the badge and still requires tuning three colors.
  - Explicit pre-verified text/background pairs instead of `color-mix` — rejected: larger diff for no functional gain.

## Risks / Trade-offs

- [The actual Material 3 surface is slightly off-white, lowering the computed ratio a touch] → Chosen colors have ≥0.9:1 headroom over 4.5, verified by the AXE e2e assertion.
- [Visual shift may be noticeable] → The new shades are the same hue, just darker; acceptable for an accessibility fix.

## Migration Plan

1. Update the three light-mode colors.
2. Run the AXE e2e (`npm run e2e`) to confirm no color-contrast violations remain on the list/detail pages.
3. Deploy.

Rollback: revert the three color literals.

## Open Questions

None.
