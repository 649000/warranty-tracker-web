## Context

See proposal.md for motivation. Current state that shapes this design:

- The product detail page renders each coverage as an expandable panel with a claim block, notes, and actions (`src/app/features/warranties/warranty-detail.component.html`, `warranty-detail.component.ts`).
- Coverage data (`Coverage` in `src/app/core/models/warranty.model.ts`) has `source`, `scope`, `duration`, optional `contact`, and `notes`, but no entitlement information.
- The claim directory already resolves a provider `url` per coverage (`claim-directory.service.ts`), which can serve as the "official terms" link without new data.
- The project must stay on the Firebase free tier and avoid unnecessary paid services; the display is the primary value and should not require a backend.
- The full "warranty wiki" (Plan A: upload, LLM extraction, shared directory, moderation) is deliberately deferred, but this design must preserve a seam so it can be added without reworking the UI.

## Goals / Non-Goals

**Goals:**

- Deliver plain-language coverage guidance on the product detail page with no backend, no AI, and no new reads or writes.
- Keep the guidance data small, curated, and type-checked, and easy to review and update.
- Present guidance honestly: general information, clearly labeled, with an official-terms link where available.
- Isolate the guidance behind a single derived accessor so a future shared directory can enrich it without changing the template.

**Non-Goals:**

- No document upload, LLM extraction, Cloud Functions, shared Firestore collection, moderation, or per-user overrides.
- No plan-specific entitlement claims; guidance is generic and never presented as a guarantee.
- No new Firebase security rules, indexes, or collections.

## Decisions

### Static, bundled guidance module over a Firestore directory

Author the guidance as a typed TypeScript module under `src/app/core/` that ships in the client bundle.

- Rationale: the content is small, slow-changing, and universal. Bundling it means zero reads, zero latency, zero cost, and no security surface, which fits the free-tier constraint. The set is authored once and reviewed like code.
- Alternative considered: a shared Firestore `warrantyTerms` collection read at runtime — rejected for this step because it adds rules, seeding, loading states, and cost without changing the user-visible result.

### Verdicts as a closed set

Model each scenario with a verdict of `covered`, `excluded`, or `varies`, plus a short plain-language explanation.

- Rationale: a closed set keeps the UI consistent and testable, and prevents the copy from drifting into hedged or contradictory language.
- Alternative considered: free-text verdicts — rejected because they invite plan-specific claims and are harder to render consistently and accessibly.

### Single derived accessor as the growth seam

The component reads guidance through one computed accessor (for example `coverageGuidance()`) that returns a view model for a coverage. Today it maps static data; later it can merge a shared-directory lookup for the coverage's plan key.

- Rationale: the template and component API stay stable across Plan A. Enrichment becomes a change inside the accessor, not a UI rewrite.
- Alternative considered: reading static data directly in the template — rejected because it couples the template to the data source and defeats the seam.

### Reuse existing provider URLs for official terms

Use the coverage's existing contact URL, or the claim directory's resolved URL, as the official-terms link. Do not add a new field or upload path.

- Rationale: the link is already available and avoids new data modeling for marginal gain.
- Alternative considered: a dedicated `termsUrl` on the coverage — deferred until a real need appears (for example, when Plan A introduces document attachments).

### Placement and accessible presentation

Render the guidance block inside the expanded coverage panel, visually distinct from the claim block, with a text verdict alongside any color so meaning is never color-only.

- Rationale: keeps all coverage context in one place and satisfies the existing WCAG AA/contrast standard used by status badges.
- Alternative considered: a separate guidance page — rejected as extra navigation for a small amount of content.

### Extract the guidance block into its own component

Render the block as a small `CoverageGuidanceComponent` with its own template and stylesheet, receiving the view model from the detail component's accessor.

- Rationale: the detail component's stylesheet already sat exactly at the 8 kB component-style budget, so any inlined addition failed the build. A dedicated component keeps each stylesheet under budget and matches the "keep components small and focused" convention.
- Alternative considered: raising the `anyComponentStyle` budget — rejected as loosening a project guardrail outside this change's scope.
- Alternative considered: moving the styles to global CSS — rejected as breaking style encapsulation.

## Risks / Trade-offs

- [Generic guidance is mistaken for a guarantee of the user's plan] → Label it as general information, avoid plan-specific claims, and always offer the official-terms link.
- [The Singapore statutory note reads as legal advice] → Keep it high-level and factual, attribute it to consumer law rather than the app, and avoid specific claim procedures or timelines.
- [Guidance becomes stale as warranty norms change] → The set is generic and slow-changing; treat the module as reviewed source and keep updates cheap.
- [Category notes do not fit every product] → Fall back to general scenarios when a category is unknown or unmapped; keep notes short and non-specific.
- [Guidance block visually competes with the claim block] → Give it its own heading and styling, and only render it when guidance applies.

## Migration Plan

1. Add the static guidance module and its unit tests.
2. Add the accessor and the guidance block to the warranty detail feature, with component and accessibility tests.
3. Ship; no data migration, no rules change, no deployment sequencing.
4. Rollback: remove the block and module; the change is purely additive and frontend-only.

## Open Questions

- The exact wording and taxonomy of category notes can be tuned during implementation without changing the approach, the specs, or the task breakdown.
