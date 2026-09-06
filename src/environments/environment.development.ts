/**
 * Emulator environment, used only by the "emulators" build configuration
 * (see angular.json). Mirrors `environment.ts` with `useEmulators: true` so
 * `ng serve --configuration emulators` and the automated Playwright/rules
 * suites talk to the local Firebase emulators.
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

export const sentryDsn =
  'https://c9f52db1d9e77c498c52a13222d27a32@o131112.ingest.us.sentry.io/4512039586037760';

export const useEmulators = true;
