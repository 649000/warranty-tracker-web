import { inject, Service } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { logEvent } from 'firebase/analytics';
import { filter } from 'rxjs';
import { ANALYTICS } from '../firebase/firebase.providers';

@Service()
export class AnalyticsService {
  private readonly analytics = inject(ANALYTICS);
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.log('page_view', { page_path: event.urlAfterRedirects }));
  }

  /** Records an event; analytics failures never surface or block the user. */
  log(name: string, params?: Record<string, unknown>): void {
    if (!this.analytics) {
      return;
    }
    try {
      logEvent(this.analytics, name, params);
    } catch {
      // Non-blocking by design.
    }
  }
}
