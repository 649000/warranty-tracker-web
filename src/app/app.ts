import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TokenTestComponent } from './components/token-test/token-test.component';
import { ApiTestComponent } from './components/api-test/api-test.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Warranty Tracker</h1>
      </header>
      
      <main class="app-main">
        <app-token-test></app-token-test>
        <app-api-test></app-api-test>
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
  imports: [RouterOutlet, TokenTestComponent, ApiTestComponent]
})
export class App {
  protected readonly title = signal('warranty-tracker-web');
}
