import { Component, inject } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { TokenService } from '../../services/token.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-api-test',
  template: `
    <div class="api-test-container">
      <h3>API Token Testing</h3>
      
      <div class="test-section">
        <h4>Company Service Tests</h4>
        <div class="button-group">
          <button (click)="testGetCompaniesNoAuth()" class="test-btn">Get Companies (No Auth)</button>
          <button (click)="testGetCompaniesWithAuth()" class="test-btn">Get Companies (With Auth)</button>
        </div>
        <div class="result-section" *if="companyResults">
          <h5>Results:</h5>
          <pre>{{ companyResults | json }}</pre>
        </div>
      </div>
      
      <div class="token-info">
        <h4>Current Token Status</h4>
        <p>Token Set: {{ tokenService.token() ? 'Yes' : 'No' }}</p>
        <p *if="tokenService.token()">Token Preview: {{ getTokenPreview() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .api-test-container {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin: 20px 0;
      background-color: #f0f8ff;
    }
    
    .test-section {
      margin-bottom: 20px;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 10px 0;
    }
    
    .test-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      background-color: #2196F3;
      color: white;
      cursor: pointer;
    }
    
    .result-section {
      margin-top: 15px;
    }
    
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
      font-size: 12px;
    }
    
    .token-info {
      padding: 15px;
      background-color: #fffde7;
      border-radius: 4px;
    }
  `],
  standalone: true,
  imports: [FormsModule]
})
export class ApiTestComponent {
  companyService = inject(CompanyService);
  tokenService = inject(TokenService);
  
  companyResults: any = null;
  
  testGetCompaniesNoAuth(): void {
    this.companyResults = null;
    this.companyService.getAll(false).subscribe({
      next: (data) => {
        this.companyResults = { success: true, data: data, authUsed: false };
      },
      error: (error) => {
        this.companyResults = { success: false, error: error.message, authUsed: false };
      }
    });
  }
  
  testGetCompaniesWithAuth(): void {
    this.companyResults = null;
    this.companyService.getAll(true).subscribe({
      next: (data) => {
        this.companyResults = { success: true, data: data, authUsed: true };
      },
      error: (error) => {
        this.companyResults = { success: false, error: error.message, authUsed: true };
      }
    });
  }
  
  getTokenPreview(): string {
    const token = this.tokenService.token();
    if (!token) return '';
    
    // Show only first and last 10 characters for preview
    if (token.length <= 20) return token;
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
  }
}
