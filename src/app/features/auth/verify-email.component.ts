import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { ErrorReportingService } from '../../core/services/error-reporting.service';
import { isExpectedAuthError } from '../../core/utils/auth-errors';
import { SiteHeaderComponent } from '../../shared/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';

@Component({
  selector: 'app-verify-email',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    RouterLink,
    SiteHeaderComponent,
    SiteFooterComponent,
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './auth-page.css',
})
export class VerifyEmailComponent {
  private readonly auth = inject(AuthService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly errorReporting = inject(ErrorReportingService);

  readonly email = computed(() => this.auth.user()?.email ?? '');
  readonly resending = signal(false);
  readonly checking = signal(false);
  readonly status = signal('');

  async resend(): Promise<void> {
    if (this.resending()) {
      return;
    }
    this.resending.set(true);
    try {
      await this.auth.resendVerificationEmail();
      this.status.set('Verification email sent. Check your inbox.');
      this.snackbar.open('Verification email sent.', 'Close', { duration: 5000 });
    } catch (error) {
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation: 'verifyEmail.resend' });
      }
      this.status.set(this.auth.errorMessage(error));
    } finally {
      this.resending.set(false);
    }
  }

  async checkVerified(): Promise<void> {
    if (this.checking()) {
      return;
    }
    this.checking.set(true);
    try {
      const verified = await this.auth.refreshEmailVerification();
      if (verified) {
        // Hard reload so every Firebase SDK re-initializes with the refreshed
        // email_verified claim before Firestore opens its listeners.
        window.location.assign('/warranties');
        return;
      }
      this.status.set('Still not verified. Open the link in your email, then try again.');
    } catch (error) {
      if (!isExpectedAuthError(error)) {
        this.errorReporting.captureException(error, { operation: 'verifyEmail.check' });
      }
      this.status.set(this.auth.errorMessage(error));
    } finally {
      this.checking.set(false);
    }
  }
}
