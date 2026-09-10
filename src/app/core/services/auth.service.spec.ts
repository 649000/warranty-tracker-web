import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';

const authMocks = vi.hoisted(() => ({
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
}));

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: 'LOCAL',
  GoogleAuthProvider: class {},
  setPersistence: authMocks.setPersistence,
  onAuthStateChanged: authMocks.onAuthStateChanged,
  signInWithPopup: authMocks.signInWithPopup,
  signInWithEmailAndPassword: authMocks.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: authMocks.createUserWithEmailAndPassword,
  sendEmailVerification: authMocks.sendEmailVerification,
  sendPasswordResetEmail: authMocks.sendPasswordResetEmail,
  applyActionCode: authMocks.applyActionCode,
  confirmPasswordReset: authMocks.confirmPasswordReset,
  deleteUser: authMocks.deleteUser,
  signOut: authMocks.signOut,
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
  onSnapshot: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
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

import { AUTH } from '../firebase/firebase.providers';
import { AnalyticsService } from './analytics.service';
import { ErrorReportingService } from './error-reporting.service';
import { AuthService } from './auth.service';

function fakeUser(overrides: Partial<User> = {}): User {
  return { uid: 'u1', email: 'a@b.c', emailVerified: true, ...overrides } as User;
}

async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
}

describe('AuthService', () => {
  const analytics = { log: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.setPersistence.mockResolvedValue(undefined);
    authMocks.onAuthStateChanged.mockReturnValue(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: AUTH, useValue: {} },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
        { provide: AnalyticsService, useValue: analytics },
        { provide: ErrorReportingService, useValue: { captureException: vi.fn() } },
      ],
    });
  });

  it('applies persistence on initialization', async () => {
    TestBed.inject(AuthService);
    await flushMicrotasks();
    expect(authMocks.setPersistence).toHaveBeenCalled();
  });

  it('resolves readyPromise once the initial auth state has settled', async () => {
    const service = TestBed.inject(AuthService);
    await flushMicrotasks();

    let settled = false;
    await service.readyPromise.then(() => (settled = true));
    expect(settled).toBe(true);
  });

  it('sets the user when the auth state listener emits', async () => {
    let listener: ((user: User | null) => void) | undefined;
    authMocks.onAuthStateChanged.mockImplementation((_auth, cb) => {
      listener = cb;
      return () => undefined;
    });

    const service = TestBed.inject(AuthService);
    await flushMicrotasks();

    const user = fakeUser();
    listener!(user);
    expect(service.user()).toBe(user);
    expect(service.authReady()).toBe(true);
  });

  it('sets the user and logs sign_in on Google sign-in', async () => {
    const user = fakeUser();
    authMocks.signInWithPopup.mockResolvedValue({ user });

    const service = TestBed.inject(AuthService);
    await service.signInWithGoogle();

    expect(service.user()).toBe(user);
    expect(analytics.log).toHaveBeenCalledWith('sign_in');
  });
});
