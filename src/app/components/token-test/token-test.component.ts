import { Component, OnInit, inject } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { TokenService } from '../../services/token.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-token-test',
  template: `
    <div class="token-test-container">
      <h3>Firebase Token Testing</h3>
      
      <div class="token-section">
        <label for="token-input">Firebase Token:</label>
        <textarea 
          id="token-input"
          [(ngModel)]="tokenInput" 
          placeholder="Enter Firebase JWT token for testing"
          class="token-input-field"></textarea>
        <div class="button-group">
          <button (click)="setToken()" class="set-token-btn">Set Token</button>
          <button (click)="clearToken()" class="clear-token-btn">Clear Token</button>
          <button (click)="generateMockToken()" class="mock-token-btn">Generate Mock Token</button>
        </div>
      </div>
      
      <div class="token-display" *if="tokenService.token()">
        <h4>Current Token:</h4>
        <div class="token-content">{{ tokenService.token() }}</div>
        <p class="token-status">Token Status: <span class="status-active">Active</span></p>
      </div>
      
      <div class="token-display" *if="!tokenService.token()">
        <p class="token-status">Token Status: <span class="status-inactive">No token set</span></p>
      </div>
    </div>
  `,
  styles: [`
    .token-test-container {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin: 20px 0;
      background-color: #f9f9f9;
    }
    
    .token-section {
      margin-bottom: 15px;
    }
    
    .token-input-field {
      width: 100%;
      min-height: 100px;
      padding: 8px;
      margin: 10px 0;
      font-family: monospace;
      font-size: 12px;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .set-token-btn, .clear-token-btn, .mock-token-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .set-token-btn {
      background-color: #4CAF50;
      color: white;
    }
    
    .clear-token-btn {
      background-color: #f44336;
      color: white;
    }
    
    .mock-token-btn {
      background-color: #2196F3;
      color: white;
    }
    
    .token-display {
      padding: 15px;
      background-color: #e8f5e9;
      border-radius: 4px;
      margin-top: 15px;
    }
    
    .token-content {
      font-family: monospace;
      font-size: 12px;
      background-color: #fff;
      padding: 10px;
      border-radius: 4px;
      word-break: break-all;
      margin: 10px 0;
    }
    
    .token-status {
      font-weight: bold;
      margin: 0;
    }
    
    .status-active {
      color: #4CAF50;
    }
    
    .status-inactive {
      color: #f44336;
    }
  `],
  standalone: true,
  imports: [FormsModule]
})
export class TokenTestComponent implements OnInit {
  firebaseAuthService = inject(FirebaseAuthService);
  tokenService = inject(TokenService);
  tokenInput = '';
  
  ngOnInit(): void {
    // Initialize Firebase UI
    this.firebaseAuthService.initFirebaseUI();
    
    // Set initial token value if exists
    this.tokenInput = this.tokenService.token() || '';
  }
  
  setToken(): void {
    this.firebaseAuthService.setTestToken(this.tokenInput);
  }
  
  clearToken(): void {
    this.firebaseAuthService.clearToken();
    this.tokenInput = '';
  }
  
  generateMockToken(): void {
    // Generate a mock token for testing
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldhcnJhbnR5IFRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9.5NHxQWJ96lZG5Xb4l2P5QXQyGw3a4dX7z6V3b5c8d9e`;
    this.tokenInput = mockToken;
    this.setToken();
  }
}
