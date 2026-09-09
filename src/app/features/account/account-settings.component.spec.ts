import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountSettingsComponent } from './account-settings.component';
import { AuthService } from '../../core/services/auth.service';
import { ErrorReportingService } from '../../core/services/error-reporting.service';
import { NotificationPreferenceService } from '../../core/services/notification-preference.service';

describe('AccountSettingsComponent', () => {
  let fixture: ComponentFixture<AccountSettingsComponent>;
  let notifications: {
    expiryEmailsEnabled: ReturnType<typeof vi.fn>;
    setExpiryEmailsEnabled: ReturnType<typeof vi.fn>;
  };
  let snackbar: { open: ReturnType<typeof vi.fn> };
  let errorReporting: { captureException: ReturnType<typeof vi.fn> };

  const authUser = {
    uid: 'user-1',
    email: 'me@example.com',
    providerData: [{ providerId: 'password' }],
  };

  beforeEach(async () => {
    notifications = {
      expiryEmailsEnabled: vi.fn(async () => true),
      setExpiryEmailsEnabled: vi.fn(async () => undefined),
    };
    snackbar = { open: vi.fn() };
    errorReporting = { captureException: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AccountSettingsComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            user: signal(authUser),
            emailVerified: signal(true),
            errorMessage: (error: unknown) => String(error),
          },
        },
        { provide: NotificationPreferenceService, useValue: notifications },
        { provide: ErrorReportingService, useValue: errorReporting },
        { provide: MatSnackBar, useValue: snackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function switchElement(): HTMLElement {
    const element = fixture.nativeElement.querySelector('[role="switch"]') as HTMLElement;
    if (!element) {
      throw new Error('Expected an element with role="switch"');
    }
    return element;
  }

  function liveRegion(): string {
    return (
      (
        fixture.nativeElement.querySelector('[role="status"]') as HTMLElement | null
      )?.textContent?.trim() ?? ''
    );
  }

  it('shows an enabled, labeled, natively keyboard-operable switch', () => {
    const element = switchElement();
    expect(element.getAttribute('aria-checked')).toBe('true');
    expect(element.getAttribute('aria-label')).toBe('Expiry email reminders');
    expect(element.tagName).toBe('BUTTON');
    expect(fixture.nativeElement.textContent).toContain('currently on');
  });

  it('disables reminders through the preference service and announces the change', async () => {
    switchElement().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(notifications.setExpiryEmailsEnabled).toHaveBeenCalledWith('user-1', false);
    expect(switchElement().getAttribute('aria-checked')).toBe('false');
    expect(liveRegion()).toContain('disabled');
  });

  it('keeps reminders enabled and reports the error when saving fails', async () => {
    notifications.setExpiryEmailsEnabled.mockRejectedValue(new Error('denied'));

    switchElement().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(switchElement().getAttribute('aria-checked')).toBe('true');
    expect(liveRegion()).toContain('Could not update');
    expect(errorReporting.captureException).toHaveBeenCalled();
  });

  it('announces re-enabling reminders', async () => {
    switchElement().click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(switchElement().getAttribute('aria-checked')).toBe('false');

    switchElement().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(notifications.setExpiryEmailsEnabled).toHaveBeenLastCalledWith('user-1', true);
    expect(liveRegion()).toContain('enabled');
  });
});
