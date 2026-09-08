import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, MatIconButton, MatButton, MatIconModule],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.css',
})
export class SiteHeaderComponent {
  private readonly themeService = inject(ThemeService);

  readonly themeIcon = this.themeService.modeIcon;
  readonly themeLabel = this.themeService.modeLabel;

  cycleTheme(): void {
    this.themeService.cycle();
  }
}
