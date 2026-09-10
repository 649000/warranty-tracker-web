import { computed, inject, signal, Service } from '@angular/core';
import { Router } from '@angular/router';
import {
  applyActionCode,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  confirmPasswordReset,
  updatePassword as firebaseUpdatePassword,
  verifyBeforeUpdateEmail,
  type User,
} from 'firebase/auth';
import { AUTH } from '../firebase/firebase.providers';
import { isExpectedAuthError, toFriendlyAuthError } from '../utils/auth-errors';
import { AnalyticsService } from './analytics.service';
import { ErrorReportingService } from './error-reporting.service';

@Service()
export class AuthService {
  private readonly auth = inject(AUTH);
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);
  private readonly errorReporting = inject(ErrorReportingService);

  /** The signed-in Firebase user, or null. */
  readonly user = signal<User | null>(null);
  /** True once the initial auth state has resolved (avoids flicker in guards). */
  readonly authReady = signal(false);
  /** Resolves once the initial auth state has settled; guards await this. */
  readonly readyPromise: Promise<void>;
  /** The URL a guarded page was heading to before being redirected to sign-in. */
  private returnUrl = '';
  private resolveReady!: () => void;

  /** Tracks `user.emailVerified` explicitly so a reload can flip it reactively. */
  private readonly verifiedSignal = signal(false);
  readonly emailVerified = this.verifiedSignal.asReadonly();
  readonly displayName = computed(
    () => this.user()?.displayName ?? this.user()?.email ?? 'Account',
  );

  constructor() {
    this.readyPromise = new Promise((resolve) => (this.resolveReady = resolve));
    void this.initialize();
  }

  /**
   * Settles the initial auth state: persistence first, then the auth state
   * listener. `readyPromise` resolves once both are in place, so route guards
   * read a final `user()` value instead of the first (null) `onAuthStateChanged`
   * emission.
   */
  private async initialize(): Promise<void> {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
    } catch {
      // Persistence is best-effort; continue so the auth state still resolves.
    }
    onAuthStateChanged(this.auth, (user) => {
      this.user.set(user);
      this.verifiedSignal.set(user?.emailVerified ?? false);
      this.authReady.set(true);
    });
    this.resolveReady();
  }

  setReturnUrl(url: string): void {
    this.returnUrl = url;
  }

  /** After sign-in, go to the previously intended page or the default. */
  async redirectAfterAuth(): Promise<void> {
    await this.run('redirectAfterAuth', () =>
      this.router.navigateByUrl(this.returnUrl || '/warranties'),
    );
  }

  /** Runs an auth operation, reporting unexpected (non-validation) failures. */
  private async run<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation });
      }
      throw error;
    }
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const credential = await this.run('signInWithGoogle', () =>
      signInWithPopup(this.auth, provider),
    );
    this.user.set(credential.user);
    this.verifiedSignal.set(credential.user.emailVerified);
    this.analytics.log('sign_in');
  }

  async signUpWithEmail(email: string, password: string): Promise<void> {
    const credential = await this.run('signUpWithEmail', () =>
      createUserWithEmailAndPassword(this.auth, email, password),
    );
    this.user.set(credential.user);
    this.verifiedSignal.set(credential.user.emailVerified);
    this.analytics.log('sign_in');
    if (!credential.user.emailVerified) {
      await sendEmailVerification(credential.user).catch(() => undefined);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    const credential = await this.run('signInWithEmail', () =>
      signInWithEmailAndPassword(this.auth, email, password),
    );
    this.user.set(credential.user);
    this.verifiedSignal.set(credential.user.emailVerified);
    this.analytics.log('sign_in');
  }

  async sendPasswordReset(email: string): Promise<void> {
    await this.run('sendPasswordReset', () => sendPasswordResetEmail(this.auth, email));
  }

  async resendVerificationEmail(): Promise<void> {
    const current = this.auth.currentUser;
    if (current) {
      await this.run('resendVerificationEmail', () => sendEmailVerification(current));
    }
  }

  async signOut(): Promise<void> {
    await this.run('signOut', () => signOut(this.auth));
    this.returnUrl = '';
  }

  /**
   * Applies an auth action code from an email link (verify email, reset
   * password, recover email). Returns a message describing what happened, or
   * null when there is no pending action.
   */
  async handleActionCode(): Promise<string | null> {
    const url = new URL(window.location.href);
    const mode = url.searchParams.get('mode');
    const oobCode = url.searchParams.get('oobCode');
    if (!mode || !oobCode) {
      return null;
    }
    if (mode === 'resetPassword') {
      return 'resetPassword';
    }
    // Wait for the persisted session to restore so `currentUser` exists and its
    // token can be refreshed after the code is applied.
    await this.auth.authStateReady();
    await this.run('applyActionCode', () => applyActionCode(this.auth, oobCode));
    if (mode === 'verifyEmail' || mode === 'recoverEmail') {
      await this.refreshEmailVerification();
    }
    return mode;
  }

  /**
   * Reloads the current user and forces an ID-token refresh so the
   * `email_verified` claim used by security rules updates immediately after a
   * user confirms their address. Returns the refreshed verification state.
   */
  async refreshEmailVerification(): Promise<boolean> {
    const current = this.auth.currentUser;
    if (!current) {
      this.verifiedSignal.set(false);
      return false;
    }
    // Best-effort: a network hiccup should not crash the verification page.
    await current.reload().catch(() => undefined);
    await current.getIdToken(true).catch(() => undefined);
    this.user.set(this.auth.currentUser);
    const verified = this.auth.currentUser?.emailVerified ?? false;
    this.verifiedSignal.set(verified);
    return verified;
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    await this.run('confirmPasswordReset', () =>
      confirmPasswordReset(this.auth, code, newPassword),
    );
  }

  errorMessage(error: unknown): string {
    return toFriendlyAuthError(error);
  }

  /** Deletes the signed-in account after the caller removes user data. */
  async removeAccount(): Promise<void> {
    const current = this.auth.currentUser;
    if (!current) {
      return;
    }
    await this.run('removeAccount', () => deleteUser(current));
    this.user.set(null);
    this.verifiedSignal.set(false);
    this.returnUrl = '';
  }

  async reauthenticate(password: string): Promise<void> {
    const current = this.auth.currentUser;
    if (!current || !current.email) {
      return;
    }
    const credential = EmailAuthProvider.credential(current.email, password);
    await this.run('reauthenticate', () => reauthenticateWithCredential(current, credential));
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const current = this.auth.currentUser;
    if (!current || !current.email) {
      return;
    }
    await this.reauthenticate(currentPassword);
    await this.run('updatePassword', () => firebaseUpdatePassword(current, newPassword));
    this.analytics.log('update_password');
  }

  async changeEmail(newEmail: string, currentPassword: string): Promise<void> {
    const current = this.auth.currentUser;
    if (!current || !current.email) {
      return;
    }
    await this.reauthenticate(currentPassword);
    await this.run('changeEmail', () => verifyBeforeUpdateEmail(current, newEmail));
    this.analytics.log('change_email');
  }
}
