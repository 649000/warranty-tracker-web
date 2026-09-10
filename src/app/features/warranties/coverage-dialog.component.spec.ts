import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, expect, it, vi } from 'vitest';
import type { Coverage } from '../../core/models/warranty.model';
import { CoverageDialogComponent, type CoverageDialogData } from './coverage-dialog.component';

const SUGGESTED = {
  hotline: '+65 1800 123 4567',
  email: 'support@apple.com',
  url: 'https://support.apple.com',
};

const EXISTING_COVERAGE: Coverage = {
  id: 'c1',
  source: 'manufacturer',
  scope: 'local',
  duration: { months: 12 },
  startDate: new Date(2024, 0, 1),
  expiryDate: new Date(2025, 0, 1),
  manualExpiry: false,
  contact: { email: 'me@example.com' },
};

function setup(overrides: Partial<CoverageDialogData> = {}) {
  const dialogRef = { close: vi.fn() };
  TestBed.configureTestingModule({
    imports: [CoverageDialogComponent],
    providers: [
      { provide: MatDialogRef, useValue: dialogRef },
      {
        provide: MAT_DIALOG_DATA,
        useValue: { startDate: new Date(2024, 0, 1), ...overrides },
      },
    ],
  });
  const fixture = TestBed.createComponent(CoverageDialogComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, dialogRef };
}

describe('CoverageDialogComponent', () => {
  it('accepts a new coverage with default fields', () => {
    const { component } = setup();
    expect(component.dialogForm().valid()).toBe(true);
  });

  it('flags a Custom duration with no months as invalid', () => {
    const { component } = setup();
    component.model.set({
      ...component.model(),
      duration: 'Custom',
      customMonths: null,
    });
    expect(component.dialogForm().invalid()).toBe(true);
  });

  it('accepts a positive integer number of months for Custom', () => {
    const { component } = setup();
    component.model.set({
      ...component.model(),
      duration: 'Custom',
      customMonths: 24,
    });
    expect(component.dialogForm().valid()).toBe(true);
  });

  it('rejects an invalid contact email', () => {
    const { component } = setup();
    component.model.update((m) => ({ ...m, contactEmail: 'not-an-email' }));
    expect(component.dialogForm().invalid()).toBe(true);
  });

  it('renders a mat-error for an invalid touched email', () => {
    const { fixture, component } = setup();
    component.model.update((m) => ({ ...m, contactEmail: 'not-an-email' }));
    component.dialogForm.contactEmail().markAsTouched();
    fixture.detectChanges();
    const errors = Array.from(fixture.nativeElement.querySelectorAll('mat-error'));
    expect(errors.map((e) => (e as HTMLElement).textContent?.trim())).toContain(
      'Enter a Valid Email',
    );
  });

  it('rejects an invalid contact URL', () => {
    const { component } = setup();
    component.model.update((m) => ({ ...m, contactUrl: 'apple.com' }));
    expect(component.dialogForm().invalid()).toBe(true);
  });

  it('accepts valid contact email and URL', () => {
    const { component } = setup();
    component.model.update((m) => ({
      ...m,
      contactEmail: 'support@sony.com.sg',
      contactUrl: 'https://www.sony.com.sg',
    }));
    expect(component.dialogForm().valid()).toBe(true);
  });

  it('does not close the dialog when saving an invalid coverage', () => {
    const { component, dialogRef } = setup();
    component.model.update((m) => ({ ...m, contactEmail: 'nope' }));
    component.save();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes with a draft when saving a valid coverage', async () => {
    const { component, dialogRef } = setup();
    component.model.set({
      source: 'retailer',
      scope: 'local',
      duration: '2 Years',
      customMonths: null,
      manualExpiry: null,
      hotline: '',
      contactEmail: '',
      contactUrl: '',
      notes: '',
    });
    await component.save();
    expect(dialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'retailer',
        duration: { months: 24 },
        manualExpiry: false,
      }),
    );
  });

  it('blocks an expiry date before the coverage start', () => {
    const { component } = setup();
    component.model.update((m) => ({
      ...m,
      manualExpiry: new Date(2023, 11, 31),
    }));
    expect(component.dialogForm().invalid()).toBe(true);
  });

  it('prefills contact fields from the directory suggestion', () => {
    const { component } = setup({ suggestedContact: SUGGESTED });
    expect(component.model().hotline).toBe(SUGGESTED.hotline);
    expect(component.model().contactEmail).toBe(SUGGESTED.email);
    expect(component.model().contactUrl).toBe(SUGGESTED.url);
  });

  it('does not store an untouched directory prefill', async () => {
    const { component, dialogRef } = setup({ suggestedContact: SUGGESTED });
    await component.save();
    expect(dialogRef.close).toHaveBeenCalledWith(expect.objectContaining({ contact: undefined }));
  });

  it('stores contact the user edits over the suggestion', async () => {
    const { component, dialogRef } = setup({ suggestedContact: SUGGESTED });
    component.model.update((m) => ({ ...m, contactEmail: 'me@example.com' }));
    await component.save();
    expect(dialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({ contact: expect.objectContaining({ email: 'me@example.com' }) }),
    );
  });

  it('keeps an existing user contact over the suggestion when editing', () => {
    const { component } = setup({
      coverage: EXISTING_COVERAGE,
      suggestedContact: SUGGESTED,
    });
    expect(component.model().contactEmail).toBe('me@example.com');
    expect(component.model().contactUrl).toBe('');
  });

  it('keeps a stored user contact on save when editing', async () => {
    const { component, dialogRef } = setup({
      coverage: EXISTING_COVERAGE,
      suggestedContact: SUGGESTED,
    });
    await component.save();
    expect(dialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({ contact: expect.objectContaining({ email: 'me@example.com' }) }),
    );
  });
});
