/**
 * Firebase web config — PASTE YOUR PROJECT'S CONFIG HERE.
 *
 * These values are public identifiers (not secrets): they ship in the client
 * bundle. Access to your data is enforced by Firestore/Storage security rules,
 * not by hiding these values. Find them under Firebase console →
 * Project settings → Your apps → Web app.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyCh2jwEFN6Fpv1LQDOJt1hntUDESEIwt0I',
  authDomain: 'warranty-tracker-33dc5.firebaseapp.com',
  projectId: 'warranty-tracker-33dc5',
  storageBucket: 'warranty-tracker-33dc5.firebasestorage.app',
  messagingSenderId: '1068912111204',
  appId: '1:1068912111204:web:91940c54e1041577023971',
  measurementId: 'G-0NDS6PJN1N',
};

/**
 * Sentry DSN — PASTE YOUR PROJECT'S DSN HERE.
 *
 * The DSN is a public ingest key (not a secret): it ships in the client bundle
 * and only lets the client send events to your Sentry project. Find it under
 * Sentry → Settings → Projects → <project> → Client Keys (DSN).
 *
 * Leave empty to keep Sentry reporting disabled in all builds.
 */
export const sentryDsn =
  'https://c9f52db1d9e77c498c52a13222d27a32@o131112.ingest.us.sentry.io/4512039586037760';

/**
 * Firebase App Check — reCAPTCHA Enterprise site key.
 *
 * App Check attests that requests come from your real web app, blocking
 * scripted abuse of Firestore/Storage that would otherwise run up the bill.
 * Create a score-based Website key in Google Cloud → Security → reCAPTCHA
 * Enterprise (never add localhost), then register it for the web app under
 * Firebase console → App Check → Apps. Leave empty to keep App Check disabled
 * (the SDK is not initialized). Enforcement is enabled per-service in the
 * Firebase console.
 */
export const appCheckSiteKey = '';

/**
 * Whether to connect the Firebase Auth/Firestore/Storage SDKs to the local
 * emulator suite (127.0.0.1:9099/8080/9199). The default `ng serve` targets
 * the live Firebase project (false). The emulator build configuration flips
 * this on via `environment.development.ts` (see angular.json "emulators").
 */
export const useEmulators = false;
