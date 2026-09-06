import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { ProductService } from '../core/services/product.service';
import { ProofStorageService } from '../core/services/proof-storage.service';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatIconButton,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly products = inject(ProductService);
  private readonly proofs = inject(ProofStorageService);
  private readonly router = inject(Router);

  readonly displayName = this.auth.displayName;
  readonly themeIcon = this.themeService.modeIcon;
  readonly themeLabel = this.themeService.modeLabel;
  readonly userEmail = computed(() => this.auth.user()?.email ?? '');

  cycleTheme(): void {
    this.themeService.cycle();
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.products.stopWatching();
    await this.router.navigateByUrl('/');
  }

  async deleteAccount(): Promise<void> {
    const user = this.auth.user();
    if (!user) {
      return;
    }
    if (!window.confirm('Delete your account and all warranty data? This cannot be undone.')) {
      return;
    }
    await this.products.deleteAllProducts(user.uid);
    await this.proofs.deleteAllUserFiles(user.uid);
    await this.auth.removeAccount();
    this.products.stopWatching();
    await this.router.navigateByUrl('/');
  }
}
