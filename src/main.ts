import { bootstrapApplication } from '@angular/platform-browser';
import { isDevMode } from '@angular/core';
import { captureConsoleIntegration, init } from '@sentry/angular';
import { sentryDsn } from '@env/environment';
import { appConfig } from './app/app.config';
import { App } from './app/app';

init({
  dsn: sentryDsn,
  enabled: !isDevMode() && sentryDsn.length > 0,
  integrations: [captureConsoleIntegration({ levels: ['error', 'warn'] })],
});

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
