# Warranty Tracker

A public web app that centralizes warranty coverage per product — what's covered, what's expiring soon, and the details you need when filing a claim.

## Tech stack

- **Angular v22** (standalone components, signals, zoneless, lazy-loaded routes)
- **Angular Material** (Material 3, light + dark theme)
- **Firebase** native JS SDK v12 — Auth, Firestore, Storage, Hosting, Analytics (no AngularFire)
- **date-fns**, **browser-image-compression**
- **Vitest** (unit/component), **Firebase Emulator** (security-rules tests), **Playwright + axe-core** (smoke + accessibility)

## Prerequisites

- Node 22+
- A [Firebase](https://console.firebase.google.com) project
- The Firebase CLI (`npm i -g firebase-tools`) and `firebase login`

## Firebase setup

1. Create a project in the Firebase console.
2. Enable the sign-in providers you want under **Authentication → Sign-in method**:
   - Email/Password
   - Google
3. Enable **Firestore**, **Storage**, **Hosting**, and **Analytics**.
4. Get your web app config from **Project settings → Your apps → Web app** (the `firebaseConfig` object).
5. Paste those values into `src/environments/environment.ts` (the single source of truth).
6. Set your project id in `.firebaserc`.

> The Firebase web config is public identifiers, not secrets — security comes from the rules (`firestore.rules`, `storage.rules`), not from hiding the config. Emulator wiring is driven by the `useEmulators` flag in `src/environments/environment.ts`: the default `ng serve` targets the live Firebase project, and `ng serve --configuration emulators` wires the SDK to the local emulators.

## Running locally

```bash
npm install

# Serve against the live Firebase project (default; supports real Google sign-in)
npm start
```

To run against the local emulators instead (offline work or deterministic data), start the emulators and serve the emulator configuration:

```bash
# Terminal 1 — start the emulators (auth, firestore, storage)
npm run emulators

# Terminal 2 — serve the app wired to the emulators
npm start -- --configuration emulators
```

## Data model

```
users/{uid}/products/{productId}            owner-scoped by path
users/{uid}/products/{productId}/coverages/{coverageId}
users/{uid}/proofs/{productId}/{file}       (Storage)
```

Each product has a name, purchase date, category, and one or more coverages (manufacturer/retailer/international/other, local vs international scope, duration-based expiry with lifetime support). Proof of purchase is optional text, a client-side-downsized image, or a PDF. Status (active / expiring-soon / expired) is derived from time with a 60-day threshold — never stored.

## Testing

```bash
npm test          # unit + component tests (Vitest)
npm run test:rules # Firestore security rules via the emulator
npm run e2e       # Playwright smoke + accessibility (axe) — needs the emulator running
```

## Lint, format, build

```bash
npm run lint
npm run format:check
npm run build       # production build
```

## Deployment

CI is configured in `.github/workflows/ci.yml`:

- Every PR runs lint, format-check, unit tests, and a production build as a gate.
- Push to `main` builds and deploys Hosting + Firestore/Storage rules automatically.

To enable deploys, add a `FIREBASE_TOKEN` secret to the repository (generate with `firebase login:ci`).
