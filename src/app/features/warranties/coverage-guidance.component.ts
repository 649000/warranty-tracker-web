import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { CoverageGuidance, GuidanceVerdict } from '../../core/models/coverage-guidance';

@Component({
  selector: 'app-coverage-guidance',
  imports: [MatIconModule],
  templateUrl: './coverage-guidance.component.html',
  styleUrl: './coverage-guidance.component.css',
})
export class CoverageGuidanceComponent {
  readonly guidance = input.required<CoverageGuidance>();

  verdictLabel(verdict: GuidanceVerdict): string {
    switch (verdict) {
      case 'covered':
        return 'Typically Covered';
      case 'excluded':
        return 'Typically Excluded';
      default:
        return 'Varies';
    }
  }
}
