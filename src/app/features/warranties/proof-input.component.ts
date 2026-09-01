import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import type { ProofOfPurchase } from '../../core/models/warranty.model';

export interface ProofDraft {
  /** Resolved proof reference (text, or an upload described by storagePath if already uploaded). */
  proof: ProofOfPurchase | null;
  /** A file still waiting to be uploaded, or null. */
  file: File | null;
}

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

@Component({
  selector: 'app-proof-input',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  templateUrl: './proof-input.component.html',
  styleUrl: './proof-input.component.css',
})
export class ProofInputComponent {
  private readonly snackbar = inject(MatSnackBar);

  readonly mode = signal<'none' | 'text' | 'image' | 'pdf'>('none');
  readonly text = signal('');
  readonly pendingFile = model<File | null>(null);
  readonly current = model<ProofOfPurchase | null>(null);

  /** Human-readable label of the currently selected proof. */
  readonly summary = computed(() => {
    const proof = this.current();
    if (!proof) {
      return null;
    }
    if (proof.type === 'text') {
      return proof.text;
    }
    return proof.fileName ?? (proof.type === 'image' ? 'Photo proof' : 'PDF proof');
  });

  choose(mode: 'text' | 'image' | 'pdf'): void {
    this.mode.set(mode);
    this.emit();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (this.mode() === 'image' && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      this.snackbar.open('Please choose a PNG, JPEG or WebP photo.', 'Close', { duration: 5000 });
      return;
    }
    if (this.mode() === 'pdf' && file.type !== 'application/pdf') {
      this.snackbar.open('Please choose a PDF file.', 'Close', { duration: 5000 });
      return;
    }
    this.pendingFile.set(file);
    this.emit();
  }

  setText(value: string): void {
    this.text.set(value);
    this.emit();
  }

  remove(): void {
    this.mode.set('none');
    this.text.set('');
    this.pendingFile.set(null);
    this.current.set(null);
    this.emit();
  }

  private emit(): void {
    if (this.mode() === 'text' && this.text().trim()) {
      this.current.set({ type: 'text', text: this.text().trim() });
    } else if (this.pendingFile()) {
      this.current.set({
        type: (this.mode() === 'image' ? 'image' : 'pdf') as ProofOfPurchase['type'],
        fileName: this.pendingFile()!.name,
      });
    } else {
      this.current.set(null);
    }
  }
}
