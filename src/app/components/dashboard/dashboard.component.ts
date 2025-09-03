import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <h1>Warranty Tracker Dashboard</h1>
      
      <div class="navigation-links">
        <a routerLink="/companies" class="nav-link">Companies</a>
        <a routerLink="/products" class="nav-link">Products</a>
        <a routerLink="/warranties" class="nav-link">Warranties</a>
        <a routerLink="/claims" class="nav-link">Claims</a>
        <a routerLink="/user-products" class="nav-link">My Products</a>
      </div>
      
      <div class="info-section">
        <h2>Getting Started</h2>
        <p>Welcome to the Warranty Tracker application. Use the navigation links above to manage your warranties and claims.</p>
        <p>Don't forget to set your Firebase token in the token testing component for authenticated requests.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .navigation-links {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin: 30px 0;
    }
    
    .nav-link {
      padding: 12px 20px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .nav-link:hover {
      background-color: #45a049;
    }
    
    .info-section {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 4px;
      margin-top: 30px;
    }
  `],
  standalone: true,
  imports: [RouterLink]
})
export class DashboardComponent {
  constructor() { }
}
```

src/app/components/company/company-list/company-list.component.ts
