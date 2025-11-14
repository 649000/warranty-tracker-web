import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1><a routerLink="/" class="brand-link">Warranty Tracker</a></h1>
          <nav class="nav-links">
            <a routerLink="/" class="nav-link">Dashboard</a>
            <a routerLink="/products" class="nav-link">My Products</a>
            <a routerLink="/companies" class="nav-link">Companies</a>
          </nav>
          <div class="auth-actions">
            <a routerLink="/login" class="btn btn-outline">Login</a>
            <a routerLink="/register" class="btn btn-primary">Sign Up</a>
          </div>
        </div>
      </header>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
    }

    .brand-link {
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .brand-link:hover {
      color: rgba(255,255,255,0.9);
    }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .nav-link:hover {
      background-color: rgba(255,255,255,0.1);
    }

    .auth-actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-outline {
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
    }

    .btn-outline:hover {
      background: rgba(255,255,255,0.2);
    }

    .btn-primary {
      background-color: white;
      color: #667eea;
    }

    .btn-primary:hover {
      background-color: rgba(255,255,255,0.9);
    }

    .app-main {
      min-height: calc(100vh - 70px);
    }
  `],
  standalone: true,
  imports: [RouterOutlet]
})
export class App {}
