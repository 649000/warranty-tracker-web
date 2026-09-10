import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  ReCaptchaEnterpriseProvider: class {},
}));
vi.mock('firebase/storage', () => ({ connectStorageEmulator: vi.fn(), getStorage: vi.fn() }));
vi.mock('firebase/analytics', () => ({ getAnalytics: vi.fn(), logEvent: vi.fn() }));
vi.mock('@sentry/angular', () => ({ captureException: vi.fn(), captureMessage: vi.fn() }));

const fstore = vi.hoisted(() => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIME'),
}));

vi.mock('firebase/firestore', () => ({
  connectFirestoreEmulator: vi.fn(),
  getFirestore: vi.fn(),
  Timestamp: class {},
  doc: fstore.doc,
  getDoc: fstore.getDoc,
  setDoc: fstore.setDoc,
  serverTimestamp: fstore.serverTimestamp,
}));

import { DB } from '../firebase/firebase.providers';
import { NotificationPreferenceService } from './notification-preference.service';

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;

  beforeEach(() => {
    vi.clearAllMocks();
    fstore.doc.mockImplementation(
      (_db: unknown, userSegment: string, uid: string, settingsSegment: string, docId: string) => ({
        path: `${userSegment}/${uid}/${settingsSegment}/${docId}`,
      }),
    );
    TestBed.configureTestingModule({
      providers: [{ provide: DB, useValue: {} }],
    });
    service = TestBed.inject(NotificationPreferenceService);
  });

  it('reads reminders as enabled by default when no preference document exists', async () => {
    fstore.getDoc.mockResolvedValue({ data: () => undefined });
    await expect(service.expiryEmailsEnabled('user-1')).resolves.toBe(true);
  });

  it('reads reminders as disabled when the preference stores false', async () => {
    fstore.getDoc.mockResolvedValue({
      data: () => ({ expiryEmailsEnabled: false, updatedAt: 'SERVER_TIME' }),
    });
    await expect(service.expiryEmailsEnabled('user-1')).resolves.toBe(false);
  });

  it('reads reminders as enabled when the preference stores true', async () => {
    fstore.getDoc.mockResolvedValue({
      data: () => ({ expiryEmailsEnabled: true }),
    });
    await expect(service.expiryEmailsEnabled('user-1')).resolves.toBe(true);
  });

  it('persists the disabled preference under the user’s notification document', async () => {
    fstore.setDoc.mockResolvedValue(undefined);
    await service.setExpiryEmailsEnabled('user-1', false);

    expect(fstore.doc).toHaveBeenCalledWith({}, 'users', 'user-1', 'settings', 'notifications');
    expect(fstore.setDoc).toHaveBeenCalledWith(
      { path: 'users/user-1/settings/notifications' },
      { expiryEmailsEnabled: false, updatedAt: 'SERVER_TIME' },
      { merge: true },
    );
  });
});
