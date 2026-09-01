import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protects the private area. Waits for the first auth emission so a signed-in
 * user is never bounced to sign-in while auth restores, then redirects
 * anonymous visitors to /login remembering their intended destination.
 */
export const authGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.readyPromise;
  if (auth.user()) {
    return true;
  }
  const attempted = router.getCurrentNavigation()?.extractedUrl.toString() ?? '';
  auth.setReturnUrl(attempted && attempted !== '/' ? attempted : '');
  return router.createUrlTree(['/login']);
};

/**
 * Keeps signed-in users off the auth pages (login/signup/etc.).
 */
export const guestGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.readyPromise;
  return auth.user() ? router.createUrlTree(['/warranties']) : true;
};
