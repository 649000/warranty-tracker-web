## Context

An audit of every template and user-facing string in `src/app` found inconsistent capitalization: labels and headings were a mix of sentence case and Title Case, status lines varied, and field labels/validation/aria-labels were lowercased. The `design-system` spec's "Editorial conventions" requirement referenced sentence case, which is why copy drifted inconsistent.

Target convention (standard Title Case, per user):

- Capitalize every **major word**; keep **minor words** lowercase unless first/last: `of`, `in`, `on`, `at`, `to`, `for`, `from`, `by`, `with`, `a`, `an`, `the`, `and`, `or`, `but`.
- Example mappings: `My warranties` → `My Warranties`, `Expiring soon` → `Expiring Soon`, `Lifetime coverage` → `Lifetime Coverage`, `Proof of purchase` → `Proof of Purchase`, `Claim info` → `Claim Info`, `Add proof of purchase` → `Add Proof of Purchase`, `Add coverage` → `Add Coverage`, `6 months` → `6 Months`.

## Goals / Non-Goals

**Goals:**
- Every UI heading, label, button, link, menu item, status, chip, validation message, snackbar, confirm dialog, and aria-label uses consistent Title Case.
- Long-form prose (legal body, marketing ledes, descriptive error paragraphs, auth-error help sentences) stays sentence case.

**Non-Goals:**
- Rewording copy (e.g., unifying "Add product" vs "Add a product" or "Create account" vs "Create an account") — wording consistency is out of scope; capitalization only.
- Changing stored data values. `PRODUCT_CATEGORIES` ("Phones & Tablets", "Home & Living", "Other") is stored on product docs and treated as proper-noun taxonomy; left as-is.

## Decisions

### D1 — Directly edit each static string to Title Case

Headings, labels, buttons, menu items, and aria-labels are literal HTML/TS strings, so each is edited in place to its Title Case form. No shared pipe is added: strings are mostly static, and the source/toggle values that are data-driven already display single-word labels (`Manufacturer`, `Local`, `International`) which are unaffected by Title Case rules.

- *Rationale*: minimal, explicit diffs; matches how the copy is authored.
- *Alternatives considered*: a global `titlecase` transform/pipe — rejected, would mangle minor words (`Proof Of Purchase`) and prose.

### D2 — Title Case status lines consistently

Status phrases become Title Case (`Lifetime Coverage`, `No Active Coverage`, `Expiring Soon`, `Covered`, `Expired`, `Expires Today`, `Expires in X Days`, `Covered Until <date>`). Short status lines read as UI chrome rather than prose, so they follow the same Title Case rule as the rest of the UI.

### D3 — Keep proper nouns, stored taxonomy, and long prose unchanged

"Warranty Tracker", "Google", "Firebase", "the Service", currency codes keep existing capitalization. Product category taxonomy is stored data and internally consistent. Legal body paragraphs, marketing ledes, and multi-clause error text remain sentence case.

### D4 — Update the editorial-conventions spec to mandate Title Case

The requirement text and its scenarios are rewritten so Title Case is the documented rule, with sentence case reserved for prose.

## Risks / Trade-offs

- [Title Casing is opinionated] — resolved by following standard Title Case with minor words lowercase and keeping prose sentence case; visible across the whole UI for a consistent, professional look.
- [Many files touched] — all changes are string-literal-only, so regression risk is limited to display; mitigated by the lint/test/build gate.

## Migration Plan

1. Edit every user-facing UI string across templates and components to Title Case.
2. Update duration presets in `catalog.ts` (`6 Months`, `1 Year`, …).
3. Run lint/test/build to confirm no regressions.
4. Eyeball the main screens (auth, landing, list, detail, forms, account, legal).

Rollback: revert the string edits (all display-only).

## Open Questions

None.
