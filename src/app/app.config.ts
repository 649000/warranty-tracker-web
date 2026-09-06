import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { createErrorHandler } from '@sentry/angular';
import { routes } from './app.routes';
import { firebaseProviders } from './core/firebase/firebase.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useValue: createErrorHandler() },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    ...firebaseProviders,
  ],
};
