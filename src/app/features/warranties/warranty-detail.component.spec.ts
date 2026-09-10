import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { ClaimDirectoryService } from '../../core/services/claim-directory.service';
import { ProductService } from '../../core/services/product.service';
import { ProofStorageService } from '../../core/services/proof-storage.service';
import type { ClaimContact } from '../../core/models/claim-contact.model';
import type { Coverage, Product } from '../../core/models/warranty.model';
import { WarrantyDetailComponent } from './warranty-detail.component';

const PRODUCT: Product = {
  id: 'p1',
  name: 'MacBook Pro',
  category: 'Computers',
  brand: 'Apple',
  purchaseDate: new Date(2024, 0, 1),
  ownerId: 'u1',
};

const SUGGESTED_ENTRY: ClaimContact = {
  type: 'manufacturer',
  name: 'Apple',
  matchKeys: ['apple'],
  url: 'https://support.apple.com',
  hotline: '+65 1800 123 4567',
  email: 'support@apple.com',
  claimSteps: ['Find your serial number', 'Book a service appointment'],
  serviceCenterUrl: 'https://support.apple.com/service',
  registrationUrl: 'https://support.apple.com/register',
};

const COVERAGE: Coverage = {
  id: 'c1',
  source: 'manufacturer',
  scope: 'local',
  duration: { months: 12 },
  startDate: new Date(2024, 0, 1),
  expiryDate: new Date(2025, 0, 1),
  manualExpiry: false,
};

function setup(resolveResult: unknown, coverages: Coverage[] = [COVERAGE]) {
  const products = {
    watch: vi.fn(),
    getProduct: vi.fn().mockResolvedValue(PRODUCT),
    coveragesFor: vi.fn().mockReturnValue(coverages),
    clearCoverageContact: vi.fn().mockResolvedValue(undefined),
    coverages: signal(new Map()),
  };
  const directory = {
    ensureLoaded: vi.fn().mockResolvedValue(undefined),
    findEntry: vi.fn().mockReturnValue(SUGGESTED_ENTRY),
    resolve: vi.fn().mockReturnValue(resolveResult),
    entries: signal([]),
    loaded: signal(true),
  };
  TestBed.configureTestingModule({
    imports: [WarrantyDetailComponent],
    providers: [
      { provide: AuthService, useValue: { user: signal({ uid: 'u1' }) } },
      { provide: ProductService, useValue: products },
      { provide: ClaimDirectoryService, useValue: directory },
      { provide: ProofStorageService, useValue: {} },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      { provide: MatDialog, useValue: { open: vi.fn() } },
      { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'p1' } } } },
    ],
  });
  const fixture = TestBed.createComponent(WarrantyDetailComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, products, directory };
}

describe('WarrantyDetailComponent claim panel', () => {
  it('shows suggested claim information for a matching coverage', async () => {
    const { fixture, component } = setup({ status: 'suggested', entry: SUGGESTED_ENTRY });
    await fixture.whenStable();
    component.toggleExpand('c1');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('How to Claim');
    expect(text).toContain('Suggested');
    expect(text).toContain('Find your serial number');
    expect(text).toContain('Find a Service Centre');
    expect(text).toContain('Register Your Product');
  });

  it('offers reset and shows the user contact when overridden', async () => {
    const { fixture, component } = setup({
      status: 'user',
      userContact: { email: 'me@example.com' },
      entry: SUGGESTED_ENTRY,
    });
    await fixture.whenStable();
    component.toggleExpand('c1');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Your Contact');
    expect(text).toContain('me@example.com');
    const reset = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Reset to Suggested'));
    expect(reset).toBeTruthy();
  });

  it('clears the override when reset is activated', async () => {
    const { fixture, component, products } = setup({
      status: 'user',
      userContact: { email: 'me@example.com' },
      entry: SUGGESTED_ENTRY,
    });
    await fixture.whenStable();
    component.toggleExpand('c1');
    fixture.detectChanges();
    await component.resetContact(COVERAGE);
    expect(products.clearCoverageContact).toHaveBeenCalledWith('u1', 'p1', 'c1');
  });

  it('does not offer reset without an override', async () => {
    const { fixture, component } = setup({ status: 'suggested', entry: SUGGESTED_ENTRY });
    await fixture.whenStable();
    component.toggleExpand('c1');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Reset to Suggested');
  });

  it('shows no claim block when nothing matches', async () => {
    const { fixture, component } = setup({ status: 'none' });
    await fixture.whenStable();
    component.toggleExpand('c1');
    fixture.detectChanges();
    const block = (fixture.nativeElement as HTMLElement).querySelector('.claim-block');
    expect(block).toBeNull();
  });
});

describe('WarrantyDetailComponent coverage guidance', () => {
  it('returns guidance covering the covered, excluded, and varies cases', async () => {
    const { fixture, component } = setup({ status: 'suggested', entry: SUGGESTED_ENTRY });
    await fixture.whenStable();
    const guidance = component.coverageGuidance(COVERAGE);
    expect(guidance).not.toBeNull();
    const verdicts = guidance!.scenarios.map((scenario) => scenario.verdict);
    expect(verdicts).toContain('covered');
    expect(verdicts).toContain('excluded');
    expect(verdicts).toContain('varies');
  });

  it('uses the resolved claim URL as the official terms link', async () => {
    const { fixture, component } = setup({ status: 'suggested', entry: SUGGESTED_ENTRY });
    await fixture.whenStable();
    expect(component.coverageGuidance(COVERAGE)?.termsUrl).toBe('https://support.apple.com');
  });

  it('omits the official terms link when no URL is available', async () => {
    const { fixture, component } = setup({ status: 'none' });
    await fixture.whenStable();
    expect(component.coverageGuidance(COVERAGE)?.termsUrl).toBeUndefined();
  });

  it('returns no guidance for a missing coverage', async () => {
    const { fixture, component } = setup({ status: 'none' });
    await fixture.whenStable();
    expect(component.coverageGuidance(null)).toBeNull();
    expect(component.coverageGuidance(undefined)).toBeNull();
  });

  it('renders the guidance block for an expanded coverage', async () => {
    const { fixture, component } = setup({ status: 'suggested', entry: SUGGESTED_ENTRY });
    await fixture.whenStable();
    component.toggleExpand('c1');
    fixture.detectChanges();
    const block = (fixture.nativeElement as HTMLElement).querySelector('.guidance-block');
    expect(block).toBeTruthy();
    const text = block!.textContent ?? '';
    expect(text).toContain("What's Typically Covered");
    expect(text).toContain('Typically Covered');
    expect(text).toContain('Typically Excluded');
    expect(text).toContain('Varies');
    expect(text).toContain('consumer law');
    expect(text).toContain('Battery and display faults');
    expect(text).toContain('General guidance only');
    const link = block!.querySelector('.guidance-block__link');
    expect(link?.getAttribute('href')).toBe('https://support.apple.com');
  });

  it('renders the panel without a guidance block when there are no coverages', async () => {
    const { fixture } = setup({ status: 'none' }, []);
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.guidance-block')).toBeNull();
    expect(el.textContent).toContain('No coverage yet');
  });
});
