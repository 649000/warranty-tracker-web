import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    canMatch: [guestGuard],
    loadComponent: () => import('./features/auth/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'forgot-password',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./features/auth/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/legal/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: 'warranties',
    canMatch: [authGuard],
    loadComponent: () => import('./shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/warranties/warranty-list.component').then(
            (m) => m.WarrantyListComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/warranties/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/warranties/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/warranties/warranty-detail.component').then(
            (m) => m.WarrantyDetailComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
