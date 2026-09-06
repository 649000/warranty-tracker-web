import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../core/services/theme.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  private readonly themeService = inject(ThemeService);

  readonly themeIcon = this.themeService.modeIcon;
  readonly themeLabel = this.themeService.modeLabel;

  cycleTheme(): void {
    this.themeService.cycle();
  }
}
