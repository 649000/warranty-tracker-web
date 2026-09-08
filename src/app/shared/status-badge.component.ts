import { Component, computed, input } from '@angular/core';
import type { CoverageStatus } from '../core/utils/coverage-status';

const LABELS: Record<CoverageStatus, string> = {
  active: 'Active',
  'expiring-soon': 'Expiring Soon',
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
        gap: 0.4rem;
        padding: 0.15rem 0.75rem;
        border-radius: var(--radius-full);
        font-size: var(--type-caption);
        font-weight: 600;
        line-height: 1.4;
        white-space: nowrap;
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex: none;
      }
      .active {
        color: var(--status-active-fg);
        background: var(--status-active-bg);
        border: 1px solid var(--status-active-border);
      }
      .active .dot {
        background: var(--status-active-dot);
      }
      .expiring-soon {
        color: var(--status-expiring-fg);
        background: var(--status-expiring-bg);
        border: 1px solid var(--status-expiring-border);
      }
      .expiring-soon .dot {
        background: var(--status-expiring-dot);
      }
      .expired {
        color: var(--status-expired-fg);
        background: var(--status-expired-bg);
        border: 1px solid var(--status-expired-border);
      }
      .expired .dot {
        background: var(--status-expired-dot);
      }
    `,
  ],
})
export class StatusBadgeComponent {
  readonly status = input<CoverageStatus>('active');
  readonly label = computed(() => LABELS[this.status()]);
}
