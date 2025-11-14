import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  firstName: string = '';
  lastName: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private auth: Auth,
    private router: Router,
    private userService: UserService
  ) {}

  async register() {
    if (!this.email || !this.password || !this.firstName || !this.lastName) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);

      // Update Firebase profile
      await updateProfile(userCredential.user, {
        displayName: `${this.firstName} ${this.lastName}`
      });

      // Create user in backend
      const userData = {
        firebaseUid: userCredential.user.uid,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName
      };

      this.userService.createUser(userData).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = 'Account created but failed to save profile. Please contact support.';
          console.error('Error creating user in backend:', err);
          this.loading = false;
        }
      });
    } catch (error: any) {
      this.error = this.getErrorMessage(error.code);
      this.loading = false;
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      default:
        return 'An error occurred during registration. Please try again.';
    }
  }
}
