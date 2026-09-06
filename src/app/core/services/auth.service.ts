import { computed, inject, signal, Service } from '@angular/core';
import { Router } from '@angular/router';
import {
  applyActionCode,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  getRedirectResult,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  GoogleAuthProvider,
  confirmPasswordReset,
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

  readonly emailVerified = computed(() => this.user()?.emailVerified ?? false);
  readonly displayName = computed(
    () => this.user()?.displayName ?? this.user()?.email ?? 'Account',
  );

  constructor() {
    this.readyPromise = new Promise((resolve) => (this.resolveReady = resolve));
    void setPersistence(this.auth, browserLocalPersistence);
    onAuthStateChanged(this.auth, (user) => {
      this.user.set(user);
      this.authReady.set(true);
      this.resolveReady();
    });
    this.handleRedirectResult();
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

  private async handleRedirectResult(): Promise<void> {
    try {
      const result = await getRedirectResult(this.auth);
      if (result?.user) {
        this.user.set(result.user);
        this.analytics.log('sign_in');
      }
    } catch {
      // Errors here surface through onAuthStateChanged/guard flows; ignore.
    }
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await this.run('signInWithGoogle', () => signInWithRedirect(this.auth, provider));
  }

  async signUpWithEmail(email: string, password: string): Promise<void> {
    const credential = await this.run('signUpWithEmail', () =>
      createUserWithEmailAndPassword(this.auth, email, password),
    );
    this.user.set(credential.user);
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
    await this.run('applyActionCode', () => applyActionCode(this.auth, oobCode));
    if (mode === 'verifyEmail' && this.auth.currentUser) {
      await this.auth.currentUser.reload().catch(() => undefined);
    }
    return mode;
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
    this.returnUrl = '';
  }
}
