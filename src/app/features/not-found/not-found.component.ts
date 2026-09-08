import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SiteHeaderComponent } from '../../shared/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main class="nf">
      <p class="code" aria-hidden="true">404</p>
      <h1>Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <a mat-flat-button color="primary" routerLink="/">Back to Home</a>
    </main>
    <app-site-footer />
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
      }
      .nf {
        flex: 1;
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
        color: var(--secondary);
        font-weight: 700;
      }
      h1 {
        margin: 0;
      }
      p {
        color: var(--text-muted);
        margin: 0 0 0.75rem;
      }
    `,
  ],
})
export class NotFoundComponent {}
