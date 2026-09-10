## Why

Users do not know what their warranty actually covers, and the only way to find out is to read dense terms and conditions. The app already tracks expiry and claim contacts, but says nothing about entitlement. A small, curated layer of plain-language coverage guidance closes that gap immediately, with no backend, no AI, and no ongoing cost.

## What Changes

- Add a curated, static coverage-guidance module that maps common warranty scenarios (manufacturing defect, accidental damage, liquid damage, wear and tear, cosmetic damage, unauthorized repair, theft/loss) to typical verdicts, plus a short Singapore statutory-rights baseline.
- Render a "What's Typically Covered" block inside each expanded coverage on the product detail page, clearly labeled as general guidance rather than a plan-specific guarantee, with an optional link to the provider's official terms.
- Add per-category notes so guidance is relevant (for example, battery and screen for phones, compressor and motor for appliances).
- Structure the guidance so the UI reads it through a single derived accessor that can later merge a shared `warrantyTerms` directory without changing the template.
- Add no Firebase changes: no Firestore, Storage, Functions, or security-rule changes, and no AI usage.

Explicitly deferred (future Plan A): document upload, LLM extraction, a shared cross-user terms directory, moderation, and per-user overrides.

## Capabilities

### New Capabilities

- `coverage-guidance`: Curated, plain-language warranty coverage guidance (scenario verdicts, Singapore statutory baseline, category notes) surfaced per coverage on the product detail page, with a data seam that can later be backed by a shared directory.

### Modified Capabilities

- `warranties`: The product detail page's coverage panel now also surfaces coverage guidance for each coverage.

## Impact

- New static module under `src/app/core/` for the guidance data and lookup, imported by the warranty detail feature. It ships in the client bundle and is small.
- `warranty-detail.component.html` and `.css` gain a guidance block within the expanded coverage panel.
- No Firebase systems affected; zero runtime cost and no new reads or writes.
- Tests: unit tests for guidance lookup and category handling; component test for the guidance block; AXE/contrast coverage consistent with existing detail-page tests.
- Non-goal: asserting plan-specific entitlement. Guidance is explicitly labeled as general and links to official terms where available.
