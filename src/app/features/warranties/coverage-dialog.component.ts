import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DURATION_PRESETS } from '../../core/models/catalog';
import type { Coverage, CoverageScope, CoverageSource } from '../../core/models/warranty.model';
import type { CoverageDraft } from '../../core/services/product.service';

export interface CoverageDialogData {
  startDate: Date;
  coverage?: Coverage;
}

@Component({
  selector: 'app-coverage-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  templateUrl: './coverage-dialog.component.html',
  styleUrl: './coverage-dialog.component.css',
})
export class CoverageDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CoverageDialogComponent>);
  readonly data = inject<CoverageDialogData>(MAT_DIALOG_DATA);

  readonly sources: CoverageSource[] = ['manufacturer', 'retailer', 'international', 'other'];
  readonly presets = DURATION_PRESETS;

  source: CoverageSource = this.data.coverage?.source ?? 'manufacturer';
  scope: CoverageScope = this.data.coverage?.scope ?? 'local';
  durationLabel: string = this.resolveDurationLabel();
  customMonths: number | null = this.resolveCustomMonths();
  manualExpiry: Date | null = this.data.coverage?.expiryDate ?? null;
  hotline: string = this.data.coverage?.contact?.hotline ?? '';
  contactEmail: string = this.data.coverage?.contact?.email ?? '';
  contactUrl: string = this.data.coverage?.contact?.url ?? '';
  notes: string = this.data.coverage?.notes ?? '';

  private resolveDurationLabel(): string {
    const c = this.data.coverage;
    if (!c) return '12';
    if (c.duration.lifetime) return 'Lifetime';
    const months = c.duration.months;
    const preset = DURATION_PRESETS.find((p) => p.months === months);
    return preset ? preset.label : 'Custom';
  }

  private resolveCustomMonths(): number | null {
    const c = this.data.coverage;
    if (!c || c.duration.lifetime) return null;
    const preset = DURATION_PRESETS.find((p) => p.months === c.duration.months);
    return preset ? null : (c.duration.months ?? null);
  }

  onSource(source: CoverageSource): void {
    this.source = source;
    if (source === 'retailer') {
      this.scope = 'local';
    }
  }

  valid(): boolean {
    if (this.durationLabel === 'Custom') {
      return this.customMonths != null && this.customMonths > 0;
    }
    return true;
  }

  save(): void {
    const preset = DURATION_PRESETS.find((p) => p.label === this.durationLabel);
    const duration = preset
      ? preset.lifetime
        ? { lifetime: true as const }
        : { months: preset.months as number }
      : { months: this.customMonths ?? 12 };
    const contact =
      this.hotline || this.contactEmail || this.contactUrl
        ? {
            hotline: this.hotline || undefined,
            email: this.contactEmail || undefined,
            url: this.contactUrl || undefined,
          }
        : undefined;
    const draft: CoverageDraft = {
      source: this.source,
      scope: this.scope,
      duration,
      startDate: this.data.startDate,
      expiryDate: this.manualExpiry,
      manualExpiry: this.manualExpiry !== null,
      contact,
      notes: this.notes || undefined,
    };
    this.dialogRef.close(draft);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
