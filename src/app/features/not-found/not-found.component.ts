import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule],
  template: `
    <main class="nf">
      <p class="code" aria-hidden="true">404</p>
      <h1>Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <a mat-flat-button color="primary" routerLink="/">Back to Home</a>
    </main>
  `,
  styles: [
    `
      .nf {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        text-align: center;
        padding: 2rem;
      }
      .code {
        font-size: 3rem;
        margin: 0;
        color: var(--mat-sys-primary);
      }
      h1 {
        margin: 0;
      }
    `,
  ],
})
export class NotFoundComponent {}
