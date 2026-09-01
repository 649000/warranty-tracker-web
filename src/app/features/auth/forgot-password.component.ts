import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

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
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './auth-page.css',
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly snackbar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

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
      this.snackbar.open(this.auth.errorMessage(error), 'Close', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}
