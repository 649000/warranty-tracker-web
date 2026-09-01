## 1. Project & Firebase Setup

- [x] 1.1 Install dependencies (`firebase`, `@angular/material`, `@angular/cdk`, `date-fns`, `browser-image-compression`, Playwright) and verify `npm install` succeeds and `ng build` still compiles
- [x] 1.2 Add Angular Material via `ng add @angular/material` and verify the app serves with Material providers configured
- [x] 1.3 Create `environment.ts` / `environment.development.ts` with Firebase config placeholders and verify they compile
- [x] 1.4 Initialize `initializeApp` once at bootstrap and verify the app boots with no console errors
- [ ] 1.5 Create/select Firebase project(s), enable Auth providers (email/password + Google), Firestore, Storage, Hosting, Analytics and verify enabled in the Firebase console
- [x] 1.6 Add `.firebaserc`, `firebase.json` (Hosting SPA rewrites, Firestore rules, Storage rules) and verify a test deploy to a preview channel succeeds

## 2. Design System

- [x] 2.1 Create the Material 3 theme file with brand palette, typography scale, and light + dark palettes; verify custom tokens apply (no default Material palette)
- [x] 2.2 Add a dark-mode toggle that persists user preference; verify toggling switches palettes and survives reload
- [x] 2.3 Add global styles for spacing, elevation, and `prefers-reduced-motion` support; verify in DevTools across viewport sizes

## 3. Authentication

- [x] 3.1 Implement `AuthService` exposing a `user` signal from `onAuthStateChanged` with `browserLocalPersistence`; verify with a mocked-auth unit test and manual reload persistence
- [x] 3.2 Implement Google sign-in using the redirect flow and handle the `__/auth/handler` callback URL; verify the full round trip against the emulator
- [x] 3.3 Implement email/password sign-up, sign-in, forgot-password, and email-verification flows; verify against the emulator with test accounts
- [x] 3.4 Implement sign-out and account deletion that cascades to products, coverages, and Storage proof files; verify data is removed
- [x] 3.5 Map Firebase auth errors to user-friendly messages; verify via unit tests and a manual wrong-password attempt
- [x] 3.6 Implement the `authGuard` (canMatch) that waits for the first auth emission and stores the intended URL; verify unauthenticated redirect and post-login return URL

## 4. Routing & Navigation Shell

- [x] 4.1 Define the route structure (public/protected, lazy-loaded features, 404) and a navigation shell (top app bar, avatar menu); verify routes lazy-load in the network tab and the 404 route renders
- [x] 4.2 Add landing/auth/legal routes and the authenticated-redirect rule (signed-in visitors to `/` go to `/warranties`); verify behavior in the emulator

## 5. Data Model, Services & Rules

- [x] 5.1 Define TS models/interfaces for `Product`, `Coverage`, and `ProofOfPurchase`; verify they compile and unit tests cover serialization
- [x] 5.2 Implement `ProductService` CRUD with realtime `onSnapshot` and `ownerId` scoping exposed as signals; verify against the emulator and via unit tests
- [x] 5.3 Implement coverage CRUD under a product; verify against the emulator
- [x] 5.4 Write Firestore security rules (owner-only, subcollection checks parent `ownerId`) and Storage rules; verify with security-rules tests via the emulator suite

## 6. Status Derivation & Warranty List

- [x] 6.1 Implement the pure `coverage-status` module (expiry from start + months, lifetime, 60-day threshold, product fold); verify Vitest covers date boundaries, month-end, lifetime, and expired cases
- [x] 6.2 Build the warranty list component: sorted by urgency, filter chips (all/active/soon/expired), color + text status badges, skeleton loading, friendly empty state; verify with component tests, an AXE pass, and manual review

## 7. Product & Coverage Forms / Detail

- [x] 7.1 Build the add/edit product form (name, purchase date defaulting to today, category preset list with "Other", optional brand/serial/retailer/price with SGD default); verify validation and component tests
- [x] 7.2 Build the coverage form (source, scope auto-suggesting local for retailer, duration presets including lifetime and custom, contact/notes); verify unit tests
- [x] 7.3 Build the product detail page: coverage sub-cards with expandable contact/notes, add-coverage action, edit/delete, and claim-info section; verify interactions and component tests

## 8. Proof of Purchase

- [x] 8.1 Implement typed text proof entry; verify it saves and renders inline
- [x] 8.2 Implement image proof upload using `browser-image-compression` (downsize + EXIF strip client-side); verify uploaded size is smaller than the original and stored under `users/{uid}/proofs/...`
- [x] 8.3 Implement PDF proof upload (stored as-is); verify upload and retrieval
- [x] 8.4 Implement proof viewing (image lightbox, PDF in new tab, text inline) and replace/delete; verify each

## 9. Public Site

- [x] 9.1 Build the landing page (headline, three value props, sign-in/sign-up CTA, responsive); verify AXE clean and readable on a mobile viewport
- [x] 9.2 Add the Terms of Service page; verify content renders with a link back to the landing page
- [x] 9.3 Add the Privacy page; verify content renders with a link back to the landing page
- [x] 9.4 Add the 404 page; verify an unknown URL renders it

## 10. Analytics

- [x] 10.1 Implement the analytics service (GA4 init + `logEvent`); verify events appear in Analytics debug view
- [x] 10.2 Wire page-view and key action events (sign-in, product added, coverage added, proof uploaded); verify unit tests with mocked `logEvent` and that failures are non-blocking

## 11. Testing

- [x] 11.1 Complete Vitest coverage for status/expiry logic, services, guards, and key components; verify `ng test` is green
- [x] 11.2 Add security-rules tests via the Firebase Emulator suite; verify the suite is green
- [ ] 11.3 Add the Playwright smoke suite (landing -> sign-up/sign-in -> add product -> appears in list); verify the suite is green locally

## 12. CI/CD & Deploy

- [ ] 12.1 Add a GitHub Actions workflow running lint, format-check, test, and build on every PR; verify checks pass on a PR
- [ ] 12.2 Wire auto-deploy to Firebase Hosting on push to `main` and preview channels for PRs; verify a deploy succeeds

## 13. Quality Gate

- [ ] 13.1 Run a full accessibility pass (AXE, keyboard navigation, contrast, focus management) across all routes; verify zero violations
- [x] 13.2 Verify the free-tier footprint (no Cloud Functions/FCM/SendGrid) and that production bundle stays within Angular budgets; verify production build output size
- [ ] 13.3 Run a final manual smoke across all core flows against the production build; verify no console errors and a polished result
