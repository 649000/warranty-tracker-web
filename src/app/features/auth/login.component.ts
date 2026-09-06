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

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './auth-page.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);
  private readonly errorReporting = inject(ErrorReportingService);

  readonly loading = signal(false);
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor() {
    afterNextRender(() => redirectIfAuthenticated(this.auth, this.router));
  }

  async signInWithGoogle(): Promise<void> {
    this.loading.set(true);
    try {
      await this.auth.signInWithGoogle();
    } catch (error) {
      this.loading.set(false);
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation: 'login.signInWithGoogle' });
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
      await this.auth.signInWithEmail(email!, password!);
      await this.auth.redirectAfterAuth();
    } catch (error) {
      this.loading.set(false);
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation: 'login.submit' });
      }
      this.snackbar.open(this.auth.errorMessage(error), 'Close', { duration: 5000 });
    }
  }
}
