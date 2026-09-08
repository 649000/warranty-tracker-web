import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
  selector: 'app-signup',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    RouterLink,
    SiteHeaderComponent,
    SiteFooterComponent,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './auth-page.css',
})
export class SignupComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);
  private readonly errorReporting = inject(ErrorReportingService);

  readonly loading = signal(false);
  readonly form = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    },
    { validators: [] },
  );

  constructor() {
    afterNextRender(() => redirectIfAuthenticated(this.auth, this.router));
  }

  async signUpWithGoogle(): Promise<void> {
    this.loading.set(true);
    try {
      await this.auth.signInWithGoogle();
      await this.router.navigateByUrl('/warranties');
    } catch (error) {
      this.loading.set(false);
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation: 'signup.signUpWithGoogle' });
      }
      this.snackbar.open(this.auth.errorMessage(error), 'Close', { duration: 5000 });
    }
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.signUpWithEmail(email!, password!);
      this.snackbar.open('Account Created. Please Confirm Your Email.', 'Close', {
        duration: 6000,
      });
      await this.router.navigateByUrl('/warranties');
    } catch (error) {
      this.loading.set(false);
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation: 'signup.submit' });
      }
      this.snackbar.open(this.auth.errorMessage(error), 'Close', { duration: 5000 });
    }
  }
}
