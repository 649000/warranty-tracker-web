import { Component, OnInit, inject } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';

@Component({
  selector: 'app-firebase-token-test',
  template: `
    <div class="firebase-token-test-container">
      <h3>Firebase Token Retrieval</h3>
      
      <div class="auth-section" *if="!firebaseUser">
        <h4>Sign In</h4>
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            id="email"
            type="email" 
            [(ngModel)]="email" 
            placeholder="Enter your email"
            class="form-input">
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            id="password"
            type="password" 
            [(ngModel)]="password" 
            placeholder="Enter your password"
            class="form-input">
        </div>
        
        <div class="button-group">
          <button (click)="signIn()" class="sign-in-btn" [disabled]="!email || !password">Sign In</button>
        </div>
      </div>
      
      <div class="user-section" *if="firebaseUser">
        <h4>Signed In User</h4>
        <p>Email: {{ firebaseUser.email }}</p>
        <p>UID: {{ firebaseUser.uid }}</p>
        
        <div class="button-group">
          <button (click)="getToken()" class="get-token-btn">Get Firebase Token</button>
          <button (click)="signOutUser()" class="sign-out-btn">Sign Out</button>
        </div>
      </div>
      
      <div class="token-section">
        <h4>Token Management</h4>
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
          <li>Sign in with your Firebase credentials</li>
          <li>Click "Get Firebase Token" to retrieve your JWT</li>
          <li>The token will be automatically set for API requests</li>
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
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    
    .sign-in-btn, .get-token-btn, .sign-out-btn, .set-token-btn, .clear-token-btn, .mock-token-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .sign-in-btn {
      background-color: #4CAF50;
      color: white;
    }
    
    .sign-in-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .get-token-btn {
      background-color: #2196F3;
      color: white;
    }
    
    .sign-out-btn {
      background-color: #f44336;
      color: white;
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
      background-color: #FF9800;
      color: white;
    }
    
    .user-section, .auth-section, .token-section {
      padding: 15px;
      background-color: #fff;
      border-radius: 4px;
      margin-bottom: 15px;
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
  
  // Firebase auth properties
  private auth: any;
  firebaseUser: User | null = null;
  email = '';
  password = '';
  manualToken = '';
  
  ngOnInit(): void {
    // Initialize Firebase with your config
    const firebaseConfig = {
      // Add your Firebase config here
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    
    // Initialize Firebase app
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    
    // Set initial token value if exists
    this.manualToken = this.tokenService.token() || '';
    
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.firebaseUser = user;
    });
  }
  
  signIn(): void {
    if (!this.email || !this.password) return;
    
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then((userCredential) => {
        // Signed in successfully
        this.firebaseUser = userCredential.user;
      })
      .catch((error) => {
        console.error('Sign in error:', error);
        alert(`Sign in failed: ${error.message}`);
      });
  }
  
  signOutUser(): void {
    signOut(this.auth)
      .then(() => {
        this.firebaseUser = null;
      })
      .catch((error) => {
        console.error('Sign out error:', error);
        alert(`Sign out failed: ${error.message}`);
      });
  }
  
  getToken(): void {
    if (!this.firebaseUser) {
      alert('No user signed in');
      return;
    }
    
    this.firebaseUser.getIdToken()
      .then((token) => {
        this.tokenService.setToken(token);
        this.manualToken = token;
      })
      .catch((error) => {
        console.error('Get token error:', error);
        alert(`Failed to get token: ${error.message}`);
      });
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
