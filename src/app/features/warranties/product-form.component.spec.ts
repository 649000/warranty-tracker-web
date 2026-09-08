import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { ProofStorageService } from '../../core/services/proof-storage.service';
import { ProductFormComponent, type ProductFormModel } from './product-form.component';

const BASE_MODEL: ProductFormModel = {
  name: 'My Fridge',
  category: 'Appliances',
  purchaseDate: new Date(2024, 0, 15),
  brand: '',
  serialNumber: '',
  retailer: '',
  priceAmount: null,
  currency: 'SGD',
  source: 'manufacturer',
  scope: 'local',
  duration: '12',
  customMonths: null,
  manualExpiry: null,
};

function setup() {
  TestBed.configureTestingModule({
    imports: [ProductFormComponent],
    providers: [
      { provide: AuthService, useValue: { user: signal(null) } },
      { provide: ProductService, useValue: {} },
      { provide: ProofStorageService, useValue: {} },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: { get: () => null } } },
      },
    ],
  });
  const fixture = TestBed.createComponent(ProductFormComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('ProductFormComponent', () => {
  it('is invalid without a name and category', () => {
    const { component } = setup();
    expect(component.productForm().invalid()).toBe(true);
  });

  it('becomes valid once required fields are filled', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL });
    expect(component.productForm().valid()).toBe(true);
  });

  it('rejects an empty category', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL, category: '' });
    expect(component.productForm().invalid()).toBe(true);
  });

  it('renders a mat-error for an empty touched category', () => {
    const { fixture, component } = setup();
    component.model.set({ ...BASE_MODEL, category: '' });
    component.productForm.category().markAsTouched();
    fixture.detectChanges();
    const errors = Array.from(fixture.nativeElement.querySelectorAll('mat-error'));
    expect(errors.map((e) => (e as HTMLElement).textContent?.trim())).toContain(
      'Select a Category',
    );
  });

  it('renders a mat-error for a touched price with too many decimals', () => {
    const { fixture, component } = setup();
    component.model.set({ ...BASE_MODEL, priceAmount: 0.00099 });
    fixture.detectChanges();
    component.productForm.priceAmount().markAsTouched();
    fixture.detectChanges();
    const errors = Array.from(fixture.nativeElement.querySelectorAll('mat-error'));
    expect(errors.map((e) => (e as HTMLElement).textContent?.trim())).toContain(
      'Price Can Have at Most 2 Decimal Places',
    );
  });

  it('rejects a price with more than two decimal places', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL, priceAmount: 0.00099 });
    expect(component.productForm().invalid()).toBe(true);
  });

  it('rejects a zero or negative price', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL, priceAmount: 0 });
    expect(component.productForm().invalid()).toBe(true);
    component.model.set({ ...BASE_MODEL, priceAmount: -5 });
    expect(component.productForm().invalid()).toBe(true);
  });

  it('accepts a valid positive price', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL, priceAmount: 1299.99 });
    expect(component.productForm().valid()).toBe(true);
  });

  it('flags a missing custom-months count for Custom duration', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL, duration: 'Custom', customMonths: null });
    expect(component.productForm().invalid()).toBe(true);
  });

  it('accepts a valid Custom months count', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL, duration: 'Custom', customMonths: 18 });
    expect(component.productForm().valid()).toBe(true);
  });

  it('filters brand suggestions based on the typed query', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL, brand: 'sam', category: '' });
    const names = component.filteredBrands();
    expect(names).toContain('Samsung');
  });

  it('ranks category-affiliated brands first for autocomplete', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL, brand: 's', category: 'Computers' });
    const names = component.filteredBrands();
    const asusIdx = names.indexOf('Asus');
    const samsungIdx = names.indexOf('Samsung');
    expect(asusIdx).toBeGreaterThanOrEqual(0);
    expect(samsungIdx).toBeGreaterThanOrEqual(0);
    expect(asusIdx).toBeLessThan(samsungIdx);
  });

  it('filters retailer suggestions based on the typed query', () => {
    const { component } = setup();
    component.model.set({ ...BASE_MODEL, retailer: 'courts' });
    expect(component.filteredRetailers()).toContain('Courts');
  });
});
