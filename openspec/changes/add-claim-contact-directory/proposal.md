## Why

Claiming a warranty today requires the user to hunt down the manufacturer or retailer's claim channel themselves and manually type it into a coverage. The tracker stores contact details per coverage but offers no guidance, so the most useful claim information is usually left blank exactly when it is needed most.

## What Changes

- Add a curated, admin-managed Firestore directory of warranty claim contacts keyed by `{type}_{name}` (for example `manufacturer_apple`, `retailer_challenger`).
- Surface the matching directory entry as suggested claim information in each coverage's expanded panel on the product detail page, including claim URL, hotline, email, numbered claim steps, service-center link, and registration link.
- Prefill the coverage dialog's contact fields from the directory when adding or editing a coverage.
- Treat user-entered coverage contact as an override that wins over the directory; store it only when the user provides it, and offer a "Reset to suggested" action to discard the override.
- Fall back to manual entry when no directory entry matches the brand or retailer.
- Seed the directory with entries for every catalog brand and retailer, with best-effort hotlines and claim steps where confidently known.
- Add Firestore security rules allowing authenticated reads and denying all client writes.

## Capabilities

### New Capabilities

- `claim-directory`: Curated, admin-managed claim contact information looked up by coverage source and product brand or retailer, with live suggestion display and user override.

### Modified Capabilities

- `warranties`: The Claim information requirement now includes directory-sourced suggested claim details, dialog prefill, user override precedence, and a reset-to-suggested action.

## Impact

- Affected frontend: product detail coverage panel, coverage dialog, and a new claim directory service and model.
- Affected Firebase systems: Firestore (new top-level `claimContacts` collection and security rules).
- Adds a committed seed data module and an idempotent `firebase-admin` seed runner under `scripts/`, plus an npm script; the seed data is not imported into the application bundle.
- Requires tests for directory lookup and normalization, override precedence, reset behavior, and Firestore rules.
- Non-goal: warranty entitlement/coverage-terms information is deferred to a separate change.
