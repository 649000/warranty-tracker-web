import { Component, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { form, FormField, required, submit, validate } from '@angular/forms/signals';
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
import type {
  Coverage,
  CoverageContact,
  CoverageScope,
  CoverageSource,
} from '../../core/models/warranty.model';
import type { CoverageDraft } from '../../core/services/product.service';
import {
  customMonthsError,
  optionalEmailError,
  optionalUrlError,
} from '../../core/utils/validation';

export interface CoverageDialogData {
  startDate: Date;
  coverage?: Coverage;
  /** Contact details suggested by the claim directory, used to prefill empty fields. */
  suggestedContact?: CoverageContact;
}

export interface CoverageDialogModel {
  source: CoverageSource;
  scope: CoverageScope;
  duration: string;
  customMonths: number | null;
  manualExpiry: Date | null;
  hotline: string;
  contactEmail: string;
  contactUrl: string;
  notes: string;
}

function hasContact(contact: CoverageContact | undefined): boolean {
  return !!contact && !!(contact.hotline || contact.email || contact.url);
}

/** Builds a contact object, omitting empty fields (Firestore rejects undefined). */
function buildContact(m: CoverageDialogModel): CoverageContact | undefined {
  const contact: CoverageContact = {};
  if (m.hotline) contact.hotline = m.hotline;
  if (m.contactEmail) contact.email = m.contactEmail;
  if (m.contactUrl) contact.url = m.contactUrl;
  return hasContact(contact) ? contact : undefined;
}

const DEFAULT_MODEL: CoverageDialogModel = {
  source: 'manufacturer',
  scope: 'local',
  duration: '12',
  customMonths: null,
  manualExpiry: null,
  hotline: '',
  contactEmail: '',
  contactUrl: '',
  notes: '',
};

@Component({
  selector: 'app-coverage-dialog',
  imports: [
    FormField,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    TitleCasePipe,
  ],
  templateUrl: './coverage-dialog.component.html',
  styleUrl: './coverage-dialog.component.css',
})
export class CoverageDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CoverageDialogComponent>);
  readonly data = inject<CoverageDialogData>(MAT_DIALOG_DATA);

  readonly sources: CoverageSource[] = ['manufacturer', 'retailer', 'international', 'other'];
  readonly presets = DURATION_PRESETS;
  readonly editing = this.data.coverage !== undefined;

  readonly model = signal<CoverageDialogModel>(this.resolveInitialModel());

  readonly dialogForm = form(this.model, (s) => {
    required(s.source, { message: 'Select a Coverage Source' });
    required(s.scope, { message: 'Select a Coverage Scope' });
    required(s.duration, { message: 'Select a Duration' });

    validate(s.customMonths, ({ value, valueOf }) => {
      if (valueOf(s.duration) !== 'Custom') {
        return undefined;
      }
      return customMonthsError(value());
    });

    validate(s.contactEmail, ({ value }) => optionalEmailError(value()));
    validate(s.contactUrl, ({ value }) => optionalUrlError(value()));

    validate(s.manualExpiry, ({ value }) => {
      const expiry = value();
      if (!expiry) {
        return undefined;
      }
      if (expiry.getTime() < this.data.startDate.getTime()) {
        return {
          kind: 'expiryBeforeStart',
          message: 'Expiry Date Cannot Be Before the Coverage Start Date',
        };
      }
      return undefined;
    });
  });

  /** True when the contact fields were prefilled from the directory (not a user override). */
  private get prefilledFromSuggestion(): boolean {
    return !hasContact(this.data.coverage?.contact) && !!this.data.suggestedContact;
  }

  /** True when the contact fields still match the directory suggestion. */
  private prefillUnchanged(m: CoverageDialogModel): boolean {
    const s = this.data.suggestedContact;
    if (!s) {
      return false;
    }
    return (
      m.hotline === (s.hotline ?? '') &&
      m.contactEmail === (s.email ?? '') &&
      m.contactUrl === (s.url ?? '')
    );
  }

  private resolveInitialModel(): CoverageDialogModel {
    const c = this.data.coverage;
    // A user override replaces the suggestion entirely; only fall back to the
    // directory when the coverage has no user-entered contact.
    const base = hasContact(c?.contact) ? c!.contact : this.data.suggestedContact;
    const hotline = base?.hotline ?? '';
    const contactEmail = base?.email ?? '';
    const contactUrl = base?.url ?? '';
    if (!c) {
      return { ...DEFAULT_MODEL, hotline, contactEmail, contactUrl };
    }
    const preset = c.duration.lifetime
      ? undefined
      : DURATION_PRESETS.find((p) => p.months === c.duration.months);
    const duration = c.duration.lifetime ? 'Lifetime' : preset ? preset.label : 'Custom';
    const customMonths = preset ? null : (c.duration.months ?? null);
    return {
      source: c.source,
      scope: c.scope,
      duration,
      customMonths,
      manualExpiry: c.expiryDate,
      hotline,
      contactEmail,
      contactUrl,
      notes: c.notes ?? '',
    };
  }

  onSource(source: CoverageSource): void {
    this.model.update((m) => ({
      ...m,
      source,
      scope: source === 'retailer' ? 'local' : m.scope,
    }));
  }

  onScope(scope: CoverageScope): void {
    this.model.update((m) => ({ ...m, scope }));
  }

  onDuration(label: string): void {
    this.model.update((m) => ({ ...m, duration: label }));
  }

  save(): void {
    submit(this.dialogForm, async () => {
      const m = this.model();
      const preset = DURATION_PRESETS.find((p) => p.label === m.duration);
      const duration = preset
        ? preset.lifetime
          ? { lifetime: true as const }
          : { months: preset.months as number }
        : { months: m.customMonths ?? 12 };
      // An untouched directory prefill is not stored; it stays a live suggestion.
      const contact =
        this.prefilledFromSuggestion && this.prefillUnchanged(m) ? undefined : buildContact(m);
      const draft: CoverageDraft = {
        source: m.source,
        scope: m.scope,
        duration,
        startDate: this.data.startDate,
        expiryDate: m.manualExpiry,
        manualExpiry: m.manualExpiry !== null,
        contact,
        notes: m.notes || undefined,
      };
      this.dialogRef.close(draft);
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
