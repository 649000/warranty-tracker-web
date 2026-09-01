## Context

See proposal.md for motivation and scope. The repo is an empty Angular v22 scaffold (standalone components, signals, zoneless, native control flow) with Vitest already configured. Firebase backend: Auth, Firestore, Storage, Hosting, Analytics, kept on the free tier. The application must be a polished, professional, public web app.

## Goals / Non-Goals

**Goals:**
- Zero paid Firebase services; free-tier budget respected.
- Data model that scales beyond "family" and teaches real Firestore patterns (flat collections, subcollections, owner-scoped rules).
- A clean seam between Angular and Firebase so the app does not depend on a framework wrapper library.
- Accessibility (WCAG AA) and a professional Material 3 look as first-class, not afterthoughts.

**Non-Goals:**
- No Cloud Functions, FCM, SendGrid, or email notifications in v1 (MVP2).
- No family sharing / multi-owner access in v1.
- No App Check, no paid error tracking (Sentry), no privacy hardening beyond owner-isolation in v1.
- No SSR/pre-rendering for v1 (Hosting serves the SPA; the landing page is client-rendered).

## Decisions

### D1: Native Firebase JS SDK, not AngularFire

Use the native `firebase` JS SDK (v12) directly, wrapped in thin Angular services. AngularFire has no stable Angular 22-compatible release (`@angular/fire@21.0.0-rc.0` is a candidate with known breakage and peers on older Angular; community reports the project as effectively unmaintained).

- Services initialize `getAuth`, `getFirestore`, `getStorage`, `getAnalytics` once from a single `initializeApp` call in `main.ts`/`environment`.
- Firebase web config lives in `environment.ts`; these are public identifiers, not secrets — security comes from rules.
- Reactive seams: `AuthService` exposes a `user` signal fed by `onAuthStateChanged`; `ProductService` exposes signals fed by `onSnapshot`. Zoneless change detection reacts to signal writes, so no `NgZone` wrapping or RxJS scheduling layer is needed.
- **Alternative considered:** `@angular/fire` (rejected: incompatible/RC) and `ngx-firebase` (rejected: new, single-maintainer third-party wrapper).

### D2: Data model — products nested under the user, coverages subcollection

```
users/{uid}/products/{productId}              (ownerId field kept as denormalized)
  name*, category, brand?, serialNumber?, retailer?,
  purchaseDate*, price?{amount, currency='SGD'},
  proofOfPurchase?{type, text?, storagePath?, fileName?},
  ownerId, createdAt, updatedAt

users/{uid}/products/{productId}/coverages/{coverageId}
  source (manufacturer|retailer|international|other),
  scope (local|international), duration{months?|lifetime},
  startDate, expiryDate?, contact?, notes?, createdAt, updatedAt

users/{uid}/proofs/{productId}/{file}          (Storage)
```

