import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { isExpectedAuthError } from '../../core/utils/auth-errors';
import { ErrorReportingService } from '../../core/services/error-reporting.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-account-settings',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './account-settings.component.html',
  styleUrl: '../auth/auth-page.css',
})
export class AccountSettingsComponent {
  private readonly auth = inject(AuthService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly errorReporting = inject(ErrorReportingService);

  readonly user = this.auth.user;
  readonly emailVerified = this.auth.emailVerified;
  readonly hasPasswordProvider = computed(() => {
    const user = this.auth.user();
    if (!user) {
      return false;
    }
    return user.providerData.some((p) => p.providerId === 'password');
  });

  readonly emailLoading = signal(false);
  readonly passwordLoading = signal(false);

  readonly emailForm = new FormGroup({
    newEmail: new FormControl('', [Validators.required, Validators.email]),
    currentPassword: new FormControl('', [Validators.required]),
  });

  readonly passwordForm = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator },
  );

  async changeEmail(): Promise<void> {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) {
      return;
    }
    this.emailLoading.set(true);
    const { newEmail, currentPassword } = this.emailForm.getRawValue();
    try {
      await this.auth.changeEmail(newEmail!, currentPassword!);
      this.snackbar.open(
        'Verification email sent to your new address. It will take effect after you confirm.',
        'Close',
        { duration: 8000 },
      );
      this.emailForm.reset();
    } catch (error) {
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation: 'accountSettings.changeEmail' });
      }
      this.snackbar.open(this.auth.errorMessage(error), 'Close', { duration: 5000 });
    } finally {
      this.emailLoading.set(false);
    }
  }

  async updatePassword(): Promise<void> {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) {
      return;
    }
    this.passwordLoading.set(true);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    try {
      await this.auth.updatePassword(currentPassword!, newPassword!);
      this.snackbar.open('Password updated successfully.', 'Close', { duration: 5000 });
      this.passwordForm.reset();
    } catch (error) {
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, {
          operation: 'accountSettings.updatePassword',
        });
      }
      this.snackbar.open(this.auth.errorMessage(error), 'Close', { duration: 5000 });
    } finally {
      this.passwordLoading.set(false);
    }
  }
}
