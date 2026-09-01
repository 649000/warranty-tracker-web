import { Component, computed, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import {
  ProductService,
  type CoverageDraft,
  type ProductDraft,
} from '../../core/services/product.service';
import { ProofStorageService } from '../../core/services/proof-storage.service';
import { CURRENCIES, DURATION_PRESETS, PRODUCT_CATEGORIES } from '../../core/models/catalog';
import {
  DEFAULT_CURRENCY,
  type CoverageScope,
  type CoverageSource,
  type ProofOfPurchase,
} from '../../core/models/warranty.model';
import { ProofInputComponent } from './proof-input.component';

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatCardModule,
    MatSnackBarModule,
    ProofInputComponent,
    TitleCasePipe,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent {
  private readonly auth = inject(AuthService);
  private readonly products = inject(ProductService);
  private readonly proofs = inject(ProofStorageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);

  readonly categories = PRODUCT_CATEGORIES;
  readonly currencies = CURRENCIES;
  readonly durationPresets = DURATION_PRESETS;
  readonly coverageSources: CoverageSource[] = [
    'manufacturer',
    'retailer',
    'international',
    'other',
  ];

  readonly productId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly isEdit = computed(() => this.productId() !== null);
  readonly saving = signal(false);
  readonly showMore = signal(false);

  readonly proofModel = signal<ProofOfPurchase | null>(null);
  readonly proofFile = signal<File | null>(null);
  private originalProof: ProofOfPurchase | null = null;

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    category: new FormControl<string>(''),
    purchaseDate: new FormControl<Date>(new Date(), [Validators.required]),
    brand: new FormControl(''),
    serialNumber: new FormControl(''),
    retailer: new FormControl(''),
    priceAmount: new FormControl<number | null>(null),
    currency: new FormControl<string>(DEFAULT_CURRENCY),
    source: new FormControl<CoverageSource>('manufacturer', [Validators.required]),
    scope: new FormControl<CoverageScope>('local', [Validators.required]),
    duration: new FormControl<string>('12', [Validators.required]),
    customMonths: new FormControl<number | null>(null),
    manualExpiry: new FormControl<Date | null>(null),
    hotline: new FormControl(''),
    contactEmail: new FormControl(''),
    contactUrl: new FormControl(''),
    notes: new FormControl(''),
  });

  constructor() {
    if (this.isEdit()) {
      this.loadExisting();
    }
  }

  private async loadExisting(): Promise<void> {
    const id = this.productId()!;
    const user = this.auth.user();
    if (user) {
      this.products.watch(user.uid);
    }
    const product = await this.products.getProduct(user!.uid, id);
    if (!product) {
      this.snackbar.open('Product not found.', 'Close', { duration: 4000 });
      await this.router.navigateByUrl('/warranties');
      return;
    }
    this.form.patchValue({
      name: product.name,
      category: product.category ?? '',
      purchaseDate: product.purchaseDate,
      brand: product.brand ?? '',
      serialNumber: product.serialNumber ?? '',
      retailer: product.retailer ?? '',
      priceAmount: product.price?.amount ?? null,
      currency: product.price?.currency ?? DEFAULT_CURRENCY,
    });
    this.originalProof = product.proofOfPurchase ?? null;
    this.proofModel.set(product.proofOfPurchase ?? null);
  }

  onSourceSelected(source: CoverageSource): void {
    this.form.patchValue({ source });
    if (source === 'retailer') {
      this.form.patchValue({ scope: 'local' });
    }
  }

  onDurationSelected(duration: string): void {
    this.form.patchValue({ duration });
  }

  private buildProductDraft(): ProductDraft {
    const v = this.form.getRawValue();
    const priceAmount = v.priceAmount;
    return {
      name: v.name!,
      category: v.category || undefined,
      purchaseDate: v.purchaseDate!,
      brand: v.brand || undefined,
      serialNumber: v.serialNumber || undefined,
      retailer: v.retailer || undefined,
      price:
        priceAmount != null
          ? { amount: Number(priceAmount), currency: v.currency ?? DEFAULT_CURRENCY }
          : undefined,
    };
  }

  private buildCoverageDraft(): CoverageDraft {
    const v = this.form.getRawValue();
    const preset = DURATION_PRESETS.find((p) => p.label === v.duration);
    const duration: CoverageDraft['duration'] = preset
      ? preset.lifetime
        ? { lifetime: true }
        : { months: preset.months }
      : { months: v.customMonths ?? 12 };
    const contact =
      v.hotline || v.contactEmail || v.contactUrl
        ? {
            hotline: v.hotline || undefined,
            email: v.contactEmail || undefined,
            url: v.contactUrl || undefined,
          }
        : undefined;
    const manualExpiry = v.manualExpiry ?? null;
    return {
      source: v.source!,
      scope: v.scope!,
      duration,
      startDate: v.purchaseDate!,
      expiryDate: manualExpiry,
      manualExpiry: manualExpiry !== null,
      contact,
      notes: v.notes || undefined,
    };
  }

  async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.coverageInvalid()) {
      return;
    }
    this.saving.set(true);
    const user = this.auth.user();
    if (!user) {
      this.saving.set(false);
      return;
    }
    try {
      const productDraft = this.buildProductDraft();
      let productId = this.productId();
      if (productId) {
        await this.products.updateProduct(user.uid, productId, productDraft);
      } else {
        productId = await this.products.addProduct(user.uid, productDraft, [
          this.buildCoverageDraft(),
        ]);
      }
      await this.persistProof(productId, user.uid);
      await this.router.navigate(['/warranties', productId]);
    } catch {
      this.saving.set(false);
      this.snackbar.open('Could not save. Please try again.', 'Close', { duration: 5000 });
    }
  }

  coverageInvalid(): boolean {
    if (this.isEdit()) {
      return false;
    }
    const duration = this.form.getRawValue().duration;
    if (duration === 'Custom') {
      const months = this.form.getRawValue().customMonths;
      return months == null || Number(months) <= 0;
    }
    return false;
  }

  private async persistProof(productId: string, uid: string): Promise<void> {
    const next = this.proofModel();
    const prev = this.originalProof;

    if (!next) {
      if (prev?.storagePath) {
        await this.proofs.deleteProof(prev.storagePath);
      }
      if (prev) {
        await this.products.setProofOfPurchase(uid, productId, null);
      }
      return;
    }

    if (next.type === 'text') {
      if (prev?.storagePath) {
        await this.proofs.deleteProof(prev.storagePath);
      }
      await this.products.setProofOfPurchase(uid, productId, { type: 'text', text: next.text });
      return;
    }

    // Image or PDF.
    if (next.storagePath) {
      // Already uploaded and unchanged.
      return;
    }

    const file = this.proofFile();
    if (!file) {
      return;
    }
    if (prev?.storagePath) {
      await this.proofs.deleteProof(prev.storagePath);
    }
    const result = await this.proofs.uploadProof(uid, productId, file, next.type);
    await this.products.setProofOfPurchase(uid, productId, {
      type: next.type,
      storagePath: result.storagePath,
      fileName: result.fileName,
      contentType: result.contentType,
    });
  }
}