Rationale: coverages are a subcollection (the user's explicit choice — designed for scale, enables independent coverage queries). Products are **nested under `users/{uid}`** rather than a flat `products` collection with `ownerId`: Firestore security rules cannot inspect `where` clauses on `list` queries, so a flat collection cannot be securely listed per-user (the `resource.data.ownerId` check throws on list because `resource` is null). Nesting under the user's path makes per-user listing secure by construction and is the standard multi-tenant pattern. The `ownerId` field remains denormalized on each product for future use (collection-group queries, sharing). Collection-group queries over `coverages` still work across `users/*/products/*/coverages`.

### D3: Status is a pure derivation, not stored state

`coverageStatus(expiryDate, today, threshold=60)` returns `active | expiring-soon | expired`; `productStatus` folds over coverages (covered while any coverage active; soonest expiring coverage drives the "expiring soon" signal; all expired => expired). A single pure module `coverage-status.ts` owns this and is the primary Vitest target (date boundaries, month-end via `date-fns`, lifetime => never expired).

- Expiry derivation: `startDate + duration.months` (via `date-fns addMonths`, which handles month-end); lifetime => `expiryDate = null`; explicit user-set expiry overrides.

### D4: Auth — redirect flow, complete account lifecycle

- Google sign-in (primary, one-tap) + email/password sign-up/sign-in, forgot-password, email verification, sign out, delete account (cascades products + coverages + Storage proof files).
- **Redirect** flow over popup (more reliable on mobile browsers). Must handle Firebase callback URLs (`__/auth/handler`, verify-email, reset-password) and a redirect-back path.
- Session persistence: `browserLocalPersistence` (persistent across visits).
- Guarding: functional `canMatch` guard on the protected route subtree. The guard waits for the first `onAuthStateChanged` emission before deciding (avoids flickering signed-in users to login) and stores the intended URL for redirect-back after sign-in.

### D5: Routing structure

```
PUBLIC    /  /login  /signup  /terms  /privacy  /404 + Firebase callback URLs
PROTECTED /warranties  /warranties/new  /warranties/:id   (canMatch: authGuard)
```

Feature routes lazy-loaded. A `*` route renders the designed 404 page.

### D6: Proof of purchase — client-side downsizing

- Text: stored as a field.
- Image: `browser-image-compression` resizes/compresses client-side before upload; canvas re-encode strips EXIF/metadata; only the downsized file ever leaves the device. Upload path `users/{uid}/proofs/{productId}/...` in Storage.
- PDF: stored as-is.
- Viewing: image lightbox, PDF new tab, text inline.

### D7: Security rules are the real lock

Firestore + Storage security rules enforce owner-only access via the user path (`request.auth.uid == uid` on `users/{uid}/...`). Angular route guards are UX only. Rules are tested via the Firebase Emulator rules suite.

### D8: Design system — Material 3, light + dark

`@angular/material` v22 (M3-first) with a custom brand theme in a single theme file, light and dark palettes, typography scale, motion respecting `prefers-reduced-motion`. All states (loading skeletons, empty, error, 404) are designed; status never color-only. WCAG AA / AXE clean.

### D9: Analytics — GA4 via native SDK

`getAnalytics()` + `logEvent` for page views and key actions (sign-in, product added, coverage added, proof uploaded). Loaded non-blockingly; failures never surface to the user. No Firebase Analytics auto-tracking of screen names beyond explicit page-view events.

### D10: Testing strategy

- Vitest unit + component tests (Angular's `@angular/build:unit-test`), focused on: status/expiry derivation, product/coverage service mapping, form validation, guards.
- Firestore/Storage security-rules tests via the Firebase Emulator suite (CI).
- Playwright smoke suite for the critical path (landing -> sign-up/sign-in -> add product -> appears in list).
- No e2e beyond the smoke suite in v1.

### D11: CI/CD

GitHub Actions: lint (`ng lint`) + format check (`prettier --check`) + test (`ng test`) + build (`ng build`) gate on every PR; auto-deploy to Firebase Hosting on push to `main`; PR preview channels via `firebase hosting:channel`. Separate dev/prod Firebase projects guarded by environment config.

## Risks / Trade-offs

- **AngularFire abandonment** -> Mitigated by D1 (native SDK, no wrapper dependency); small, owned integration surface.
- **Subcollection read fan-out** (1 read per coverage) -> Acceptable at this scale; re-evaluate (denormalize `ownerId`/`productName` onto coverage docs) only if coverage counts grow large or global coverage queries become hot.
- **Redirect auth callback URL handling is fiddly** -> Covered explicitly in tasks; emulator + Playwright smoke suite validates the round trip.
- **Public sign-up invites abuse** (spam accounts, disposable emails) -> Accepted for v1; email verification is on, App Check listed as future hardening.
- **GA4 cookie use** vs earlier privacy interest -> Accepted for v1 per user decision; a consent prompt is a documented future slice.
- **Firestore free-tier limits** (50k reads/day, 1GiB stored) -> Comfortable for the planned scale; proof-of-purchase file counts kept low via downsizing.

## Migration Plan

Greenfield — no data migration. Deploy steps: create Firebase project(s) + enable Auth providers, Firestore, Storage, Hosting, Analytics -> deploy security rules -> wire CI/CD -> first deploy of the app. Rollback = revert Hosting channel to previous release; Firestore rules are versioned in the repo.

## Open Questions

- Final brand name, logo/wordmark, and brand color (placeholder "Warranty Tracker" + Material default palette until supplied).
- Full legal wording of Terms and Privacy pages (drafted as outlines; final copy before public launch).
- Firestore index strategy: no composite indexes required for v1 queries; add via `firebase.json` if a filter combination demands one.
