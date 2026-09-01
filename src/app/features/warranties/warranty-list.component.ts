import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { format, differenceInCalendarDays } from 'date-fns';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import type { Product } from '../../core/models/warranty.model';
import { nextExpiry, productStatus, type CoverageStatus } from '../../core/utils/coverage-status';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

type Filter = 'all' | CoverageStatus;

interface FilterOption {
  value: Filter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expiring-soon', label: 'Expiring soon' },
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
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    StatusBadgeComponent,
  ],
  templateUrl: './warranty-list.component.html',
  styleUrl: './warranty-list.component.css',
})
export class WarrantyListComponent {
  private readonly auth = inject(AuthService);
  readonly products = inject(ProductService);

  readonly filter = signal<Filter>('all');
  readonly loaded = this.products.loaded;
  readonly filterOptions = FILTER_OPTIONS;

  constructor() {
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
    return filter === 'all' ? items : items.filter((item) => item.status === filter);
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

  statusLine(item: ListItem): string {
    if (item.status === 'expiring-soon') {
      return item.daysLeft === 0
        ? 'Expires today'
        : `Expires in ${item.daysLeft} day${item.daysLeft === 1 ? '' : 's'}`;
    }
    if (item.status === 'active') {
      return item.nextExpiry
        ? `Covered until ${format(item.nextExpiry, 'd MMM yyyy')}`
        : 'Lifetime coverage';
    }
    return item.nextExpiry
      ? `Expired ${format(item.nextExpiry, 'd MMM yyyy')}`
      : 'No active coverage';
  }
}
