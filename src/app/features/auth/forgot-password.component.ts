import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { redirectIfAuthenticated } from '../../core/guards/auth.guard';
import { ErrorReportingService } from '../../core/services/error-reporting.service';
import { isExpectedAuthError } from '../../core/utils/auth-errors';

import { SiteHeaderComponent } from '../../shared/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    RouterLink,
    SiteHeaderComponent,
    SiteFooterComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './auth-page.css',
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);
  private readonly errorReporting = inject(ErrorReportingService);

  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor() {
    afterNextRender(() => redirectIfAuthenticated(this.auth, this.router));
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    const email = this.form.getRawValue().email ?? '';
    try {
      await this.auth.sendPasswordReset(email);
      this.sent.set(true);
    } catch (error) {
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation: 'forgotPassword.submit' });
      }
      this.snackbar.open(this.auth.errorMessage(error), 'Close', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}
