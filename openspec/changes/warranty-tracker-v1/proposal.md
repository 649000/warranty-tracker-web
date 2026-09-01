## Why

Warranty coverage is scattered across physical receipts, emails, and product boxes, so people lose track of active coverage, miss claim windows, and lack the proof-of-purchase details needed when filing a claim. Warranty Tracker centralizes coverage per product so anyone can see at a glance what is covered, what is expiring soon, and have the right details ready when filing a claim.

## What Changes

- Build a new public web application, Warranty Tracker, on the existing (empty) Angular v22 scaffold.
- **Authentication** with Firebase Auth: Google (primary, one-tap) and email/password sign-up and sign-in, forgot-password, email verification, persistent session, sign out, and account deletion that cascades to the user's data.
- **Warranty management**: products and per-product coverages (manufacturer/retailer/international/other, local vs international scope, duration-based expiry with lifetime support), with status derived from time (active / expiring soon / expired) and a 60-day expiring-soon threshold.
- **Proof of purchase**: optional text, image (downsized client-side), or PDF per product.
- **Public site**: landing page with marketing copy, Terms and Privacy pages, and a 404 route.
- **Professional design system**: Material 3 theme with light and dark mode, WCAG AA accessibility, designed empty/loading/error states.
- **Analytics**: Google Analytics 4 (GA4) via the native Firebase SDK.
- **CI/CD**: lint + format + test + build gate on every PR, auto-deploy to Firebase Hosting on `main`, preview channels.
- **Testing**: Vitest unit + component tests, Firebase security-rules tests via the emulator, and a Playwright smoke suite for the critical path.
- **BREAKING**: none — greenfield project.

## Capabilities

### New Capabilities

- `user-auth`: Firebase Auth flows (Google + email/password), session persistence, email verification, forgot password, account deletion, and route guarding of protected pages.
- `warranties`: products and coverages CRUD, coverage expiry derivation (duration or lifetime), product/coverage status computation with a 60-day expiring-soon threshold, Singapore context (SGD default currency, local vs international scope).
- `proof-of-purchase`: capture proof of purchase as text, image (downsized client-side before upload), or PDF, stored privately per user.
- `public-site`: public landing page, Terms and Privacy pages, and the 404 route.
- `analytics`: GA4 event tracking for key user actions and page views.

### Modified Capabilities

None — no existing specs.

## Impact

- **Code**: entire `src/app` surface of the new Angular application (components, services, routes, guards, theme).
- **Backend**: Firebase project configuration — Auth (email/password + Google providers), Firestore (products + coverages), Storage (proof files), Hosting, Analytics. Security rules for Firestore and Storage (owner-only). No Cloud Functions, FCM, or SendGrid in v1.
- **Dependencies added**: `firebase` (native JS SDK v12), `@angular/material`, `@angular/cdk`, `date-fns`, `browser-image-compression`, Playwright (dev). AngularFire is explicitly **not** used (no stable Angular 22-compatible release).
- **Config**: `openspec/config.yaml` testing note corrected from Karma/Jasmine to Vitest; `.firebaserc`, `firebase.json`, GitHub Actions workflow.
- **Free tier**: Auth, Firestore, Storage, Hosting, Analytics only.
