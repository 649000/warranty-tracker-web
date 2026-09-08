import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

const CATEGORY_ICON: Record<string, string> = {
  Audio: 'headphones',
  Appliances: 'kitchen',
  'Phones & Tablets': 'smartphone',
  Computers: 'laptop_mac',
  'TVs & Monitors': 'tv',
  Cameras: 'photo_camera',
  Wearables: 'watch',
  'Home & Living': 'chair',
};

@Component({
  selector: 'app-product-thumb',
  imports: [MatIconModule],
  template: `
    <span
      class="thumb"
      [class.thumb--lg]="size() === 'lg'"
      role="img"
      [attr.aria-label]="ariaLabel()"
    >
      <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
    </span>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .thumb {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        background: var(--surface-container);
        color: var(--secondary);
        flex: none;
      }
      .thumb mat-icon {
        font-size: 1.6rem;
        width: 1.6rem;
        height: 1.6rem;
      }
      .thumb--lg {
        width: 80px;
        height: 80px;
      }
      .thumb--lg mat-icon {
        font-size: 2.4rem;
        width: 2.4rem;
        height: 2.4rem;
      }
    `,
  ],
})
export class ProductThumbComponent {
  readonly category = input<string | undefined>('');
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'lg'>('sm');

  readonly icon = computed(() => {
    const category = this.category();
    return (category && CATEGORY_ICON[category]) || 'devices_other';
  });

  readonly ariaLabel = computed(() => `${this.name()} product icon`);
}
