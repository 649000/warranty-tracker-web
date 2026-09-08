import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  template: `
    <button type="button" class="metric" [class]="tone()">
      <span class="metric__top">
        <span class="metric__label">{{ label() }}</span>
        <span class="metric__icon" aria-hidden="true">
          <ng-content select="[icon]" />
        </span>
      </span>
      <span class="metric__value">{{ value() }}</span>
      <span class="metric__hint">{{ hint() }}</span>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .metric {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        width: 100%;
        text-align: left;
        padding: 1.25rem 1.5rem;
        border-radius: var(--radius-md);
        background: var(--surface);
        border: 1px solid var(--outline);
        box-shadow: var(--shadow-hover);
        cursor: pointer;
        color: inherit;
        position: relative;
        overflow: hidden;
        transition:
          box-shadow 0.15s ease,
          transform 0.15s ease;
      }
      .metric:hover,
      .metric:focus-visible {
        box-shadow: var(--shadow-raised);
      }
      .metric:active {
        transform: translateY(0);
      }
      .metric::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--surface-container-highest);
      }
      .metric__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .metric__label {
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: var(--type-caption);
        font-weight: 600;
        color: var(--text-muted);
      }
      .metric__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.625rem;
        flex: none;
        color: var(--text-muted);
        background: var(--surface-container);
      }
      .metric__icon ::ng-deep mat-icon {
        font-size: 1.4rem;
        width: 1.4rem;
        height: 1.4rem;
      }
      .metric__value {
        font-size: 2.25rem;
        font-weight: 700;
        line-height: 1;
        color: var(--ink);
        font-variant-numeric: tabular-nums;
      }
      .metric__hint {
        font-size: var(--type-body-sm);
        color: var(--text-muted);
      }
      .metric.active::before {
        background: var(--status-active-dot);
      }
      .metric.active .metric__icon {
        color: var(--status-active-fg);
        background: var(--status-active-bg);
      }
      .metric.expiring::before {
        background: var(--status-expiring-dot);
      }
      .metric.expiring .metric__icon {
        color: var(--status-expiring-fg);
        background: var(--status-expiring-bg);
      }
      .metric.expired::before {
        background: var(--status-expired-dot);
      }
      .metric.expired .metric__icon {
        color: var(--status-expired-fg);
        background: var(--status-expired-bg);
      }
    `,
  ],
})
export class MetricCardComponent {
  readonly tone = input<'active' | 'expiring' | 'expired' | 'neutral'>('neutral');
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>('');
}
