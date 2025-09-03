import { Component, OnInit, inject } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-firebase-token-test',
  template: `
    <div class="firebase-token-test-container">
      <h3>Firebase Token Retrieval</h3>
      
      <div class="token-section">
        <div class="button-group">
          <button (click)="getMockToken()" class="mock-token-btn">Generate Mock Token</button>
          <button (click)="clearToken()" class="clear-token-btn">Clear Token</button>
        </div>
        
        <div class="manual-token-section">
          <label for="manual-token">Or paste your Firebase token:</label>
          <textarea 
            id="manual-token"
            [(ngModel)]="manualToken" 
            placeholder="Paste your Firebase JWT token here"
            class="token-input-field"></textarea>
          <button (click)="setManualToken()" class="set-token-btn">Set Token</button>
        </div>
      </div>
      
      <div class="token-display" *if="tokenService.token()">
        <h4>Current Token (first 50 chars):</h4>
        <div class="token-content">{{ getTokenPreview() }}</div>
        <p class="token-status">Token Status: <span class="status-active">Active</span></p>
      </div>
      
      <div class="token-display" *if="!tokenService.token()">
        <p class="token-status">Token Status: <span class="status-inactive">No token set</span></p>
      </div>
      
      <div class="instructions">
        <h4>How to get a real Firebase token:</h4>
        <ol>
          <li>Set up Firebase authentication in your project</li>
          <li>Sign in a user through Firebase</li>
          <li>Retrieve the token with: <code>firebase.auth().currentUser.getIdToken()</code></li>
          <li>Paste the token above</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .firebase-token-test-container {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin: 20px 0;
      background-color: #f9f9f9;
    }
    
    .token-section {
      margin-bottom: 15px;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    
    .manual-token-section {
      margin-top: 20px;
    }
    
    .token-input-field {
      width: 100%;
      min-height: 100px;
      padding: 8px;
      margin: 10px 0;
      font-family: monospace;
      font-size: 12px;
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
    
    .instructions {
      margin-top: 20px;
      padding: 15px;
      background-color: #e3f2fd;
      border-radius: 4px;
    }
    
    .instructions ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .instructions code {
      background-color: #d1c4e9;
      padding: 2px 4px;
      border-radius: 3px;
    }
  `],
  standalone: true,
  imports: [FormsModule]
})
export class FirebaseTokenTestComponent implements OnInit {
  tokenService = inject(TokenService);
  manualToken = '';
  
  ngOnInit(): void {
    // Set initial token value if exists
    this.manualToken = this.tokenService.token() || '';
  }
  
  getMockToken(): void {
    // Generate a mock token for testing
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldhcnJhbnR5IFRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9.5NHxQWJ96lZG5Xb4l2P5QXQyGw3a4dX7z6V3b5c8d9e`;
    this.tokenService.setToken(mockToken);
    this.manualToken = mockToken;
  }
  
  setManualToken(): void {
    this.tokenService.setToken(this.manualToken);
  }
  
  clearToken(): void {
    this.tokenService.clearToken();
    this.manualToken = '';
  }
  
  getTokenPreview(): string {
    const token = this.tokenService.token();
    if (!token) return '';
    
    // Show only first 50 characters for preview
    return token.length > 50 ? `${token.substring(0, 50)}...` : token;
  }
}
```

Now, let's update the app component to use this new component:

src/app/app.ts
