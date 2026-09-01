import { Service, signal } from '@angular/core';

const STORAGE_KEY = 'warranty-tracker-theme';

@Service()
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>('light');

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    this.theme.set(stored === 'dark' || (stored === null && prefersDark) ? 'dark' : 'light');
    this.apply();
  }

  toggle(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
    this.apply();
  }

  private apply(): void {
    document.documentElement.classList.toggle('dark', this.theme() === 'dark');
    localStorage.setItem(STORAGE_KEY, this.theme());
  }
}
