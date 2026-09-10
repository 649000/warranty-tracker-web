# Warranty Tracker

[![CI](https://github.com/649000/warranty-tracker-web/actions/workflows/ci.yml/badge.svg?branch=angular)](https://github.com/649000/warranty-tracker-web/actions/workflows/ci.yml)
[![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Tested with Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![E2E with Playwright](https://img.shields.io/badge/e2e-playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/649000/warranty-tracker-web/pulls)

Warranty Tracker is a web application that centralizes warranty coverage for the
products you own. It records what is covered, surfaces coverage that is expiring
soon, and keeps the details you need when filing a claim in one place.

The app is built with Angular and Firebase, and is designed around a small set
of principles: user data stays owner-scoped, warranty status is always derived
from time rather than stored, and the security rules are treated as the source
of truth for access control.

## Features

- **Product and coverage tracking.** Record a product with its purchase date,
  category, brand, serial number, and price, then attach one or more coverages
  (manufacturer, retailer, international, or other).
- **Derived status.** Every coverage is classified as active, expiring soon, or
  expired from its expiry date using a 60 day threshold. Status is never written
  to the database, so it can never drift out of sync.
- **Flexible durations.** Coverages support duration-based expiry in months and
  lifetime coverage, with manual expiry override when a provider gives an exact
  date.
- **Proof of purchase.** Attach free text, a client-side downscaled image, or a
  PDF. Uploads are capped at 5 MB and restricted to images or PDFs.
- **Claim directory.** Suggested claim routes and contacts are matched against
  the product brand, with the ability to override the contact for a specific
  coverage and reset back to the suggestion.
- **Coverage guidance.** Plain-language guidance on what warranties commonly
  cover and exclude, plus Singapore consumer-law context and category notes.
- **Expiry reminders.** A scheduled Cloud Function sends a consolidated email
  digest when coverage reaches 30 days, 7 days, or the expiry day.
- **Theming and accessibility.** Material 3 light and dark themes, keyboard
  navigation, and automated accessibility checks with axe.

## Tech stack

| Area            | Choice                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| Framework       | Angular 22 with standalone components, signals, and lazy-loaded routes   |
| UI              | Angular Material 3 with light and dark themes                            |
| Backend         | Firebase native JS SDK v12: Auth, Firestore, Storage, Hosting, Analytics |
| Functions       | Firebase Cloud Functions (TypeScript) on a daily Cloud Scheduler trigger |
| Dates and files | `date-fns`, `browser-image-compression`                                  |
| Monitoring      | Sentry for the web app, Firebase Analytics                               |
| Unit tests      | Vitest                                                                   |
| Rules tests     | Firebase Emulator with `@firebase/rules-unit-testing`                    |
| End-to-end      | Playwright with `@axe-core/playwright`                                   |

## Project structure

```
src/
  app/
    core/        Firebase wiring, guards, models, and singleton services
    features/    Feature areas: auth, landing, warranties, account, legal
    shared/      Reusable presentational components
    shell/       Authenticated app shell (header, footer, navigation)
  environments/  Environment configuration (the single source of truth)
functions/       Cloud Function that sends expiry reminder digests
e2e/             Playwright smoke, responsive, and accessibility specs
test/            Firestore and Storage security-rules tests
scripts/         One-off tooling, including the claim-contact seeder
```

## Prerequisites

- Node.js 22 or newer
- A [Firebase](https://console.firebase.google.com) project
- The Firebase CLI (`npm install -g firebase-tools`) with an active `firebase login`

## Firebase setup

1. Create a project in the Firebase console.
2. Enable the sign-in providers you intend to use under
   **Authentication → Sign-in method** (Email/Password and Google are supported).
3. Enable **Firestore**, **Storage**, **Hosting**, and **Analytics**.
4. Copy the web app config from **Project settings → Your apps → Web app**.
5. Paste the values into `src/environments/environment.ts`.
6. Set your project id in `.firebaserc`.

The Firebase web config contains public identifiers rather than secrets. Access
control is enforced by the rules in `firestore.rules` and `storage.rules`, not by
hiding the config. Emulator wiring is driven by the `useEmulators` flag in
`src/environments/environment.ts`: the default `ng serve` targets the live
Firebase project, while `ng serve --configuration emulators` points the SDK at
the local emulators.

## Running locally

Install dependencies and start the app against the live Firebase project:

```bash
npm install
npm start
```

To work offline or against deterministic data, start the emulators and serve the
emulator configuration instead:

```bash
# Terminal 1: start the auth, firestore, and storage emulators
npm run emulators

# Terminal 2: serve the app wired to the emulators
npm start -- --configuration emulators
```

## Data model

```
users/{uid}/products/{productId}                          owner-scoped by path
users/{uid}/products/{productId}/coverages/{coverageId}
users/{uid}/proofs/{productId}/{file}                     Storage
users/{uid}/settings/{settingId}
users/{uid}/reminderDeliveries/{YYYY-MM-DD}               function-managed ledger
```

A product has a name, purchase date, and optional category, brand, serial number,
retailer, and price. Each product has one or more coverages, where a coverage
captures its source, scope, duration, start date, and computed expiry date. Proof
of purchase is optional. Status is derived from the current time at read time,
using a 60 day expiring-soon threshold.

## Testing

```bash
npm test                    # unit and component tests (Vitest)
npm run test:rules          # Firestore and Storage rules via the emulator
npm run test:functions      # Cloud Function unit tests
npm run test:functions:emulator  # full reminder sweep against the emulator
npm run e2e                 # Playwright smoke, responsive, and accessibility specs
```

The end-to-end suite expects the emulators to be running. Accessibility is
checked with axe in both the end-to-end specs and component tests.

## Code quality

```bash
npm run lint         # ESLint with angular-eslint
npm run format:check # Prettier check
npm run format       # Prettier write
npm run build        # production build
```

## Deployment

Continuous integration is defined in `.github/workflows/ci.yml`:

- Every pull request runs formatting checks, linting, unit tests, a production
  build, and the Firebase emulator test suites as a merge gate.
- Pushes to the `angular` branch build and deploy Hosting, Cloud Functions, and
  the Firestore and Storage rules.

Deploys authenticate through a `GCP_SA_KEY` repository secret containing a
Google Cloud service account key with permission to deploy the project's
resources.

The reminder function is documented in detail, including secrets, rollout,
budget guardrails, and rollback, in [`functions/README.md`](functions/README.md).

## Security and cost guardrails

Firestore, Storage, and Auth are client-writable, so the project applies a set of
guardrails that limit what a scripted or throwaway account can spend:

- **Verified email required.** All user-data reads and writes are gated on
  `request.auth.token.email_verified == true`.
- **Field-shape validation.** Products, coverages, and settings are validated
  against an allowlist of keys, types, enums, and string-length caps.
- **Upload limits.** Storage rules cap proofs at 5 MB and restrict content types
  to `image/*` or `application/pdf`.
- **Bounded cleanup.** Account deletion recursively removes proof files so
  Storage does not bill for orphaned objects.
- **App Check.** App Check with reCAPTCHA Enterprise is supported and can be
  enforced for Firestore and Storage.

## Contributing

Contributions are welcome. To propose a change:

1. Fork the repository and create a feature branch.
2. Make your change and add or update tests where relevant.
3. Run `npm run format:check`, `npm run lint`, `npm test`, and `npm run build`.
4. Open a pull request with a clear description of the problem and the approach.

Please keep commits focused and describe user-visible changes in the pull
request. Report security concerns privately rather than in a public issue.

## Disclaimer

Coverage guidance shown in the app is general information and not a guarantee of
any specific coverage. Always check the official terms from the warranty
provider.
