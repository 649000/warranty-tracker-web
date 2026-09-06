import { Component, computed, input } from '@angular/core';
import type { CoverageStatus } from '../core/utils/coverage-status';

const LABELS: Record<CoverageStatus, string> = {
  active: 'Covered',
  'expiring-soon': 'Expiring soon',
  expired: 'Expired',
};

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="badge" [class]="status()" role="status">
      <span class="dot" aria-hidden="true"></span>{{ label() }}
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.15rem 0.6rem;
        border-radius: var(--radius-full);
        font-size: var(--type-caption);
        font-weight: 500;
        line-height: 1.4;
      }
      .dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: currentColor;
        flex: none;
      }
      .active {
        color: light-dark(#2e7d5b, #82c9a8);
        background: color-mix(in srgb, currentColor 14%, transparent);
      }
      .expiring-soon {
        color: light-dark(#9a6b00, #e8c36a);
        background: color-mix(in srgb, currentColor 16%, transparent);
      }
      .expired {
        color: light-dark(#6b7574, #aeb8b6);
        background: color-mix(in srgb, currentColor 14%, transparent);
      }
    `,
  ],
})
export class StatusBadgeComponent {
  readonly status = input<CoverageStatus>('active');
  readonly label = computed(() => LABELS[this.status()]);
}
