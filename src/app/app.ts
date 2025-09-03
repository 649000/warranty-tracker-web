import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TokenTestComponent } from './components/token-test/token-test.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Warranty Tracker</h1>
      </header>
      
      <main class="app-main">
        <app-token-test></app-token-test>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }
    
    .app-header {
      background-color: #3f51b5;
      color: white;
      padding: 1rem;
      text-align: center;
    }
    
    .app-main {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `],
  standalone: true,
  imports: [RouterOutlet, TokenTestComponent]
})
export class App {
  protected readonly title = signal('warranty-tracker-web');
}
```

These changes will:
1. Create a dashboard component with navigation links
2. Create a company list component with search functionality
3. Update your routes to include these components
4. Add FormsModule to your app config for ngModel support
5. Update your main app component to include the token test component and router outlet

You can now navigate to `/` for the dashboard and `/companies` to see the company list. The components are designed to work without authentication enforcement, allowing for easy local testing.