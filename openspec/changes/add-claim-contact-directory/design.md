## Context

See proposal.md for motivation. Current state that shapes this design:

- Products carry optional free-text `brand` and `retailer`; coverages carry an optional user-entered `contact { hotline?, email?, url? }` (`src/app/core/models/warranty.model.ts`).
- The product detail page already renders a tappable contact block inside each expanded coverage (`warranty-detail.component.html`).
- `catalog.ts` defines the brand and retailer taxonomies that the seed data must cover.
- Firestore rules currently define only user-scoped paths (`firestore.rules`); there is no top-level shared collection.
- `firebase-admin` is available in the `functions/` workspace but not in the web app. There is no `scripts/` directory.
- The app must stay on the Firebase free tier and avoid shipping large static data in the client bundle.

## Goals / Non-Goals

**Goals:**

- A shared, admin-managed claim contact directory that users read but never write.
- Suggested claim information resolved per coverage from its source plus the product's brand or retailer.
- User override that is explicit, persistent, and reversible ("Reset to suggested").
- Seed every catalog brand and retailer without inflating the client bundle.

**Non-Goals:**

- No admin UI; directory content is managed in the Firebase Console.
- No warranty entitlement/coverage-terms data (separate change).
- No interactive or stateful claim workflow; claim steps are informational ordered strings.
- No per-user or per-product copies of directory data.

## Decisions

### Directory keyed by `{type}_{name}` in a top-level collection

Store entries as `claimContacts/{type}_{name}` (e.g. `manufacturer_apple`, `retailer_challenger`), with `type` mirroring `CoverageSource` and `name` the canonical display name.

- Rationale: a single uniform key covers manufacturer, international, and retailer routes; retailer claims key on the retailer rather than a brand, which a brand-only directory could not express.
- Alternative considered: one collection keyed by brand only — rejected because retailer-sourced coverages would have no home.
- Alternative considered: nested per-type collections — rejected as unnecessary structure with no query benefit.

### Lean entry schema with alias matching

Entry fields: `type`, `name`, `matchKeys[]`, and optional `url`, `hotline`, `email`, `claimSteps[]`, `serviceCenterUrl`, `registrationUrl`, `updatedAt`.

- `matchKeys` absorbs free-text brand/retailer variation ("apple", "apple inc").
- No `verified` flag by decision; directory accuracy is the admin's ongoing responsibility, and the UI already labels the data as suggested.
- Alternative considered: `verified` flag — rejected to keep the schema lean.

### Live suggestion with stored override (Model 2)

Resolution per coverage: if the coverage has a user-entered `contact`, display it; otherwise display the resolved directory entry live, without copying it onto the coverage. The user's contact is persisted only when they enter one.

- Rationale: "user override wins" reduces to "does `coverage.contact` exist", and directory edits propagate to all non-overridden coverages with no stale copies.
- Alternative considered: copy-on-save prefill — rejected because copies go stale and user intent becomes indistinguishable from a default.
- Alternative considered: store an `origin: suggested | user` flag — rejected as unnecessary once nothing is stored by default.

### Resolution order and normalization

Compute the lookup name from the coverage source: `brand` for manufacturer, international, and other; `retailer` for retailer. Normalize by trimming and lowercasing, then match `{type}_{normalizedName}`, falling back to a scan of entries whose `matchKeys` contain the normalized value.

- Rationale: exact key lookup is the common case; the alias scan is the bounded fallback.
- Alternative considered: fuzzy matching — rejected as unpredictable for a curated directory.

### Authenticated read, no client write

Add a rule block allowing `read` when `request.auth != null` and denying all writes for `claimContacts`.

- Rationale: consistent with warranty data being private; directory content is curated, not user-generated.
- Alternative considered: public read — rejected as unnecessary exposure and inconsistent with the rest of the app.

### Seed data as a committed TypeScript module plus an admin runner

Keep the directory data in `scripts/claim-contacts.data.ts` and upload it with an idempotent `firebase-admin` runner `scripts/seed-claim-contacts.ts`, exposed as `npm run seed:claim-contacts`, with an `--emulator` flag.

- Rationale: the data file is committed and type-checked against the entry model, but is never imported by application code, so it does not affect bundle size or load time. `set()` with merge keyed by document id makes re-runs safe.
- Alternative considered: JSON data file — rejected because a TS module is type-checked against the schema.
- Alternative considered: hand-entry in the Console — rejected as unreproducible and unreviewable.

### Client service caches the whole collection

A root-provided service loads the collection once and exposes lookups from a signal cache, with a per-coverage status of `user | suggested | none`.

- Rationale: one read batch per session keeps free-tier reads minimal and avoids per-product queries.
- Alternative considered: per-coverage document reads — rejected as more reads and more latency.

## Risks / Trade-offs

- [Seeded claim details may be inaccurate or age out] → Entries are labeled as suggested; a directory update reaches every non-overridden coverage with no redeploy; the admin owns accuracy.
- [Free-text brand/retailer may not match any entry] → Aliases plus normalization cover common variants; unmatched coverages fall back to manual entry without blocking.
- [Directory load latency on the detail page] → Cache once per session and render a graceful "none" state while loading.
- [Claim steps could be read as a guarantee of coverage] → Copy presents steps as guidance for contacting the provider, not as a coverage guarantee; entitlement terms are explicitly out of scope.
- [Rules regression could expose or lock down the collection] → Cover with emulator security-rules tests for authenticated read, anonymous denial, and write denial.

## Migration Plan

1. Deploy the updated Firestore rules so the collection is readable to authenticated users.
2. Run `npm run seed:claim-contacts` against the project to populate the directory.
3. Ship the frontend, which tolerates an empty or missing collection by showing no suggestions.
4. Rollback: revert the frontend; the rules and directory data are additive and harmless if left in place.

## Open Questions

- Whether the emulator seed should run automatically as part of CI is deferred; the `--emulator` flag makes either choice easy later.
