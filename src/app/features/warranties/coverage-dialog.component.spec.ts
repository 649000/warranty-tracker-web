import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, expect, it, vi } from 'vitest';
import { CoverageDialogComponent, type CoverageDialogData } from './coverage-dialog.component';

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
});
