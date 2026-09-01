import { Component, afterNextRender, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './core/services/auth.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `<router-outlet />`,
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);

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
    if (mode === 'verifyEmail') {
      this.snackbar.open('Email confirmed. Thanks!', 'Close', { duration: 5000 });
    } else if (mode === 'recoverEmail') {
      this.snackbar.open('Email updated.', 'Close', { duration: 5000 });
    }
    await this.router.navigateByUrl(this.auth.user() ? '/warranties' : '/login');
  }
}
