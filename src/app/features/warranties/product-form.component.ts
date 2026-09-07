import { Component, computed, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { form, FormField, required, submit, validate } from '@angular/forms/signals';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import {
  ProductService,
  type CoverageDraft,
  type ProductDraft,
} from '../../core/services/product.service';
import { ProofStorageService } from '../../core/services/proof-storage.service';
import {
  CURRENCIES,
  DURATION_PRESETS,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from '../../core/models/catalog';
import {
  DEFAULT_CURRENCY,
  type CoverageScope,
  type CoverageSource,
  type ProofOfPurchase,
} from '../../core/models/warranty.model';
import { ProofInputComponent } from './proof-input.component';
import {
  customMonthsError,
  filterBrands,
  filterRetailers,
  priceError,
} from '../../core/utils/validation';

export interface ProductFormModel {
  name: string;
  category: ProductCategory | '';
  purchaseDate: Date;
  brand: string;
  serialNumber: string;
  retailer: string;
  priceAmount: number | null;
  currency: string;
  source: CoverageSource;
  scope: CoverageScope;
  duration: string;
  customMonths: number | null;
  manualExpiry: Date | null;
}

@Component({
  selector: 'app-product-form',
  imports: [
    FormField,
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
    MatAutocompleteModule,
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

  readonly model = signal<ProductFormModel>({
    name: '',
    category: '',
    purchaseDate: new Date(),
    brand: '',
    serialNumber: '',
    retailer: '',
    priceAmount: null,
    currency: DEFAULT_CURRENCY,
    source: 'manufacturer',
    scope: 'local',
    duration: '12',
    customMonths: null,
    manualExpiry: null,
  });

  readonly productForm = form(this.model, (s) => {
    required(s.name, { message: 'Name Is Required' });
    required(s.category, { message: 'Select a Category' });
    required(s.purchaseDate, { message: 'Select a Purchase Date' });
    required(s.source, { message: 'Select a Coverage Source' });
    required(s.scope, { message: 'Select a Coverage Scope' });
    required(s.duration, { message: 'Select a Duration' });

    validate(s.priceAmount, ({ value }) => priceError(value()));

    validate(s.customMonths, ({ value, valueOf }) => {
      if (valueOf(s.duration) !== 'Custom') {
        return undefined;
      }
      return customMonthsError(value());
    });

    validate(s.manualExpiry, ({ value, valueOf }) => {
      const expiry = value();
      if (!expiry) {
        return undefined;
      }
      const purchase = valueOf(s.purchaseDate);
      if (purchase && expiry.getTime() < purchase.getTime()) {
        return {
          kind: 'expiryBeforePurchase',
          message: 'Expiry Date Cannot Be Before the Purchase Date',
        };
      }
      return undefined;
    });
  });

  readonly filteredBrands = computed(() =>
    filterBrands(
      this.productForm.brand().controlValue(),
      this.productForm.category().controlValue(),
    ),
  );

  readonly filteredRetailers = computed(() =>
    filterRetailers(this.productForm.retailer().controlValue()),
  );

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
      this.snackbar.open('Product Not Found.', 'Close', { duration: 4000 });
      await this.router.navigateByUrl('/warranties');
      return;
    }
    this.model.set({
      name: product.name,
      category: (product.category as ProductCategory | undefined) ?? '',
      purchaseDate: product.purchaseDate,
      brand: product.brand ?? '',
      serialNumber: product.serialNumber ?? '',
      retailer: product.retailer ?? '',
      priceAmount: product.price?.amount ?? null,
      currency: product.price?.currency ?? DEFAULT_CURRENCY,
      source: 'manufacturer',
      scope: 'local',
      duration: '12',
      customMonths: null,
      manualExpiry: null,
    });
    this.originalProof = product.proofOfPurchase ?? null;
    this.proofModel.set(product.proofOfPurchase ?? null);
  }

  onSourceSelected(source: CoverageSource): void {
    this.model.update((m) => ({
      ...m,
      source,
      scope: source === 'retailer' ? 'local' : m.scope,
    }));
  }

  onScopeSelected(scope: CoverageScope): void {
    this.model.update((m) => ({ ...m, scope }));
  }

  onDurationSelected(duration: string): void {
    this.model.update((m) => ({ ...m, duration }));
  }

  clearField(field: 'brand' | 'retailer'): void {
    this.model.update((m) => ({ ...m, [field]: '' }));
  }

  onBrandSelected(brand: string): void {
    this.model.update((m) => ({ ...m, brand }));
  }

  onRetailerSelected(retailer: string): void {
    this.model.update((m) => ({ ...m, retailer }));
  }

  private buildProductDraft(): ProductDraft {
    const m = this.model();
    return {
      name: m.name,
      category: (m.category as ProductCategory | '') || undefined,
      purchaseDate: m.purchaseDate,
      brand: m.brand || undefined,
      serialNumber: m.serialNumber || undefined,
      retailer: m.retailer || undefined,
      price:
        m.priceAmount !== null
          ? { amount: m.priceAmount, currency: m.currency || DEFAULT_CURRENCY }
          : undefined,
    };
  }

  private buildCoverageDraft(): CoverageDraft {
    const m = this.model();
    const preset = DURATION_PRESETS.find((p) => p.label === m.duration);
    const duration: CoverageDraft['duration'] = preset
      ? preset.lifetime
        ? { lifetime: true }
        : { months: preset.months }
      : { months: m.customMonths ?? 12 };
    return {
      source: m.source,
      scope: m.scope,
      duration,
      startDate: m.purchaseDate,
      expiryDate: m.manualExpiry,
      manualExpiry: m.manualExpiry !== null,
    };
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.save();
  }

  save(): void {
    submit(this.productForm, async () => {
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
        this.snackbar.open('Could Not Save. Please Try Again.', 'Close', { duration: 5000 });
      }
    });
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
