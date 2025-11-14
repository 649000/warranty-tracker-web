// Authentication service with Firebase
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Interface representing the current authentication state
 */
export interface AuthState {
  /** The currently authenticated user, or null if not signed in */
  user: User | null;
  /** Whether the authentication state is currently loading */
  loading: boolean;
  /** Any authentication error that occurred, or null if no error */
  error: AuthError | null;
}

/**
 * Authentication Service
 * Provides methods for user authentication using Firebase
 */
class AuthService {
  /**
   * Signs in a user with email and password
   * @param email - The user's email address
   * @param password - The user's password
   * @returns Promise resolving to the authenticated user
   * @throws AuthError if authentication fails
   */
  async signIn(email: string, password: string): Promise<User> {
    if (!email) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new user account with email and password
   * @param email - The user's email address
   * @param password - The user's password
   * @returns Promise resolving to the newly created user
   * @throws AuthError if account creation fails
   */
  async signUp(email: string, password: string): Promise<User> {
    if (!email) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Signs out the currently authenticated user
   * @returns Promise resolving when sign out is complete
   * @throws AuthError if sign out fails
   */
  async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sets up a listener for authentication state changes
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function to remove the listener
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (!callback) {
      throw new Error('Callback function is required');
    }
    return onAuthStateChanged(auth, callback);
  }
}

/**
 * Singleton instance of the authentication service
 */
export const authService = new AuthService();
