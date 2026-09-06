import { isDevMode, Service } from '@angular/core';
import { captureException, captureMessage } from '@sentry/angular';

/** Optional context attached to a reported error. */
export interface ErrorContext {
  /** The operation that was in progress when the error occurred. */
  operation?: string;
  [key: string]: unknown;
}

@Service()
export class ErrorReportingService {
  /** Reports an exception with optional context; never throws. */
  captureException(error: unknown, context?: ErrorContext): void {
    if (isDevMode()) {
      return;
    }
    try {
      captureException(error, { extra: context });
    } catch {
      // Non-blocking by design.
    }
  }

  /** Reports a plain message; never throws. */
  captureMessage(message: string): void {
    if (isDevMode()) {
      return;
    }
    try {
      captureMessage(message);
    } catch {
      // Non-blocking by design.
    }
  }
}
