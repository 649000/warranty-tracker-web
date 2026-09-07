import { Service, computed, signal, type OnDestroy } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'warranty-tracker-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

@Service()
export class ThemeService implements OnDestroy {
  readonly mode = signal<ThemeMode>('system');
  readonly theme = signal<ResolvedTheme>('light');

  readonly modeIcon = computed(() => {
    switch (this.mode()) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      default:
        return 'brightness_auto';
    }
  });

  readonly modeLabel = computed(() => {
    switch (this.mode()) {
      case 'system':
        return 'Theme: Following System. Switch to Light Mode.';
      case 'light':
        return 'Theme: Light. Switch to Dark Mode.';
      default:
        return 'Theme: Dark. Switch to Follow System.';
    }
  });

  private readonly media = window.matchMedia?.(DARK_QUERY);

  private readonly handleSystemChange = (): void => {
    if (this.mode() === 'system') {
      this.apply();
    }
  };

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      this.mode.set(stored);
    }
    this.media?.addEventListener('change', this.handleSystemChange);
    this.apply();
  }

  cycle(): void {
    this.mode.set(NEXT_MODE[this.mode()]);
    localStorage.setItem(STORAGE_KEY, this.mode());
    this.apply();
  }

  ngOnDestroy(): void {
    this.media?.removeEventListener('change', this.handleSystemChange);
  }

  private apply(): void {
    const mode = this.mode();
    const prefersDark = this.media?.matches ?? false;
    const resolved: ResolvedTheme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
    this.theme.set(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }
}
