import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FirebaseTokenTestComponent } from './components/firebase-token-test/firebase-token-test.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Warranty Tracker</h1>
      </header>
      
      <main class="app-main">
        <app-firebase-token-test></app-firebase-token-test>
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
  imports: [RouterOutlet, FirebaseTokenTestComponent]
})
export class App {
  protected readonly title = signal('warranty-tracker-web');
}
