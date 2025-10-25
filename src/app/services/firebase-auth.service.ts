import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth, User, UserCredential, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, confirmPasswordReset, getIdToken } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { shareReplay, tap, startWith } from 'rxjs/operators';
import { signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private auth: Auth = inject(Auth); // Inject AngularFire Auth instance
  private platformId = inject(PLATFORM_ID);

  // Signal to hold the current Firebase user object
  private readonly _user = signal<User | null>(null);
  // Computed signals for derived state
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  // Signal for the ID token
  private readonly _idToken = signal<string | null>(null);
  readonly idToken = this._idToken.asReadonly();

  // Observable for auth state changes
  private _authState$: Observable<User | null> | null = null;

  constructor() {
    // Setup the auth state observable during service construction
    // This ensures it's ready when components subscribe
    if (isPlatformBrowser(this.platformId)) {
      this.setupAuthStateObservable();
    } else {
      // Handle server-side rendering if needed, though auth state is usually client-side
      console.warn('Firebase Auth state setup skipped on server.');
    }
  }

  private setupAuthStateObservable(): void {
    this._authState$ = new Observable<User | null>((subscriber) => {
      const unsubscribe = onAuthStateChanged(
        this.auth,
        (user) => {
          subscriber.next(user);
          // Fetch token when user changes
          if (user) {
            this.fetchAndSetToken().catch(err => console.error("Error fetching token on user change:", err));
          } else {
            this._idToken.set(null); // Clear token if user logs out
          }
        },
        (error) => subscriber.error(error)
      );
      return { unsubscribe };
    }).pipe(
      tap(user => this._user.set(user)), // Update user signal
      startWith(this.auth.currentUser), // Emit current user immediately upon subscription
      shareReplay(1) // Multicast and replay last value
    );
  }

  get authState$(): Observable<User | null> {
    if (!this._authState$) {
      console.warn('Auth state observable not initialized yet or running on server. Returning empty observable.');
      return of(null);
    }
    return this._authState$;
  }

  /**
   * Fetches the current user's ID token and stores it in the signal.
   */
  private async fetchAndSetToken(forceRefresh: boolean = false): Promise<string | null> {
    if (this.auth.currentUser) {
      try {
        const token = await getIdToken(this.auth.currentUser, forceRefresh);
        this._idToken.set(token);
        return token;
      } catch (error) {
        console.error("Error fetching ID token:", error);
        this._idToken.set(null);
        return null;
      }
    } else {
      this._idToken.set(null);
      return null;
    }
  }

  /**
   * Signs in a user with email and password.
   */
  signIn(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(credential => {
        this._user.set(credential.user);
        // Token fetching handled by onAuthStateChanged listener
      })
    );
  }

  /**
   * Creates a new user account with email and password.
   */
  signUp(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(credential => {
        this._user.set(credential.user);
        // Token fetching handled by onAuthStateChanged listener
      })
    );
  }

  /**
   * Signs out the current user.
   */
  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this._user.set(null);
        this._idToken.set(null);
      })
    );
  }

  /**
   * Sends a password reset email.
   */
  sendPasswordResetEmail(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  /**
   * Confirms the password reset code and updates the password.
   */
  confirmPasswordReset(oobCode: string, newPassword: string): Observable<void> {
    return from(confirmPasswordReset(this.auth, oobCode, newPassword));
  }

  /**
   * Gets the currently signed-in user object.
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Checks if the user is currently authenticated.
   */
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  /**
   * Gets the current ID token as a Promise.
   */
  getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    return this.fetchAndSetToken(forceRefresh);
  }
}
