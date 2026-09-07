import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { redirectIfAuthenticated } from '../../core/guards/auth.guard';
import { ErrorReportingService } from '../../core/services/error-reporting.service';
import { isExpectedAuthError } from '../../core/utils/auth-errors';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './auth-page.css',
})
export class ResetPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);
  private readonly errorReporting = inject(ErrorReportingService);

  readonly loading = signal(false);
  private readonly oobCode = this.route.snapshot.queryParamMap.get('oobCode') ?? '';

  readonly form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor() {
    afterNextRender(() => redirectIfAuthenticated(this.auth, this.router));
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.oobCode) {
      return;
    }
    this.loading.set(true);
    const password = this.form.getRawValue().password ?? '';
    try {
      await this.auth.confirmPasswordReset(this.oobCode, password);
      this.snackbar.open('Password Updated. You Can Now Sign In.', 'Close', { duration: 5000 });
      await this.router.navigateByUrl('/login');
    } catch (error) {
      this.loading.set(false);
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation: 'resetPassword.submit' });
      }
      this.snackbar.open(this.auth.errorMessage(error), 'Close', { duration: 5000 });
    }
  }
}
