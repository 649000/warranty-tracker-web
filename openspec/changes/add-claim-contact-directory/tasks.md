## 1. Data model and rules

- [x] 1.1 Add `ClaimContact` model (type, name, matchKeys, optional url/hotline/email/claimSteps/serviceCenterUrl/registrationUrl/updatedAt) in `src/app/core/models/claim-contact.model.ts` and verify the app type-checks (`npm run build`)
- [x] 1.2 Add `match /claimContacts/{id}` to `firestore.rules` allowing authenticated read and denying all writes, and verify the rules load without syntax errors (`firebase emulators:exec --only firestore "echo rules-ok"`)

## 2. Claim directory service

- [x] 2.1 Implement `ClaimDirectoryService` (`providedIn: 'root'`) that loads the whole collection once into a signal cache and exposes lookup by coverage source plus brand/retailer, with status `user | suggested | none`
- [x] 2.2 Add normalization and alias matching (trim, lowercase, exact `{type}_{name}` key then `matchKeys` scan) and verify with unit tests covering exact, alias, case/whitespace, and no-match cases
- [x] 2.3 Add unit tests verifying an existing `coverage.contact` yields status `user` and overrides a matching directory entry, and that a missing contact yields `suggested` or `none`

## 3. Coverage dialog prefill

- [x] 3.1 Prefill the coverage dialog contact fields from the resolved directory entry on add and edit while leaving them editable, and verify with a component test asserting prefilled values
- [x] 3.2 Verify that saving user-edited contact persists it on the coverage and that an untouched prefill does not store a copy, via component test

## 4. Product detail claim panel

- [x] 4.1 Replace the coverage expanded contact block with a "How to Claim" block that shows suggested url/hotline/email, ordered claim steps, service-center and registration links, and a suggested vs user-provided label
- [x] 4.2 Add the "Reset to suggested" action shown only when the coverage has a user override, clearing `coverage.contact`, and verify with a component test that reset restores the suggestion
- [x] 4.3 Verify the claim panel meets WCAG AA contrast and exposes actionable links with accessible names via an axe check in the component or Playwright test

## 5. Seed data and runner

- [x] 5.1 Create `scripts/claim-contacts.data.ts` covering every brand and retailer from `catalog.ts` with best-effort claim details, and verify it type-checks against the `ClaimContact` model
- [x] 5.2 Create `scripts/seed-claim-contacts.ts` using `firebase-admin` to idempotently `set` entries keyed `{type}_{name}` with merge, supporting an `--emulator` flag, and verify a re-run produces no duplicates against the emulator
- [x] 5.3 Add the `seed:claim-contacts` npm script and verify it runs against the emulator and populates the directory

## 6. Integration verification

- [x] 6.1 Add Firestore emulator security-rules tests asserting authenticated read succeeds, anonymous read fails, and client writes fail
- [x] 6.2 Add a Playwright smoke test that seeds the emulator directory, opens a product with a matching brand, sees suggested claim info, overrides it, and resets to suggested
- [x] 6.3 Run `npm run lint`, `npm test`, `npm run test:rules`, and `npm run e2e` and verify all pass
