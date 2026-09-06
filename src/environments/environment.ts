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
