import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { format, differenceInCalendarDays, differenceInMilliseconds } from 'date-fns';
import { AuthService } from '../../core/services/auth.service';
import { ProductService, type CoverageDraft } from '../../core/services/product.service';
import { ProofStorageService } from '../../core/services/proof-storage.service';
import type { Coverage, Product } from '../../core/models/warranty.model';
import {
  coverageStatus,
  nextExpiry,
  productStatus,
  type CoverageStatus,
} from '../../core/utils/coverage-status';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { ProductThumbComponent } from '../../shared/product-thumb.component';
import { CoverageDialogComponent } from './coverage-dialog.component';
import { ProofLightboxComponent } from './proof-lightbox.component';

@Component({
  selector: 'app-warranty-detail',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    StatusBadgeComponent,
    ProductThumbComponent,
    TitleCasePipe,
    DecimalPipe,
    DatePipe,
  ],
  templateUrl: './warranty-detail.component.html',
  styleUrl: './warranty-detail.component.css',
})
export class WarrantyDetailComponent {
  private readonly auth = inject(AuthService);
  private readonly products = inject(ProductService);
  private readonly proofs = inject(ProofStorageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly productId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly expanded = signal<Set<string>>(new Set());
  readonly busy = signal(false);

  constructor() {
    void this.load();
  }

  private uid(): string {
    return this.auth.user()?.uid ?? '';
  }

  private async load(): Promise<void> {
    const user = this.auth.user();
    if (user) {
      this.products.watch(user.uid);
    }
    const product = await this.products.getProduct(this.uid(), this.productId());
    if (!product) {
      this.snackbar.open('Product Not Found.', 'Close', { duration: 4000 });
      await this.router.navigateByUrl('/warranties');
      return;
    }
    this.product.set(product);
    this.loading.set(false);
  }

  readonly coverages = computed(() => this.products.coveragesFor(this.productId()));

  readonly productStatus = computed<CoverageStatus>(() =>
    this.product() ? productStatus(this.products.coveragesFor(this.product()!.id)) : 'expired',
  );

  readonly statusLabel = computed(() => {
    switch (this.productStatus()) {
      case 'active':
        return 'Active Coverage';
      case 'expiring-soon':
        return 'Expiring Soon';
      default:
        return 'Coverage Lapsed';
    }
  });

  readonly expirySummary = computed(() => {
    const product = this.product();
    if (!product) {
      return null;
    }
    const coverages = this.products.coveragesFor(product.id);
    const next = nextExpiry(coverages);
    if (!next) {
      return null;
    }
    const days = differenceInCalendarDays(next, new Date());
    return { date: next, days };
  });

  async copyText(text: string, message: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.snackbar.open(message, 'Close', { duration: 2500 });
    } catch {
      this.snackbar.open('Could Not Copy to Clipboard', 'Close', { duration: 2500 });
    }
  }

  /** Fraction (0..100) of purchase→expiry elapsed for the product's primary coverage. */
  readonly progress = computed(() => {
    const product = this.product();
    if (!product) {
      return 0;
    }
    const next = nextExpiry(this.products.coveragesFor(product.id));
    if (!next) {
      return 100;
    }
    const total = differenceInMilliseconds(next, product.purchaseDate);
    if (total <= 0) {
      return 100;
    }
    const elapsed = differenceInMilliseconds(new Date(), product.purchaseDate);
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  });

  statusOf(coverage: Coverage): CoverageStatus {
    return coverageStatus(coverage);
  }

  coverageStatusLine(coverage: Coverage): string {
    const expiry = coverageStatus(coverage);
    const date = coverage.expiryDate;
    if (coverage.duration.lifetime && !date) {
      return 'Lifetime Coverage';
    }
    if (expiry === 'expired' && date) {
      return `Expired ${format(date, 'd MMM yyyy')}`;
    }
    if (date) {
      const days = differenceInCalendarDays(date, new Date());
      if (days === 0) return 'Expires Today';
      if (days <= 60) return `Expires in ${days} Day${days === 1 ? '' : 's'}`;
      return `Covered Until ${format(date, 'd MMM yyyy')}`;
    }
    return 'Covered';
  }

  toggleExpand(id: string): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async addCoverage(): Promise<void> {
    const product = this.product();
    if (!product) return;
    const ref = this.dialog.open<CoverageDialogComponent, { startDate: Date }, CoverageDraft>(
      CoverageDialogComponent,
      { data: { startDate: product.purchaseDate }, width: '480px', maxWidth: '94vw' },
    );
    const draft = await firstValueFrom(ref.afterClosed());
    if (draft) {
      await this.products.addCoverage(this.uid(), product.id, draft);
    }
  }

  async editCoverage(coverage: Coverage): Promise<void> {
    const product = this.product();
    if (!product) return;
    const ref = this.dialog.open<
      CoverageDialogComponent,
      { startDate: Date; coverage: Coverage },
      CoverageDraft
    >(CoverageDialogComponent, {
      data: { startDate: coverage.startDate, coverage },
      width: '480px',
      maxWidth: '94vw',
    });
    const draft = await firstValueFrom(ref.afterClosed());
    if (draft) {
      await this.products.updateCoverage(this.uid(), product.id, {
        ...draft,
        id: coverage.id,
        expiryDate: draft.expiryDate ?? null,
        manualExpiry: draft.manualExpiry ?? false,
        createdAt: coverage.createdAt,
      });
    }
  }

  async deleteCoverage(coverage: Coverage): Promise<void> {
    const product = this.product();
    if (!product) return;
    if (!window.confirm('Remove This Coverage?')) return;
    await this.products.deleteCoverage(this.uid(), product.id, coverage.id);
  }

  async deleteProduct(): Promise<void> {
    const product = this.product();
    if (!product) return;
    if (!window.confirm('Delete This Product and All Its Data? This Cannot Be Undone.')) return;
    this.busy.set(true);
    try {
      if (product.proofOfPurchase?.storagePath) {
        await this.proofs.deleteProof(product.proofOfPurchase.storagePath);
      }
      await this.products.deleteProduct(this.uid(), product.id);
      await this.router.navigateByUrl('/warranties');
    } finally {
      this.busy.set(false);
    }
  }

  async viewProof(): Promise<void> {
    const proof = this.product()?.proofOfPurchase;
    if (!proof || proof.type === 'text' || !proof.storagePath) return;
    try {
      const url = await this.proofs.downloadUrl(proof.storagePath);
      if (proof.type === 'image') {
        this.dialog.open(ProofLightboxComponent, {
          data: { url, alt: this.product()?.name ?? 'Proof of purchase' },
          maxWidth: '94vw',
          maxHeight: '94vh',
        });
      } else {
        window.open(url, '_blank', 'noopener');
      }
    } catch {
      this.snackbar.open('Could Not Load the Proof File.', 'Close', { duration: 4000 });
    }
  }

  async deleteProof(): Promise<void> {
    const product = this.product();
    if (!product) return;
    if (!window.confirm('Remove This Proof of Purchase?')) return;
    if (product.proofOfPurchase?.storagePath) {
      await this.proofs.deleteProof(product.proofOfPurchase.storagePath);
    }
    await this.products.setProofOfPurchase(this.uid(), product.id, null);
    this.product.update((p) => (p ? { ...p, proofOfPurchase: undefined } : p));
  }
}
