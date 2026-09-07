## Why

User-facing copy mixes capitalization styles: buttons, links, labels, statuses, and headings render in inconsistent casing (e.g. coverage source labels lowercase in one dialog while capitalized elsewhere; headings in sentence case where Title Case reads better). The app should read as one deliberate, professional whole — so every UI label, heading, button, status, chip, and validation message is Title Cased consistently.

## What Changes

- Apply **Title Case** (capitalize every major word; keep minor words — articles, conjunctions, short prepositions like `of`, `in`, `to`, `the`, `a`, `an`, `and`, `or`, `with`, `for`, `at`, `on` — lowercase unless first or last) to all user-facing UI text:
  - Headings, card/dialog titles, section headings, empty-state headings
  - Buttons, links, menu items, field labels, chips/toggles, filter options
  - Status badges and status lines (`Expiring Soon`, `Lifetime Coverage`)
  - Validation messages, snackbars, confirm dialogs, aria-labels
  - Duration presets (`6 Months`, `1 Year`, …)
- Keep **sentence case** for long-form prose: legal body copy, marketing ledes, and descriptive error paragraphs.
- Keep proper nouns and defined terms capitalized as-is (`Warranty Tracker`, `Google`, `Firebase`, `the Service`, `SGD`, currency codes).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system`: The editorial-conventions requirement is corrected to mandate Title Case for UI text (labels, headings, buttons, statuses) while minor words and proper nouns follow standard Title Case rules.

## Impact

- Nearly every template and user-facing string constant in `src/app` (headings, labels, buttons, statuses, snackbars, aria-labels).
- `src/app/core/models/catalog.ts` — duration preset labels.
- No logic, data, or API changes; stored product category taxonomy unchanged.
