import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { format, differenceInCalendarDays, differenceInMilliseconds } from 'date-fns';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import type { Product } from '../../core/models/warranty.model';
import { nextExpiry, productStatus, type CoverageStatus } from '../../core/utils/coverage-status';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { MetricCardComponent } from '../../shared/metric-card.component';
import { ProductThumbComponent } from '../../shared/product-thumb.component';

type Filter = 'all' | CoverageStatus;

interface FilterOption {
  value: Filter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expiring-soon', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
];

interface ListItem {
  product: Product;
  status: CoverageStatus;
  nextExpiry: Date | null;
  daysLeft: number | null;
  coveragesCount: number;
}

@Component({
  selector: 'app-warranty-list',
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    StatusBadgeComponent,
    MetricCardComponent,
    ProductThumbComponent,
  ],
  templateUrl: './warranty-list.component.html',
  styleUrl: './warranty-list.component.css',
})
export class WarrantyListComponent {
  private readonly auth = inject(AuthService);
  private readonly snackbar = inject(MatSnackBar);
  readonly products = inject(ProductService);

  readonly filter = signal<Filter>('all');
  readonly query = signal('');
  readonly loaded = this.products.loaded;
  readonly filterOptions = FILTER_OPTIONS;

  constructor() {
    const user = this.auth.user();
    if (user) {
      this.products.watch(user.uid);
    }
  }

  /** Re-subscribes to the user's products after a load failure. */
  retry(): void {
    const user = this.auth.user();
    if (user) {
      this.products.watch(user.uid);
    }
  }

  private readonly items = computed<ListItem[]>(() => {
    const today = new Date();
    const result: ListItem[] = [];
    for (const product of this.products.products()) {
      const coverages = this.products.coveragesFor(product.id);
      const status = productStatus(coverages, today);
      const next = nextExpiry(coverages, today);
      result.push({
        product,
        status,
        nextExpiry: next,
        daysLeft: next ? differenceInCalendarDays(next, today) : null,
        coveragesCount: coverages.length,
      });
    }
    const rank: Record<CoverageStatus, number> = { 'expiring-soon': 0, active: 1, expired: 2 };
    result.sort((a, b) => {
      const rankDiff = rank[a.status] - rank[b.status];
      if (rankDiff !== 0) {
        return rankDiff;
      }
      const aDate = a.nextExpiry?.getTime() ?? Number.POSITIVE_INFINITY;
      const bDate = b.nextExpiry?.getTime() ?? Number.POSITIVE_INFINITY;
      return aDate - bDate;
    });
    return result;
  });

  readonly filtered = computed(() => {
    const items = this.items();
    const filter = this.filter();
    const q = this.query().trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = filter === 'all' || item.status === filter;
      if (!matchesStatus) {
        return false;
      }
      if (!q) {
        return true;
      }
      const p = item.product;
      return [p.name, p.brand, p.serialNumber, p.retailer]
        .filter(Boolean)
        .some((value) => (value as string).toLowerCase().includes(q));
    });
  });

  readonly counts = computed(() => {
    const counts: Record<Filter, number> = { all: 0, active: 0, 'expiring-soon': 0, expired: 0 };
    for (const item of this.items()) {
      counts.all++;
      counts[item.status]++;
    }
    return counts;
  });

  setFilter(filter: Filter): void {
    this.filter.set(filter);
  }

  clearQuery(): void {
    this.query.set('');
  }

  statusLine(item: ListItem): string {
    if (item.status === 'expiring-soon') {
      return item.daysLeft === 0
        ? 'Expires Today'
        : `Expires in ${item.daysLeft} Day${item.daysLeft === 1 ? '' : 's'}`;
    }
    if (item.status === 'active') {
      return item.nextExpiry
        ? `Covered Until ${format(item.nextExpiry, 'd MMM yyyy')}`
        : 'Lifetime Coverage';
    }
    return item.nextExpiry
      ? `Expired ${format(item.nextExpiry, 'd MMM yyyy')}`
      : 'No Active Coverage';
  }

  /** Coverage clock label: active shows expiry, expiring shows days-left, expired shows lapsed. */
  timelineLabel(item: ListItem): string {
    if (item.status === 'expired') {
      return item.nextExpiry
        ? `Expired ${format(item.nextExpiry, 'd MMM yyyy')}`
        : 'No Active Coverage';
    }
    if (item.status === 'expiring-soon') {
      return item.daysLeft === 0
        ? 'Expires Today'
        : `${item.daysLeft} Day${item.daysLeft === 1 ? '' : 's'} Left`;
    }
    return item.nextExpiry ? `Covered Until ${format(item.nextExpiry, 'd MMM yyyy')}` : 'Lifetime';
  }

  /** Fraction (0..100) of purchase→expiry elapsed, for the card progress bar. */
  progress(item: ListItem): number {
    if (item.status === 'expired' || !item.nextExpiry) {
      return item.status === 'expired' ? 100 : 0;
    }
    const total = differenceInMilliseconds(item.nextExpiry, item.product.purchaseDate);
    if (total <= 0) {
      return 100;
    }
    const elapsed = differenceInMilliseconds(new Date(), item.product.purchaseDate);
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }

  purchaseLine(item: ListItem): string {
    return `Purchased ${format(item.product.purchaseDate, 'd MMM yyyy')}`;
  }

  async copySerial(item: ListItem): Promise<void> {
    const serial = item.product.serialNumber;
    if (!serial) {
      return;
    }
    try {
      await navigator.clipboard.writeText(serial);
      this.snackbar.open('Serial Number Copied', 'Close', { duration: 2500 });
    } catch {
      this.snackbar.open('Could Not Copy Serial Number', 'Close', { duration: 2500 });
    }
  }
}
