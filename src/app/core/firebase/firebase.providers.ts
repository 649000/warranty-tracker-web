import { InjectionToken, type Provider } from '@angular/core';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { appCheckSiteKey, firebaseConfig, useEmulators } from '@env/environment';

export const APP = new InjectionToken<FirebaseApp>('FirebaseApp');
export const AUTH = new InjectionToken<Auth>('FirebaseAuth');
export const DB = new InjectionToken<Firestore>('Firestore');
export const STORAGE = new InjectionToken<FirebaseStorage>('FirebaseStorage');
export const ANALYTICS = new InjectionToken<Analytics | null>('FirebaseAnalytics');

function firebaseAppFactory(): FirebaseApp {
  const app = initializeApp(firebaseConfig);
  if (appCheckSiteKey && !useEmulators) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch {
      // App Check is best-effort; never block startup if attestation fails.
    }
  }
  return app;
}

function authFactory(app: FirebaseApp): Auth {
  const auth = getAuth(app);
  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  return auth;
}

function dbFactory(app: FirebaseApp): Firestore {
  const db = getFirestore(app);
  if (useEmulators) {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  return db;
}

function storageFactory(app: FirebaseApp): FirebaseStorage {
  const storage = getStorage(app);
  if (useEmulators) {
    connectStorageEmulator(storage, '127.0.0.1', 9199);
  }
  return storage;
}

function analyticsFactory(app: FirebaseApp): Analytics | null {
  try {
    return getAnalytics(app);
  } catch {
    return null;
  }
}

export const firebaseProviders: Provider[] = [
  { provide: APP, useFactory: firebaseAppFactory },
  { provide: AUTH, useFactory: authFactory, deps: [APP] },
  { provide: DB, useFactory: dbFactory, deps: [APP] },
  { provide: STORAGE, useFactory: storageFactory, deps: [APP] },
  { provide: ANALYTICS, useFactory: analyticsFactory, deps: [APP] },
];
