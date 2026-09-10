import { Component, afterNextRender, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `<router-outlet />`,
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    afterNextRender(() => {
      void this.handleAuthAction();
    });
  }

  private async handleAuthAction(): Promise<void> {
    const mode = await this.auth.handleActionCode();
    if (!mode) {
      return;
    }
    if (mode === 'resetPassword') {
      const url = new URL(window.location.href);
      const oobCode = url.searchParams.get('oobCode');
      if (oobCode) {
        await this.router.navigate(['/reset-password'], { queryParams: { oobCode } });
      }
      return;
    }
    // Hard reload after an email action so the refreshed email_verified claim
    // is in place before Firestore opens its listeners.
    window.location.assign(this.auth.user() ? '/warranties' : '/login');
  }
}
