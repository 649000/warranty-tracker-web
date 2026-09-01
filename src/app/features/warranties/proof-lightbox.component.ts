import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-proof-lightbox',
  imports: [MatDialogModule],
  template: `
    <div class="lightbox">
      <img [src]="data.url" [alt]="data.alt" />
    </div>
  `,
  styles: [
    `
      .lightbox {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
      }
      img {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
      }
    `,
  ],
})
export class ProofLightboxComponent {
  readonly data = inject<{ url: string; alt: string }>(MAT_DIALOG_DATA);
}
