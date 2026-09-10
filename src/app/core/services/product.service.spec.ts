import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fstoreMocks = vi.hoisted(() => ({
  onSnapshot: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: 'LOCAL',
  GoogleAuthProvider: class {},
  setPersistence: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  applyActionCode: vi.fn(),
  confirmPasswordReset: vi.fn(),
  deleteUser: vi.fn(),
  signOut: vi.fn(),
  connectAuthEmulator: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock('firebase/app', () => ({ initializeApp: vi.fn() }));
vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: class {},
}));
vi.mock('firebase/storage', () => ({ connectStorageEmulator: vi.fn(), getStorage: vi.fn() }));
vi.mock('firebase/analytics', () => ({ getAnalytics: vi.fn(), logEvent: vi.fn() }));
vi.mock('firebase/firestore', () => ({
  connectFirestoreEmulator: vi.fn(),
  getFirestore: vi.fn(),
  Timestamp: class {},
  onSnapshot: fstoreMocks.onSnapshot,
  collection: fstoreMocks.collection,
  query: fstoreMocks.query,
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  deleteField: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  writeBatch: vi.fn(),
}));
vi.mock('@sentry/angular', () => ({ captureException: vi.fn(), captureMessage: vi.fn() }));

import { DB } from '../firebase/firebase.providers';
import { AnalyticsService } from './analytics.service';
import { ErrorReportingService } from './error-reporting.service';
import { ProductService } from './product.service';

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fstoreMocks.collection.mockReturnValue({});
    fstoreMocks.query.mockReturnValue({});
    TestBed.configureTestingModule({
      providers: [
        { provide: DB, useValue: {} },
        { provide: AnalyticsService, useValue: { log: vi.fn() } },
        { provide: ErrorReportingService, useValue: { captureException: vi.fn() } },
      ],
    });
  });

  it('sets error when the product snapshot listener fails', () => {
    let errorCb: ((error: Error) => void) | undefined;
    fstoreMocks.onSnapshot.mockImplementation((_query, _success, error) => {
      errorCb = error;
      return () => undefined;
    });

    const service = TestBed.inject(ProductService);
    service.watch('uid-1');

    expect(service.error()).toBe(false);
    errorCb!(new Error('permission-denied'));
    expect(service.error()).toBe(true);
  });

  it('clears error and marks loaded on a successful snapshot', () => {
    let successCb: ((snapshot: { docs: unknown[] }) => void) | undefined;
    fstoreMocks.onSnapshot.mockImplementation((_query, success) => {
      successCb = success;
      return () => undefined;
    });

    const service = TestBed.inject(ProductService);
    service.watch('uid-1');
    successCb!({ docs: [] });

    expect(service.loaded()).toBe(true);
    expect(service.error()).toBe(false);
  });

  it('clears error when a watch is retried', () => {
    let errorCb: ((error: Error) => void) | undefined;
    fstoreMocks.onSnapshot.mockImplementation((_query, _success, error) => {
      errorCb = error;
      return () => undefined;
    });

    const service = TestBed.inject(ProductService);
    service.watch('uid-1');
    errorCb!(new Error('boom'));
    expect(service.error()).toBe(true);

    service.watch('uid-1');
    expect(service.error()).toBe(false);
  });
});
