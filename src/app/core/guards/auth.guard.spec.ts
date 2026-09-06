import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { PartialMatchRouteSnapshot, Route, UrlSegment } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';

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

import { AuthService } from '../services/auth.service';
import { authGuard, guestGuard, redirectIfAuthenticated } from './auth.guard';

function fakeAuth(user: User | null) {
  return {
    readyPromise: Promise.resolve(),
    user: signal<User | null>(user),
    setReturnUrl: vi.fn(),
  };
}

function fakeRouter(navigationUrl: string | null) {
  return {
    getCurrentNavigation: () =>
      navigationUrl === null ? null : { extractedUrl: { toString: () => navigationUrl } },
    createUrlTree: (commands: unknown[]) => commands,
  };
}

describe('authGuard', () => {
  it('allows access when the user is authenticated', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: fakeAuth({ uid: 'u1' } as User) },
        { provide: Router, useValue: fakeRouter(null) },
      ],
    });
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as Route, [] as UrlSegment[], {} as PartialMatchRouteSnapshot),
    );
    expect(result).toBe(true);
  });

  it('redirects to login when unauthenticated', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: fakeAuth(null) },
        { provide: Router, useValue: fakeRouter('/warranties') },
      ],
    });
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as Route, [] as UrlSegment[], {} as PartialMatchRouteSnapshot),
    );
    expect(result).toEqual(['/login']);
  });
});

describe('guestGuard', () => {
  it('allows an authenticated user through without redirecting', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: fakeAuth({ uid: 'u1' } as User) },
        { provide: Router, useValue: fakeRouter(null) },
      ],
    });
    const result = await TestBed.runInInjectionContext(() =>
      guestGuard({} as Route, [] as UrlSegment[], {} as PartialMatchRouteSnapshot),
    );
    expect(result).toBe(true);
  });

  it('allows an unauthenticated user through', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: fakeAuth(null) },
        { provide: Router, useValue: fakeRouter(null) },
      ],
    });
    const result = await TestBed.runInInjectionContext(() =>
      guestGuard({} as Route, [] as UrlSegment[], {} as PartialMatchRouteSnapshot),
    );
    expect(result).toBe(true);
  });
});

describe('redirectIfAuthenticated', () => {
  it('navigates an authenticated user to the warranty list', () => {
    const navigateByUrl = vi.fn(() => Promise.resolve(true));
    const auth = fakeAuth({ uid: 'u1' } as User);
    const router = { navigateByUrl } as unknown as Router;
    redirectIfAuthenticated(auth as unknown as AuthService, router);
    expect(navigateByUrl).toHaveBeenCalledWith('/warranties');
  });

  it('does nothing for an unauthenticated user', () => {
    const navigateByUrl = vi.fn();
    const auth = fakeAuth(null);
    const router = { navigateByUrl } as unknown as Router;
    redirectIfAuthenticated(auth as unknown as AuthService, router);
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
