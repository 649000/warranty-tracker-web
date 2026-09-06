import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  isDevMode: vi.fn(() => true),
}));

vi.mock('@sentry/angular', () => ({
  captureException: mocks.captureException,
  captureMessage: mocks.captureMessage,
}));

vi.mock('@angular/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@angular/core')>();
  return Object.assign({}, actual, { isDevMode: mocks.isDevMode });
});

import { ErrorReportingService } from './error-reporting.service';

describe('ErrorReportingService', () => {
  let service: ErrorReportingService;

  beforeEach(() => {
    mocks.captureException.mockReset();
    mocks.captureMessage.mockReset();
    mocks.isDevMode.mockReturnValue(true);
    service = new ErrorReportingService();
  });

  it('does not report in development mode', () => {
    mocks.isDevMode.mockReturnValue(true);
    service.captureException(new Error('boom'), { operation: 'addProduct' });
    service.captureMessage('proof upload failed');
    expect(mocks.captureException).not.toHaveBeenCalled();
    expect(mocks.captureMessage).not.toHaveBeenCalled();
  });

  it('reports exceptions with context in production', () => {
    mocks.isDevMode.mockReturnValue(false);
    const error = new Error('boom');
    service.captureException(error, { operation: 'addProduct' });
    expect(mocks.captureException).toHaveBeenCalledWith(error, { extra: { operation: 'addProduct' } });
  });

  it('reports messages in production', () => {
    mocks.isDevMode.mockReturnValue(false);
    service.captureMessage('proof upload failed');
    expect(mocks.captureMessage).toHaveBeenCalledWith('proof upload failed');
  });

  it('never throws when reporting fails', () => {
    mocks.isDevMode.mockReturnValue(false);
    mocks.captureException.mockImplementation(() => {
      throw new Error('sentry down');
    });
    expect(() => service.captureException(new Error('boom'))).not.toThrow();
  });
});
