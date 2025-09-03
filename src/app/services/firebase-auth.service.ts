import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private readonly _isFirebaseUIReady = new BehaviorSubject<boolean>(false);
  
  constructor(private tokenService: TokenService) { }

  // Initialize Firebase UI for sign-in
  initFirebaseUI(): void {
    // In a real implementation, this would initialize the Firebase UI
    // For testing purposes, we'll just mark it as ready
    this._isFirebaseUIReady.next(true);
  }

  // Simulate getting a Firebase token (in a real app, this would come from Firebase auth)
  getFirebaseToken(): string | null {
    // This is where you would normally call:
    // return firebase.auth().currentUser?.getIdToken() || null;
    // For testing, we'll return a mock token or the one already set
    return this.tokenService.token() || 'mock-firebase-jwt-token-for-testing';
  }

  // Set token manually for testing
  setTestToken(token: string): void {
    this.tokenService.setToken(token);
  }

  // Clear token
  clearToken(): void {
    this.tokenService.clearToken();
  }

  // Check if Firebase UI is ready
  isFirebaseUIReady(): Observable<boolean> {
    return this._isFirebaseUIReady.asObservable();
  }
}
