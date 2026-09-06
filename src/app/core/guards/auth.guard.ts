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
 * Keeps the auth pages (login/signup/etc.) reachable for everyone. Signed-in
 * users are redirected off these pages by `redirectIfAuthenticated` (run by
 * each auth-page component), not here, to avoid an endless guard redirect loop.
 */
export const guestGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  await auth.readyPromise;
  return true;
};

/**
 * Redirects a signed-in user to the warranty list; a no-op for guests. Called
 * by the auth-page components after first render, so the "already signed in"
 * redirect never re-enters the router's matching phase.
 */
export function redirectIfAuthenticated(auth: AuthService, router: Router): void {
  if (auth.user()) {
    void router.navigateByUrl('/warranties');
  }
}
