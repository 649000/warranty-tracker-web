import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // Signal to store the current token
  private readonly _token = signal<string | null>(null);
  
  // Read-only signal for token
  readonly token = this._token.asReadonly();
  
  // Method to set the token
  setToken(token: string | null): void {
    this._token.set(token);
  }
  
  // Method to clear the token
  clearToken(): void {
    this._token.set(null);
  }
}
